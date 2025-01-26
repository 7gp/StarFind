const webhookURL = "YOUR_DISCORD_WEBHOOK_URL";

let starReports = [];

// Add star report to the list
document.getElementById('addStar').addEventListener('click', () => {
    const world = parseInt(document.getElementById('starWorld').value);
    const location = document.getElementById('starLocation').value;
    const time = document.getElementById('starTime').value;

    if (!world || !location || !time) {
        alert('Please fill in all fields.');
        return;
    }

    // Add the star report
    starReports.push({ world, location, time });

    // Sort by world number
    starReports.sort((a, b) => a.world - b.world);

    // Update the displayed list
    const starList = document.getElementById('stars');
    starList.innerHTML = '';
    starReports.forEach((star) => {
        const li = document.createElement('li');
        li.textContent = `World ${star.world}: ${star.location} at ${star.time}`;
        starList.appendChild(li);
    });

    // Clear inputs
    document.getElementById('starWorld').value = '';
    document.getElementById('starLocation').value = '';
    document.getElementById('starTime').value = '';
});

// Send the list to Discord
document.getElementById('sendToDiscord').addEventListener('click', () => {
    if (starReports.length === 0) {
        alert('No star reports to send!');
        return;
    }

    // Create a message for Discord
    const message = {
        content: '**🌟 Shooting Star Alerts 🌟**\n' + starReports.map(
            (star) => `- **World ${star.world}**: ${star.location} at ${star.time}`
        ).join('\n'),
    };

    // Send to Discord via webhook
    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    })
        .then((response) => {
            if (response.ok) {
                alert('Star list sent to Discord!');
                starReports = []; // Clear the list after sending
                document.getElementById('stars').innerHTML = '';
            } else {
                alert('Failed to send to Discord. Check your webhook URL.');
            }
        })
        .catch((error) => console.error('Error:', error));
});
