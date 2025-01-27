A1lib.identifyApp("appconfig.json");

let stars = []; // Array to store star data
let monitoring = false;
const webhookURL = "https://discord.com/api/webhooks/1333176484793290825/XoT2Ei0p-4Wz8-1HCP7-Z3QKPWanbJSNoVEE52nNvrCpEZFYRidtd_SneIrGip2RsvHa";

// Start Monitoring
document.getElementById("startMonitoring").addEventListener("click", () => {
    console.log("Start Monitoring clicked");
    monitoring = true;

    document.getElementById("startMonitoring").disabled = true;
    document.getElementById("stopMonitoring").disabled = false;

    const monitorInterval = setInterval(() => {
        if (!monitoring) {
            clearInterval(monitorInterval);
            return;
        }

        detectGameText(); // Scan the entire screen for text
    }, 1000); // Poll every second
});

// Stop Monitoring
document.getElementById("stopMonitoring").addEventListener("click", () => {
    console.log("Monitoring stopped");
    monitoring = false;

    document.getElementById("startMonitoring").disabled = false;
    document.getElementById("stopMonitoring").disabled = true;
});

// Detect text across the entire screen
function detectGameText() {
    const gameSize = alt1.getAppSize(); // Get the full RuneScape client dimensions
    const image = alt1.captureRect({
        x: 0,
        y: 0,
        width: gameSize.width,
        height: gameSize.height,
    });

    if (image) {
        const detectedText = alt1.ocr.read(image);
        console.log("Detected Text:", detectedText);

        // Detect shooting star information
        const starRegex = /The star is visible in (.+?) and will land in (.+?) minutes\..*The star looks to be a size (\d+)/i;
        const starMatch = detectedText.match(starRegex);

        if (starMatch) {
            const [_, location, time, size] = starMatch;
            const world = detectCurrentWorld(detectedText); // Get the current world
            if (world) {
                addStarData(world, location, time, size);
            }
        }
    }
}

// Detect the current RuneScape world
function detectCurrentWorld(text) {
    const worldRegex = /RuneScape (\d+)/i;
    const worldMatch = text.match(worldRegex);

    if (worldMatch) {
        const world = parseInt(worldMatch[1], 10);
        console.log("Detected World:", world);
        return world;
    }

    console.log("World not detected.");
    return null;
}

// Add star data and update UI
function addStarData(world, location, time, size) {
    stars.push({ world, location, time, size });

    // Sort stars by world number
    stars.sort((a, b) => a.world - b.world);

    // Update the UI
    const starList = document.getElementById("stars");
    starList.innerHTML = ""; // Clear existing list
    stars.forEach((star) => {
        const li = document.createElement("li");
        li.textContent = `World: ${star.world}, Location: ${star.location}, Time: ${star.time} minutes, Size: ${star.size}`;
        starList.appendChild(li);
    });

    // Send sorted data to Discord
    const discordMessage = stars
        .map(
            (star) =>
                `🌟 World: ${star.world}, Location: ${star.location}, Time: ${star.time} minutes, Size: ${star.size}`
        )
        .join("\n");
    sendToDiscord(discordMessage);
}

// Send data to Discord
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
