async function handleFile(file) {
    if (!file.type.startsWith('audio/')) {
        alert('אנא העלה קובץ אודיו בלבד');
        return;
    }

    status.textContent = 'מעבד את הקובץ...';
    progress.style.display = 'block';
    transcription.textContent = '';

    try {
        // יצירת FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', 'whisper-large-v3-turbo');
        formData.append('language', 'he');

        // שליחה ל-GROQ
        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_GROQ_API_KEY'
                // שים לב: לא מוסיפים Content-Type כי FormData מגדיר אותו אוטומטית
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `שגיאת שרת: ${response.status}`);
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
