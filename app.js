const webhookURL = "YOUR_DISCORD_WEBHOOK_URL";
let starReports = [];
let captureInterval = null;

// Start capturing chat
document.getElementById('startCapture').addEventListener('click', () => {
    if (!window.alt1) {
        alert('Please run this app in the Alt1 Toolkit!');
        return;
    }

    if (!alt1.permissionPixel) {
        alert('Alt1 does not have permission to capture your screen!');
        return;
    }

    document.getElementById('startCapture').disabled = true;
    document.getElementById('stopCapture').disabled = false;

    captureInterval = setInterval(() => {
        const chat = alt1.chatbox.read();
        if (chat) {
            chat.messages.forEach((msg) => {
                if (msg.text.includes("shooting star")) {
                    processStarMessage(msg.text);
                }
            });
        }
    }, 1000);
});

// Stop capturing chat
document.getElementById('stopCapture').addEventListener('click', () => {
    clearInterval(captureInterval);
    document.getElementById('startCapture').disabled = false;
    document.getElementById('stopCapture').disabled = true;
});

// Process detected star messages
function processStarMessage(text) {
    const starRegex = /shooting star\s+in\s+(World \d+)\s+at\s+(.+)\s+at\s+(.+)/i;
    const match = text.match(starRegex);

    if (match) {
        const world = match[1];
        const location = match[2];
        const time = match[3];

        const existingReport = starReports.find((r) => r.world === world && r.location === location);
        if (!existingReport) {
            starReports.push({ world, location, time });

            // Update list
            const starList = document.getElementById('stars');
            const li = document.createElement('li');
            li.textContent = `${world}: ${location} at ${time}`;
            starList.appendChild(li);

            document.getElementById('sendToDiscord').disabled = false;
        }
    }
}

// Send the list to Discord
document.getElementById('sendToDiscord').addEventListener('click', () => {
    if (starReports.length === 0) {
        alert('No star reports to send!');
        return;
    }

    const message = {
        content: '**🌟 Shooting Star Alerts 🌟**\n' +
            starReports.map((star) => `- **${star.world}**: ${star.location} at ${star.time}`).join('\n'),
    };

    fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
    })
        .then((response) => {
            if (response.ok) {
                alert('Star list sent to Discord!');
                starReports = [];
                document.getElementById('stars').innerHTML = '';
                document.getElementById('sendToDiscord').disabled = true;
            } else {
                alert('Failed to send to Discord. Check your webhook URL.');
            }
        })
        .catch((error) => console.error('Error:', error));
});
