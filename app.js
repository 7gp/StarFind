console.debug("App initialized");

// Ensure A1lib is available
if (typeof A1lib === "undefined") {
    console.error("A1lib is not defined. Ensure a1lib.js is included.");
    throw new Error("A1lib is not defined");
}

A1lib.identifyApp("appconfig.json");

let stars = [];
let lastMessageID = null; // For editing Discord messages
const webhookURL = "https://discord.com/api/webhooks/1333176484793290825/XoT2Ei0p-4Wz8-1HCP7-Z3QKPWanbJSNoVEE52nNvrCpEZFYRidtd_SneIrGip2RsvHa";

const dialogReader = new DialogTextReader();

function detectRuneScape() {
    if (!alt1.rsLinked) {
        console.debug("RuneScape is not linked. Please link RuneScape to Alt1.");
        return;
    }

    const rsBounds = {
        x: alt1.rsX,
        y: alt1.rsY,
        width: alt1.rsWidth,
        height: alt1.rsHeight,
    };
    console.debug("RuneScape client bounds detected:", rsBounds);

    detectDialog(rsBounds);
}

function detectDialog(rsBounds) {
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
            const world = alt1.currentWorld > 0 ? alt1.currentWorld : null;

            if (world) {
                addStarData(world, location, time, size);
            } else {
                console.debug("World not detected.");
            }
        } else {
            console.debug("No star-related text in dialog.");
        }
    } else {
        console.debug("No dialog detected.");
    }

    setTimeout(() => detectDialog(rsBounds), 1000); // Poll every second
}

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
    stars = [];
    updateStarListUI();
});

detectRuneScape();
