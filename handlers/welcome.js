const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const {
    WELCOME_CHANNEL,
    RULES_URL,
    VERIFY_URL,
    PARTY_CHANNEL
} = require("../config");

module.exports = (client) => {

    client.on(Events.GuildMemberAdd, async (member) => {

        try {

            const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);

            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setAuthor({
                    name: "🚨 NEW POLITICIAN DETECTED",
                    iconURL: member.user.displayAvatarURL()
                })
                .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
                .setDescription(`## Welcome ${member} 👋

📜 Read the rules before starting a revolution.

🔐 Verify yourself.

🗳️ Pick your party.

👥 Member #${member.guild.memberCount}

*May your arguments be loud and your facts optional.*`)
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(

                new ButtonBuilder()
                    .setLabel("📜 Rules")
                    .setStyle(ButtonStyle.Link)
                    .setURL(RULES_URL),

                new ButtonBuilder()
                    .setLabel("🔐 Verify")
                    .setStyle(ButtonStyle.Link)
                    .setURL(VERIFY_URL),

                new ButtonBuilder()
                    .setLabel("🗳️ Party")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${member.guild.id}/${PARTY_CHANNEL}`)

            );

            await channel.send({
                embeds: [embed],
                components: [row]
            });

        } catch (err) {

            console.error("Welcome Error:", err);

        }

    });

};