const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
AttachmentBuilder,
Events
} = require("discord.js");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.MessageContent
]
});

const TOKEN = process.env.TOKEN;

// ROLES
const PUBLIC_VIEWER = "1516212113683644496";

const BJP_ROLE = "1516156573620240617";
const CONGRESS_ROLE = "1516156573620240616";
const AAP_ROLE = "1516156573620240615";
const COCKROACH_ROLE = "1516180882942197772";

// CHANNELS
const WELCOME_CHANNEL = "1516156577122353207";
const POLL_CHANNEL = "1516183085316706314";

let lastPollDate = "";

client.once(Events.ClientReady, () => {
console.log("BOT READY");
console.log(`${client.user.tag} is online!`);
setInterval(async () => {

const now = new Date();

const indiaTime = new Date(
now.toLocaleString("en-US", {
timeZone: "Asia/Kolkata"
})
);

const today = indiaTime.toDateString();

if (
indiaTime.getHours() === 10 &&
indiaTime.getMinutes() === 0 &&
lastPollDate !== today
) {

lastPollDate = today;

const channel = client.channels.cache.get(POLL_CHANNEL);

if (!channel) return;

const poll = `📊 Daily Poll

Sabse bada scam?

1️⃣ Salary
2️⃣ True Love
3️⃣ Crypto Guru
4️⃣ Political Promises`;

const msg = await channel.send({
content: `@everyone\n\n${poll}`,
allowedMentions: { parse: ["everyone"] }
});

await msg.react("1️⃣");
await msg.react("2️⃣");
await msg.react("3️⃣");
await msg.react("4️⃣");

}

}, 60000);

});

// =========================
// WELCOME MESSAGE
// =========================

client.on(Events.GuildMemberAdd, async (member) => {

try {

const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);

if (!channel) return;

const embed = new EmbedBuilder()
.setColor("#0099ff")
.setAuthor({
name: "🚨 NEW POLITICIAN DETECTED",
iconURL: member.user.displayAvatarURL({ size: 256 })
})
.setThumbnail(
member.user.displayAvatarURL({ size: 512 })
)
.setDescription(
`## Welcome ${member} 👋

📜 Read the rules before starting a revolution.

🔐 Verify yourself.

🗳️ Pick your party.

👥 **Member #${member.guild.memberCount}**

*May your arguments be loud and your facts optional.*`
)
.setTimestamp();

const row = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setLabel("📜 Rules")
.setStyle(ButtonStyle.Link)
.setURL("https://discord.com/channels/1516156573620240614/1516182741635301446"),

new ButtonBuilder()
.setLabel("🔐 Verify")
.setStyle(ButtonStyle.Link)
.setURL("https://discord.com/channels/1516156573620240614/1516223995010355360"),

new ButtonBuilder()
.setLabel("🗳️ Party")
.setStyle(ButtonStyle.Link)
.setURL("https://discord.com/channels/1516156573620240614/1516224756775649300")
);

await channel.send({
embeds: [embed],
components: [row]
});

} catch (err) {
console.error(err);
}

});

// =========================
// COMMANDS
// =========================

client.on(Events.MessageCreate, async (message) => {

if (message.author.bot) return;

// VERIFY PANEL
if (
message.content === "!verify" &&
message.channel.name.includes("verify")
) {

const embed = new EmbedBuilder()
.setColor("#0099ff")
.setTitle("🔐 Verify Required")
.setDescription(`**Welcome to Gandi Politics**

This server requires verification before accessing all channels.

⚡ Fast Verification
🛡️ Advanced Security
🚀 Instant Server Access

Click the button below to verify yourself.`)
.setImage("attachment://verify_glitch_banner.gif");

const file = new AttachmentBuilder(
"./verify.gif/verify_glitch_banner.gif"
);

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("verify")
.setLabel("Verify Securely")
.setStyle(ButtonStyle.Primary)
);

await message.channel.send({
embeds: [embed],
components: [row],
files: [file]
});

await message.delete().catch(() => {});
}

// PARTY PANEL
if (
message.content === "!party" &&
message.channel.id === "1516224756775649300"
) {

const embed = new EmbedBuilder()
.setColor("#f1c40f")
.setTitle("🗳️ Choose Your Political Party")
.setDescription(
"Select one party below.\n\nChanging party will automatically remove your previous party role."
);

const row = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("bjp")
.setLabel("🟧 BJP")
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId("congress")
.setLabel("✋ Congress")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("aap")
.setLabel("🧹 AAP")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("cockroach")
.setLabel("🪳 Cockroach")
.setStyle(ButtonStyle.Secondary)

);

await message.channel.send({
embeds: [embed],
components: [row]
});

}

});

// =========================
// BUTTONS
// =========================

client.on(Events.InteractionCreate, async (interaction) => {

if (!interaction.isButton()) return;

// VERIFY
if (interaction.customId === "verify") {

try {

await interaction.member.roles.add(PUBLIC_VIEWER);

return interaction.reply({
content: "✅ Verification Successful!",
ephemeral: true
});

} catch (err) {

console.error(err);

return interaction.reply({
content: "❌ Verification Failed.",
ephemeral: true
});

}

}

// PARTY ROLES
if (
interaction.customId === "bjp" ||
interaction.customId === "congress" ||
interaction.customId === "aap" ||
interaction.customId === "cockroach"
) {

try {

await interaction.member.roles.remove([
BJP_ROLE,
CONGRESS_ROLE,
AAP_ROLE,
COCKROACH_ROLE
]);

let roleToAdd;
let partyName;

if (interaction.customId === "bjp") {
roleToAdd = BJP_ROLE;
partyName = "BJP";
}

if (interaction.customId === "congress") {
roleToAdd = CONGRESS_ROLE;
partyName = "Congress";
}

if (interaction.customId === "aap") {
roleToAdd = AAP_ROLE;
partyName = "AAP";
}

if (interaction.customId === "cockroach") {
roleToAdd = COCKROACH_ROLE;
partyName = "Cockroach Party";
}

await interaction.member.roles.add(roleToAdd);

return interaction.reply({
content: `✅ You joined ${partyName}`,
ephemeral: true
});

} catch (err) {

console.error(err);

return interaction.reply({
content: "❌ Failed to assign role.",
ephemeral: true
});

}

}

});

client.login(TOKEN);