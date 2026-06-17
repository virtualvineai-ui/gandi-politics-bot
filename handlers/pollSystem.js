const fs = require("fs");
const path = require("path");

const polls = require("../polls");
const footers = require("../footers");
const config = require("../config");

const POLL_FILE = path.join(__dirname, "../data/pollData.json");
const LEADERBOARD_FILE = path.join(__dirname, "../data/leaderboard.json");
const WEEKLY_FILE = path.join(__dirname, "../data/weekly.json");

const POLL_DURATION = 24 * 60 * 60 * 1000;
const SCHEDULE_HOUR = 10;
const SCHEDULE_MINUTE = 0;

const EMOJIS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

const ALL_POLLS = [];

for (const category of Object.keys(polls)) {

    for (const poll of polls[category]) {

        ALL_POLLS.push({

            category,

            question: poll

        });

    }

}

function ensureFile(file, data) {

    if (!fs.existsSync(file)) {

        fs.mkdirSync(path.dirname(file), {

            recursive: true

        });

        fs.writeFileSync(

            file,

            JSON.stringify(data, null, 2)

        );

    }

}

ensureFile(POLL_FILE, {

    pollNumber: 1,

    lastPollDate: "",

    lastMessage: "",

    currentPoll: null,

    usedPolls: [],

    history: [],

    activePoll: null,

    yesterday: {

        winner: "",

        votes: 0,

        percent: 0

    }

});

ensureFile(LEADERBOARD_FILE, {});

ensureFile(WEEKLY_FILE, {

    week: 1,

    votes: {}

});

function read(file) {

    try {

        return JSON.parse(

            fs.readFileSync(file, "utf8")

        );

    }

    catch {

        return {};

    }

}

function save(file, data) {

    fs.writeFileSync(

        file,

        JSON.stringify(data, null, 2)

    );

}

function loadPollData() {

    return read(POLL_FILE);

}

function savePollData(data) {

    save(POLL_FILE, data);

}

function loadLeaderboard() {

    return read(LEADERBOARD_FILE);

}

function saveLeaderboard(data) {

    save(LEADERBOARD_FILE, data);

}

function loadWeekly() {

    return read(WEEKLY_FILE);

}

function saveWeekly(data) {

    save(WEEKLY_FILE, data);

}

function getToday() {

    return new Date().toLocaleDateString(

        "en-IN",

        {

            timeZone: "Asia/Kolkata"

        }

    );

}

function getRandomPoll(data) {

    if (data.usedPolls.length >= ALL_POLLS.length) {

        data.usedPolls = [];

    }

    const available = ALL_POLLS.filter(

        p => !data.usedPolls.includes(p.question)

    );

    const selected =

        available[

            Math.floor(

                Math.random() *

                available.length

            )

        ];

    data.usedPolls.push(

        selected.question

    );

    savePollData(data);

    return selected;

}

function getRandomFooter() {

    return footers[

        Math.floor(

            Math.random() *

            footers.length

        )

    ];

}

function getTomorrow() {

    return Date.now() +

        POLL_DURATION;

}

module.exports = (client) => {

    console.log("PollSystem Loaded");

    async function sendDailyPoll() {

        const data = loadPollData();

        const today = getToday();

        if (data.lastPollDate === today) {

            return;

        }

        const channel = client.channels.cache.get(
            config.POLL_CHANNEL
        );

        if (!channel) {

            console.log("Poll channel not found.");

            return;

        }

        const selected = getRandomPoll(data);

        const footer = getRandomFooter();

        let winnerSection = "";

        if (
            data.yesterday &&
            data.yesterday.winner
        ) {

            winnerSection =
`🏆 **Yesterday's Winner**

🥇 ${data.yesterday.winner}
👥 ${data.yesterday.votes} Votes
📈 ${data.yesterday.percent}%

━━━━━━━━━━━━━━━━━━━━━━

`;

        }

        const pollText =
`📊 **DAILY POLL #${data.pollNumber}**

${winnerSection}

${selected.question}

━━━━━━━━━━━━━━━━━━━━━━

🔥 Voting ends in **24 Hours**

${footer}`;

        const message = await channel.send({

            content: "@everyone\n\n" + pollText,

            allowedMentions: {

                parse: ["everyone"]

            }

        });

        for (const emoji of EMOJIS) {

            try {

                await message.react(emoji);

            }

            catch (err) {

                console.log(err);

            }

        }

        data.lastPollDate = today;

        data.lastMessage = message.id;

        data.currentPoll = {

            id: message.id,

            channel: channel.id,

            question: selected.question,

            createdAt: Date.now(),

            endsAt: getTomorrow(),

            votes: {},

            closed: false

        };

        data.history.push({

            number: data.pollNumber,

            question: selected.question,

            date: today,

            messageId: message.id

        });

        if (data.history.length > 500) {

            data.history.shift();

        }

        data.pollNumber++;

        savePollData(data);

        console.log(

            "Daily Poll Posted Successfully."

        );

    }

    function millisecondsUntil10AM() {

        const now = new Date();

        const target = new Date();

        target.setHours(
            SCHEDULE_HOUR,
            SCHEDULE_MINUTE,
            0,
            0
        );

        if (now > target) {

            target.setDate(

                target.getDate() + 1

            );

        }

        return target.getTime() - now.getTime();

    }

    function startScheduler() {

        const delay = millisecondsUntil10AM();

        console.log(

            "Next poll in",

            Math.floor(delay / 1000),

            "seconds"

        );

        setTimeout(async () => {

            await sendDailyPoll();

            setInterval(

                sendDailyPoll,

                24 * 60 * 60 * 1000

            );

        }, delay);

    }


    // =======================================
// REACTION VOTE SYSTEM
// =======================================

client.on("messageReactionAdd", async (reaction, user) => {

console.log("REACTION EVENT:", user.tag, reaction.emoji.name);    

    try {

        if (user.bot) return;

        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        const data = loadPollData();

        if (!data.currentPoll) return;

        if (reaction.message.id !== data.currentPoll.id) return;

        const emoji = reaction.emoji.name;

        console.log("Reaction:", user.tag, emoji);

        if (!EMOJIS.includes(emoji)) {

            await reaction.users.remove(user.id);
            return;

        }

        // Remove all other reactions from this user
for (const e of EMOJIS) {

    if (e === emoji) continue;

    const oldReaction = reaction.message.reactions.cache.find(
        r => r.emoji.name === e
    );

    if (!oldReaction) continue;

    const reacted = oldReaction.users.cache.has(user.id);

    if (!reacted) continue;

    console.log(`Removing ${e} from ${user.tag}`);

    try {

console.log("Bot ID:", reaction.client.user.id);
console.log("Message Author ID:", reaction.message.author.id);
console.log("User ID:", user.id);

        await oldReaction.users.remove(user.id);

        console.log("Trying to remove reaction...");

    } catch (err) {

        console.error(err);

    }

}
        data.currentPoll.votes[user.id] = emoji;

        savePollData(data);

    }

    catch (err) {

        console.error("Vote Error:", err);

    }

});


// =======================================
// REMOVE INVALID REACTIONS
// =======================================

client.on("messageReactionRemove", async (reaction, user) => {

    if (user.bot) return;

});

// =======================================
// POLL RESULT CHECKER
// =======================================

async function checkPollResult() {

    try {

        const data = loadPollData();

        if (!data.currentPoll) return;

        if (data.currentPoll.closed) return;

        if (Date.now() < data.currentPoll.endsAt) return;

        const votes = Object.values(data.currentPoll.votes || {});

        const counts = {};

        for (const emoji of EMOJIS) {

            counts[emoji] = 0;

        }

        for (const vote of votes) {

            if (counts.hasOwnProperty(vote)) {

                counts[vote]++;

            }

        }

        let winnerEmoji = null;
        let winnerVotes = -1;

        for (const emoji of EMOJIS) {

            if (counts[emoji] > winnerVotes) {

                winnerVotes = counts[emoji];
                winnerEmoji = emoji;

            }

        }

        const totalVotes = votes.length;

        const percent =
            totalVotes === 0
                ? 0
                : Number(((winnerVotes / totalVotes) * 100).toFixed(1));

        data.yesterday = {

            winner: winnerEmoji || "No Winner",

            votes: winnerVotes < 0 ? 0 : winnerVotes,

            percent

        };

        data.currentPoll.closed = true;

// ==============================
// UPDATE LEADERBOARD
// ==============================

const leaderboard = loadLeaderboard();
const weekly = loadWeekly();

const uniqueVoters = Object.keys(data.currentPoll.votes || {});

for (const userId of uniqueVoters) {

    if (!leaderboard[userId]) {

        leaderboard[userId] = {

            votes: 0

        };

    }

    leaderboard[userId].votes++;

    if (!weekly.votes[userId]) {

        weekly.votes[userId] = {

            votes: 0

        };

    }

    weekly.votes[userId].votes++;

}

saveLeaderboard(leaderboard);
saveWeekly(weekly);

        savePollData(data);

        const channel = client.channels.cache.get(
            data.currentPoll.channel
        );

        if (channel) {

            await channel.send(

`🏁 **Today's Poll Ended**

🥇 Winner: ${data.yesterday.winner}

👥 Votes: ${data.yesterday.votes}

📊 Percentage: ${data.yesterday.percent}%

🗳️ Total Votes: ${totalVotes}`

            );

        }

        console.log("Poll closed successfully.");

    }

    catch (err) {

        console.error("Poll Result Error:", err);

    }

}

client.once("clientReady", async () => {

    console.log("Production Poll Scheduler Started");

    await sendDailyPoll();

    startScheduler();

    setInterval(checkPollResult, 60000);

});

};