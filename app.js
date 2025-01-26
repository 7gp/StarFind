const webhookURL = "https://discord.com/api/webhooks/1333176484793290825/XoT2Ei0p-4Wz8-1HCP7-Z3QKPWanbJSNoVEE52nNvrCpEZFYRidtd_SneIrGip2RsvHa
"; // Replace with your webhook URL
let monitoring = false;
let starReports = [];

// Start monitoring chat for shooting stars
document.getElementById("startMonitoring").addEventListener("click", () => {
    if (!alt1 || !alt1.permissionPixel) {
        alert("Please run this app in the Alt1 Toolkit with screen capture permissions enabled!");
        return;
    }

    monitoring = true;
    document.getElementById("startMonitoring").disabled = true;
    document.getElementById("stopMonitoring").disabled = false;

    const monitorInterval = setInterval(() => {
        if (!monitoring) {
            clearInterval(monitorInterval);
            return;
        }

        const chatData = alt1.chatbox.read();
        if (chatData && chatData.messages) {
            chatData.messages.forEach((message) => {
                if (message.text.includes("shooting star")) {
                    processStarMessage(message.text);
                }
            });
        }
    }, 1000); // Poll every second
});

// Stop monitoring chat
document.getElementById("stopMonitoring").addEventListener("click", () => {
    monitoring = false;
    document.getElementById("startMonitoring").disabled = false;
    document.getElementById("stopMonitoring").disabled = true;
});

// Process detected star message
function processStarMessage(text) {
    const starRegex = /shooting star\s+in\s+(World \d+)\s+at\s+(.+)\s+at\s+(.+)/i;
    const match = text.match(starRegex);

    if (match) {
        const [_, world, location, time] = match;

        // Check for duplicates
        const existingReport = starReports.find((r) => r.world === world && r.location === location);
        if (!existingReport) {
            starReports.push({ world, location, time });

            // Update the UI
            const starList = document.getElementById("stars");
            const li = document.createElement("li");
            li.textContent = `${world}: ${location} at ${time}`;
            starList.appendChild(li);

            document.getElementById("sendToDiscord").disabled = false;
        }
    }
}

// Send the list to Discord
document.getElementById("sendToDiscord").addEventListener("click", () => {
    if (starReports.length === 0) {
        alert("No star reports to send!");
        return;
    }

    const message = {
        content: "**🌟 Shooting Star Alerts 🌟**\n" + starReports.map(
            (star) => `- **${star.world}**: ${star.location} at ${star.time}`
        ).join("\n"),
    };

    fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to send webhook: ${response.statusText}`);
            }
            alert("Star list sent to Discord!");
            starReports = [];
            document.getElementById("stars").innerHTML = "";
            document.getElementById("sendToDiscord").disabled = true;
        })
        .catch((error) => {
            console.error("Error sending webhook:", error.message);
        });
});
