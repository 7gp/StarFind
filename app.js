const webhookURL = "https://discord.com/api/webhooks/1333176484793290825/XoT2Ei0p-4Wz8-1HCP7-Z3QKPWanbJSNoVEE52nNvrCpEZFYRidtd_SneIrGip2RsvHa";
let monitoring = false;

// Start monitoring chat for portable telescope messages
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
                // Detect portable telescope message
                if (message.text.includes("The star is visible in") && message.text.includes("and will land in")) {
                    displayTelescopeInfo(message.text);
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

// Process and display telescope info
function displayTelescopeInfo(chatMessage) {
    const telescopeRegex = /The star is visible in (.+) and will land in (.+)/i;
    const match = chatMessage.match(telescopeRegex);

    if (match) {
        const [_, location, time] = match;

        // Display the info on the page
        const starList = document.getElementById("stars");
        const li = document.createElement("li");
        li.textContent = `Location: ${location}, Time: ${time}`;
        starList.appendChild(li);

        // Optional: Send the information to Discord
        sendToDiscord(`🌟 Shooting Star Alert 🌟\nLocation: ${location}\nLanding in: ${time}`);
    }
}

// Send telescope info to Discord
function sendToDiscord(message) {
    fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to send webhook: ${response.statusText}`);
            }
            console.log("Message sent to Discord:", message);
        })
        .catch((error) => {
            console.error("Error sending webhook:", error.message);
        });
}
