const fs = require("fs");
const path = require("path");

const polls = require("../polls");
const footers = require("../footers");
const config = require("../config");

const DATA_FILE = path.join(__dirname, "../data/pollData.json");

function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        return {
            pollNumber: 1,
            lastWinner: "",
            lastVotes: 0,
            lastPercent: 0,
            lastPollMessage: "",
            weeklyVotes: {},
            totalVotes: 0,
            lastPollDate: ""
        };
    }

    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = (client) => {

    async function sendDailyPoll() {

        const data = loadData();

        const today = new Date().toLocaleDateString("en-IN");

        if (data.lastPollDate === today) return;

        data.lastPollDate = today;

        saveData(data);

        const channel = client.channels.cache.get(config.POLL_CHANNEL);

        if (!channel) return;

        // -----------------------------
        // RANDOM CATEGORY
        // -----------------------------

        const categories = Object.keys(polls);

        const randomCategory =
            categories[Math.floor(Math.random() * categories.length)];

        const categoryPolls = polls[randomCategory];

        if (!categoryPolls.length) return;

        const poll =
            categoryPolls[Math.floor(Math.random() * categoryPolls.length)];

        // -----------------------------
        // FOOTER
        // -----------------------------

        const footer =
            footers[Math.floor(Math.random() * footers.length)];

        // -----------------------------
        // WINNER SECTION
        // -----------------------------

        let winnerText = "";

        if (data.lastWinner) {

            winnerText =
`🏆 **Yesterday's Winner**

🥇 ${data.lastWinner}
👥 ${data.lastVotes} Votes (${data.lastPercent}%)

━━━━━━━━━━━━━━━━━━━━━━

`;

        }

        const message =

`📊 **DAILY POLL #${data.pollNumber}**

${winnerText}${poll}

━━━━━━━━━━━━━━━━━━━━━━

🔥 Vote ends in **24 Hours**

${footer}`;

        const msg = await channel.send({

            content: "@everyone",

            allowedMentions: {
                parse: ["everyone"]
            },

            content: `@everyone\n\n${message}`

        });

        await msg.react("1️⃣");
        await msg.react("2️⃣");
        await msg.react("3️⃣");
        await msg.react("4️⃣");

        data.lastPollMessage = msg.id;
        data.pollNumber++;

        saveData(data);
    }

    client.once("ready", () => {

        sendDailyPoll();

        setInterval(() => {

            sendDailyPoll();

        }, 60000);

    });

};