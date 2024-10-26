document.addEventListener('DOMContentLoaded', async () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const progress = document.getElementById('progress');
    const status = document.getElementById('status');
    const transcription = document.getElementById('transcription');

    // יצירת מופע של GROQ
    const groq = new GroqClient({
        apiKey: 'YOUR_GROQ_API_KEY'
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
