const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
AttachmentBuilder,
Events
} = require('discord.js');

const { createCanvas, loadImage } = require("canvas");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.MessageContent
]
});

const TOKEN = process.env.TOKEN;

// Roles
const PUBLIC_VIEWER = "1516212113683644496";

const BJP_ROLE = "1516156573620240617";
const CONGRESS_ROLE = "1516156573620240616";
const AAP_ROLE = "1516156573620240615";
const COCKROACH_ROLE = "1516180882942197772";

const WELCOME_CHANNEL = "1516156577122353207";

client.once(Events.ClientReady, () => {
console.log("BOT READY");
console.log(`${client.user.tag} is online!`);
});

client.on(Events.GuildMemberAdd, async (member) => {

console.log("MEMBER JOIN DETECTED");

try {

const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);

if (!channel) return;

const canvas = createCanvas(1366, 768);
const ctx = canvas.getContext("2d");

const background = await loadImage("./welcome-template.png");

ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

// Avatar
const avatarURL = member.user.displayAvatarURL({
extension: "png",
size: 512
});

const avatar = await loadImage(avatarURL);

ctx.save();

ctx.beginPath();
ctx.arc(1000, 250, 145, 0, Math.PI * 2);
ctx.closePath();
ctx.clip();

ctx.drawImage(
avatar,
855,
105,
290,
290
);

ctx.restore();

// Username
ctx.font = "bold 52px Sans";
ctx.fillStyle = "#2f8cff";

ctx.fillText(
`@${member.user.username}`,
85,
305
);

// Member Count
ctx.font = "bold 60px Sans";
ctx.fillStyle = "#ffffff";

ctx.fillText(
`#${member.guild.memberCount}`,
950,
470
);

const attachment = new AttachmentBuilder(
canvas.toBuffer(),
{
name: "welcome-card.png"
}
);

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
files: [attachment],
components: [row]
});

} catch (error) {

console.error(error);

}

});

client.on(Events.MessageCreate, async (message) => {

console.log("Message Received:", message.content);

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


const file = new AttachmentBuilder("./verify.gif/verify_glitch_banner.gif");
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
if (message.content === "!party") {

    const embed = new EmbedBuilder()
        .setColor("#f1c40f")
        .setTitle("🗳️ Choose Your Party")
  .setDescription(

`Choose your political party.

🪷 BJP
🌷 Congress
🧹 AAP
🪳 Cockroach Party

You can only have one party role at a time.`
);

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("bjp")
    .setLabel("BJP")
    .setEmoji("🪷")
    .setStyle(ButtonStyle.Primary),

  new ButtonBuilder()
    .setCustomId("congress")
    .setLabel("Congress")
    .setEmoji("🌷")
    .setStyle(ButtonStyle.Success),

  new ButtonBuilder()
    .setCustomId("aap")
    .setLabel("AAP")
    .setEmoji("🧹")
    .setStyle(ButtonStyle.Secondary),

  new ButtonBuilder()
    .setCustomId("cockroach")
    .setLabel("Cockroach")
    .setEmoji("🪳")
    .setStyle(ButtonStyle.Danger)
);

await message.channel.send({
  embeds: [embed],
  components: [row]
});

await message.delete().catch(() => {});

}

});

client.on(Events.InteractionCreate, async (interaction) => {

if (!interaction.isButton()) return;

// VERIFY BUTTON
if (interaction.customId === "verify") {

try {

  await interaction.member.roles.add(PUBLIC_VIEWER);

  return interaction.reply({
    content: "✅ Verification Successful!",
    ephemeral: true
  });

} catch (error) {

  console.error(error);

  return interaction.reply({
    content: "❌ Verification Failed.",
    ephemeral: true
  });
}

}

// PARTY BUTTONS
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

} catch (error) {

  console.error(error);

  return interaction.reply({
    content: "❌ Failed to assign role.",
    ephemeral: true
  });
}

}

});

client.login(TOKEN);
