console.debug("App initialized");

A1lib.identifyApp("appconfig.json");

let stars = []; // Store detected star data
let lastMessageID = null; // Store the last Discord message ID for editing
const webhookURL = "https://discord.com/api/webhooks/1333176484793290825/XoT2Ei0p-4Wz8-1HCP7-Z3QKPWanbJSNoVEE52nNvrCpEZFYRidtd_SneIrGip2RsvHa";

const dialogReader = new DialogTextReader();

// Start detecting dialog boxes immediately
function detectDialog() {
    console.debug("Checking for dialog...");
    if (!dialogReader.pos) {
        dialogReader.find();
        console.debug("Dialog reader initialized:", dialogReader.pos);
    }

    const dialogText = dialogReader.read();
    if (dialogText) {
        console.debug("Dialog detected:", dialogText);

        const starRegex = /The star is visible in (.+?) and will land in (.+?) minutes\..*The star looks to be a size (\d+)/i;
        const match = dialogText.match(starRegex);

        if (match) {
            const [_, location, time, size] = match;
            const world = detectCurrentWorld(dialogText);

            if (world) {
                addStarData(world, location, time, size);
            } else {
                console.debug("World not detected in the dialog.");
            }
        } else {
            console.debug("No star-related text in the dialog.");
        }
    } else {
        console.debug("No dialog detected.");
    }

    setTimeout(detectDialog, 1000); // Keep polling for dialogs
}

// Detect current world from dialog
function detectCurrentWorld(text) {
    const worldRegex = /RuneScape (\d+)/i;
    const match = text.match(worldRegex);

    if (match) {
        const world = parseInt(match[1], 10);
        console.debug("Detected world:", world);
        return world;
    }

    console.debug("World not detected.");
    return null;
}

// Add new star data to the list
function addStarData(world, location, time, size) {
    console.debug("Adding star data:", { world, location, time, size });

    const existing = stars.find((star) => star.world === world);
    if (existing) {
        console.debug("Star already exists for this world, updating...");
        existing.location = location;
        existing.time = time;
        existing.size = size;
    } else {
        stars.push({ world, location, time, size });
        stars.sort((a, b) => a.world - b.world); // Keep sorted by world
    }

    updateStarListUI();
}

// Update the list of stars in the app UI
function updateStarListUI() {
    const starList = document.getElementById("stars");
    starList.innerHTML = "";

    stars.forEach((star) => {
        const li = document.createElement("li");
        li.textContent = `World: ${star.world}, Location: ${star.location}, Time: ${star.time} minutes, Size: ${star.size}`;
        starList.appendChild(li);
    });
}

// Send star data to Discord
document.getElementById("sendToDiscord").addEventListener("click", () => {
    console.debug("Send to Discord button clicked");

    const messageContent = stars
        .map(
            (star) =>
                `🌟 **World ${star.world}**: ${star.location}, Time: ${star.time} minutes, Size: ${star.size}`
        )
        .join("\n");

    if (lastMessageID) {
        editDiscordMessage(messageContent);
    } else {
        sendNewDiscordMessage(messageContent);
    }
});

// Send a new message to Discord
function sendNewDiscordMessage(content) {
    console.debug("Sending new message to Discord");

    fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.debug("New Discord message sent:", data);
            lastMessageID = data.id; // Save message ID for future edits
        })
        .catch((error) => console.error("Error sending Discord message:", error));
}

// Edit the existing message on Discord
function editDiscordMessage(content) {
    console.debug("Editing existing Discord message");

    const editURL = `${webhookURL}/messages/${lastMessageID}`;
    fetch(editURL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to edit Discord message");
            }
            console.debug("Discord message edited successfully");
        })
        .catch((error) => console.error("Error editing Discord message:", error));
}

// Clear the star list
document.getElementById("clearList").addEventListener("click", () => {
    console.debug("Clear list button clicked");
    stars = []; // Clear the data
    updateStarListUI();
});

detectDialog(); // Start dialog detection on app load
