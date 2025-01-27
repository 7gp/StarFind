console.log("app.js loaded successfully"); // Confirm the script is loaded

A1lib.identifyApp("appconfig.json"); // Identify the app

let stars = [];
let monitoring = false;
const webhookURL = "https://discord.com/api/webhooks/1333176484793290825/XoT2Ei0p-4Wz8-1HCP7-Z3QKPWanbJSNoVEE52nNvrCpEZFYRidtd_SneIrGip2RsvHa";
let dialogReader = new DialogTextReader();

document.getElementById("startMonitoring").addEventListener("click", () => {
    console.log("Start Monitoring button clicked");
    monitoring = true;

    document.getElementById("startMonitoring").disabled = true;
    document.getElementById("stopMonitoring").disabled = false;

    const monitorInterval = setInterval(() => {
        if (!monitoring) {
            clearInterval(monitorInterval);
            console.log("Monitoring stopped.");
            return;
        }

        detectDialog(); // Check for dialog text
    }, 1000); // Poll every second
});

document.getElementById("stopMonitoring").addEventListener("click", () => {
    console.log("Stop Monitoring button clicked");
    monitoring = false;

    document.getElementById("startMonitoring").disabled = false;
    document.getElementById("stopMonitoring").disabled = true;
});

function detectDialog() {
    console.log("Checking for dialog...");
    if (!dialogReader.pos) {
        dialogReader.find();
        console.log("Dialog reader initialized:", dialogReader.pos);
    }

    const dialogText = dialogReader.read();
    if (dialogText) {
        console.log("Dialog detected:", dialogText);

        // Use regex to extract shooting star details
        const starRegex = /The star is visible in (.+?) and will land in (.+?) minutes\..*The star looks to be a size (\d+)/i;
        const match = dialogText.match(starRegex);

        if (match) {
            const [_, location, time, size] = match;
            const world = detectCurrentWorld(dialogText);
            if (world) {
                addStarData(world, location, time, size);
            } else {
                console.log("World not detected in the dialog.");
            }
        } else {
            console.log("No shooting star information in the dialog.");
        }
    } else {
        console.log("No dialog detected.");
    }
}

function detectCurrentWorld(text) {
    console.log("Detecting world...");
    const worldRegex = /RuneScape (\d+)/i;
    const worldMatch = text.match(worldRegex);

    if (worldMatch) {
        const world = parseInt(worldMatch[1], 10);
        console.log("Detected World:", world);
        return world;
    }

    console.log("World not detected in the dialog.");
    return null;
}

function addStarData(world, location, time, size) {
    console.log("Adding star data:", { world, location, time, size });

    stars.push({ world, location, time, size });
    stars.sort((a, b) => a.world - b.world);

    const starList = document.getElementById("stars");
    starList.innerHTML = "";
    stars.forEach((star) => {
        const li = document.createElement("li");
        li.textContent = `World: ${star.world}, Location: ${star.location}, Time: ${star.time} minutes, Size: ${star.size}`;
        starList.appendChild(li);
    });

    const discordMessage = stars
        .map(
            (star) =>
                `🌟 World: ${star.world}, Location: ${star.location}, Time: ${star.time} minutes, Size: ${star.size}`
        )
        .join("\n");
    sendToDiscord(discordMessage);
}

function sendToDiscord(message) {
    console.log("Sending message to Discord:", message);

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
