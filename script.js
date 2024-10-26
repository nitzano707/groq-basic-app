document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const progress = document.getElementById('progress');
    const status = document.getElementById('status');
    const transcription = document.getElementById('transcription');
    const downloadBtn = document.getElementById('downloadBtn');

    const groq = new GroqClient({
        apiKey: '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'
    });

    async function handleFile(file) {
        if (!file.type.startsWith('audio/')) {
            alert('אנא העלה קובץ אודיו בלבד');
            return;
        }

        status.textContent = 'מעבד את הקובץ (0%)';
        progress.value = 0;
        progress.style.display = 'block';
        transcription.textContent = '';
        downloadBtn.style.display = 'none';

        try {
            const fileStream = await file.arrayBuffer();
            
            const response = await groq.audio.transcriptions.create({
                file: new Uint8Array(fileStream),
                model: "whisper-large-v3-turbo",
                language: "he",
                response_format: "verbose_json",
                timestamp_granularities: ["segment"]
            });

            // יצירת כותרת
            const title = `תמלול אודיו מתוך קובץ "${file.name}"`;
            
            // יצירת טבלת סגמנטים
            let tableHTML = `
                <div class="transcription-title">${title}</div>
                <table class="segments-table">
                    <thead>
                        <tr>
                            <th>זמן</th>
                            <th>טקסט</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            response.segments.forEach(segment => {
                const startTime = formatTime(segment.start);
                tableHTML += `
                    <tr>
                        <td class="timestamp">${startTime}</td>
                        <td class="text">${segment.text}</td>
                    </tr>
                `;
            });

            tableHTML += '</tbody></table>';
            transcription.innerHTML = tableHTML;
            
            // הפעלת כפתור ההורדה
            downloadBtn.style.display = 'block';
            downloadBtn.onclick = () => downloadTranscription(title, response.segments);
            
            status.textContent = 'התמלול הושלם בהצלחה!';

        } catch (error) {
            status.textContent = 'אירעה שגיאה: ' + error.message;
            console.error('Error:', error);
        }

        progress.style.display = 'none';
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    }

    function downloadTranscription(title, segments) {
        let content = `${title}\n\n`;
        segments.forEach(segment => {
            content += `[${formatTime(segment.start)}] ${segment.text}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transcription.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Event Listeners
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

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });
});
