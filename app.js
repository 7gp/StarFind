console.log("app.js loaded successfully"); // Confirm the script is loaded

A1lib.identifyApp("appconfig.json"); // Identify the app

let stars = [];
let monitoring = false;
const webhookURL = "https://discord.com/api/webhooks/1333176484793290825/XoT2Ei0p-4Wz8-1HCP7-Z3QKPWanbJSNoVEE52nNvrCpEZFYRidtd_SneIrGip2RsvHa";

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

        console.log("Scanning the screen...");
        detectGameText();
    }, 1000);
});

document.getElementById("stopMonitoring").addEventListener("click", () => {
    console.log("Stop Monitoring button clicked");
    monitoring = false;

    document.getElementById("startMonitoring").disabled = false;
    document.getElementById("stopMonitoring").disabled = true;
});

function detectGameText() {
    console.log("detectGameText called");

    const gameSize = alt1.getAppSize();
    console.log("Game size detected:", gameSize);

    const image = alt1.captureRect({
        x: 0,
        y: 0,
        width: gameSize.width,
        height: gameSize.height,
    });

    if (image) {
        console.log("Captured screen successfully.");
        const detectedText = alt1.ocr.read(image);
        console.log("Detected Text:", detectedText);

        const starRegex = /The star is visible in (.+?) and will land in (.+?) minutes\..*The star looks to be a size (\d+)/i;
        const starMatch = detectedText.match(starRegex);

        if (starMatch) {
            console.log("Star Match Found:", starMatch);
            const [_, location, time, size] = starMatch;
            const world = detectCurrentWorld(detectedText);

            if (world) {
                addStarData(world, location, time, size);
            } else {
                console.log("World not detected in the text.");
            }
        } else {
            console.log("No star-related text detected.");
        }
    } else {
        console.error("Failed to capture screen.");
    }
}

function detectCurrentWorld(text) {
    console.log("detectCurrentWorld called");

    const worldRegex = /RuneScape (\d+)/i;
    const worldMatch = text.match(worldRegex);

    if (worldMatch) {
        const world = parseInt(worldMatch[1], 10);
        console.log("Detected World:", world);
        return world;
    }

    console.log("World not detected in the text.");
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
