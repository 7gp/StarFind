// Discord Webhook URL (replace this with your webhook URL)
const webhookURL = "YOUR_DISCORD_WEBHOOK_URL";

// Add event listener for the button
document.getElementById('sendToDiscord').addEventListener('click', () => {
    const location = document.getElementById('starLocation').value;
    const time = document.getElementById('starTime').value;

    if (!location || !time) {
        alert('Please fill in both the location and time.');
        return;
    }

    const message = {
        content: `🌟 **Shooting Star Alert** 🌟\nLocation: **${location}**\nTime: **${time}**`,
    };

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    })
        .then(response => {
            if (response.ok) {
                alert('Star details sent to Discord!');
            } else {
                alert('Failed to send details. Please check your webhook URL.');
            }
        })
        .catch(error => console.error('Error:', error));
});
