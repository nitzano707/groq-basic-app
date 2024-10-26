document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const progress = document.getElementById('progress');
    const status = document.getElementById('status');
    const transcription = document.getElementById('transcription');

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
            // המרת הקובץ ל-base64
            const base64Audio = await fileToBase64(file);
            
            // שליחה ל-GROQ
            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer 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',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "whisper-large-v3-turbo",
                    file: base64Audio,
                    language: "he"
                })
            });

            if (!response.ok) {
                throw new Error(`שגיאת שרת: ${response.status}`);
            }

            const data = await response.json();
            transcription.textContent = data.text;
            status.textContent = 'התמלול הושלם בהצלחה!';

        } catch (error) {
            status.textContent = 'אירעה שגיאה: ' + error.message;
            console.error('Error:', error);
        }

        progress.style.display = 'none';
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    }
});
