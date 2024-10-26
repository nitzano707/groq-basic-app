document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const progress = document.getElementById('progress');
    const status = document.getElementById('status');
    const transcription = document.getElementById('transcription');

    // יצירת מופע של GROQ
    const groq = new Groq({
        apiKey: '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'
    });

    // טיפול בגרירת קבצים
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    // טיפול בבחירת קבצים
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

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
            // המרת הקובץ לזרם נתונים
            const fileStream = await file.arrayBuffer();
            
            // שימוש ב-SDK של GROQ
            const response = await groq.audio.transcriptions.create({
                file: new Uint8Array(fileStream),
                model: "whisper-large-v3-turbo",
                response_format: "verbose_json",
                language: "he"
            });

            transcription.textContent = response.text;
            status.textContent = 'התמלול הושלם בהצלחה!';

        } catch (error) {
            status.textContent = 'אירעה שגיאה: ' + error.message;
            console.error('Error:', error);
        }

        progress.style.display = 'none';
    }
});
