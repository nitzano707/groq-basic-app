document.addEventListener('DOMContentLoaded', async () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const progress = document.getElementById('progress');
    const status = document.getElementById('status');
    const transcription = document.getElementById('transcription');

    // יצירת מופע של GROQ
    const groq = new GroqClient({
        apiKey: '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' // החלף עם המפתח שלך
    });

    // טיפול בגרירת קבצים
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    // טיפול בבחירת קבצים
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    async function handleFile(file) {
        if (!file.type.startsWith('audio/')) {
            alert('אנא העלה קובץ אודיו בלבד');
            return;
        }

        status.textContent = 'מעבד את הקובץ...';
        progress.style.display = 'block';
        transcription.textContent = '';

        try {
            const fileStream = await file.arrayBuffer();
            
            const response = await groq.audio.transcriptions.create({
                file: new Uint8Array(fileStream),
                model: "whisper-large-v3-turbo",
                language: "he",
                response_format: "verbose_json",
                timestamp_granularities: ["segment"],
                diarization: true
            });

            // עיבוד התגובה עם זיהוי דוברים
            let formattedText = '';
            let currentSpeaker = null;

            if (response.segments && Array.isArray(response.segments)) {
                response.segments.forEach((segment, index) => {
                    // בדיקת החלפת דובר
                    if (segment.speaker !== currentSpeaker) {
                        currentSpeaker = segment.speaker;
                        formattedText += `\n\nדובר ${currentSpeaker || '?'}:\n`;
                    }
                    
                    // הוספת חותמת זמן וטקסט
                    const startTime = formatTime(segment.start);
                    const endTime = formatTime(segment.end);
                    formattedText += `[${startTime}-${endTime}] ${segment.text}\n`;
                });
            } else {
                // במקרה שאין חלוקה לדוברים, נציג את הטקסט המלא
                formattedText = response.text || 'לא זוהה טקסט';
            }

            transcription.textContent = formattedText.trim();
            status.textContent = 'התמלול הושלם בהצלחה!';

        } catch (error) {
            status.textContent = 'אירעה שגיאה: ' + error.message;
            console.error('Error:', error);
            transcription.textContent = 'אירעה שגיאה בתהליך התמלול';
        }

        progress.style.display = 'none';
    }

    // פונקציית עזר להמרת זמן לפורמט מתאים
    function formatTime(seconds) {
        if (!seconds && seconds !== 0) return "00:00";
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    }
});
