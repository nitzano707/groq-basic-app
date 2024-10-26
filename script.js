async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    const responseDiv = document.getElementById('response');
    
    responseDiv.textContent = 'מעבד את הבקשה...';

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "mixtral-8x7b-32768",
                messages: [
                    { role: "user", content: userInput }
                ]
            })
        });

        const data = await response.json();
        responseDiv.textContent = data.choices[0].message.content;
    } catch (error) {
        responseDiv.textContent = 'אירעה שגיאה: ' + error.message;
    }
}
