const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AttachmentBuilder
} = require("discord.js");

const { VERIFY_CHANNEL, VERIFY_URL } = require("../config");

module.exports = (client) => {

    client.on(Events.MessageCreate, async (message) => {

        if (message.author.bot) return;

        if (
            message.content !== "!verify" ||
            message.channel.id !== VERIFY_CHANNEL
        ) return;

        try {

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
                "./assets/verify_glitch_banner.gif"
            );

            const row = new ActionRowBuilder().addComponents(

                new ButtonBuilder()
                    .setLabel("🔐 Verify Securely")
                    .setStyle(ButtonStyle.Link)
                    .setURL(VERIFY_URL)

            );

            await message.channel.send({
                embeds: [embed],
                components: [row],
                files: [file]
            });

            await message.delete().catch(() => {});

        } catch (err) {

            console.error("Verify Error:", err);

        }

    });

};