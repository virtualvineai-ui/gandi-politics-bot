const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const {
    PARTY_CHANNEL,
    BJP_ROLE,
    CONGRESS_ROLE,
    AAP_ROLE,
    COCKROACH_ROLE
} = require("../config");

module.exports = (client) => {

    // =========================
    // PARTY PANEL
    // =========================

    client.on(Events.MessageCreate, async (message) => {

        if (message.author.bot) return;

        if (
            message.content !== "!party" ||
            message.channel.id !== PARTY_CHANNEL
        ) return;

        try {

            const embed = new EmbedBuilder()
                .setColor("#f1c40f")
                .setTitle("🗳️ Choose Your Political Party")
                .setDescription(`
Select **ONE** political party.

━━━━━━━━━━━━━━━━━━

🪷 **Bharatiya Janata Party**

✋ **Indian National Congress**

🧹 **Aam Aadmi Party**

🪳 **Cockroach Party**

━━━━━━━━━━━━━━━━━━

⚠️ Choosing another party will automatically remove your previous one.
`);

            const row = new ActionRowBuilder().addComponents(

                new ButtonBuilder()
                    .setCustomId("bjp")
                    .setLabel("🪷 BJP")
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

            await message.delete().catch(() => {});

        } catch (err) {

            console.error("Party Panel Error:", err);

        }

    });

    // =========================
    // PARTY BUTTONS
    // =========================

    client.on(Events.InteractionCreate, async (interaction) => {

        if (!interaction.isButton()) return;

        if (
            !["bjp", "congress", "aap", "cockroach"].includes(interaction.customId)
        ) return;

        try {

            await interaction.member.roles.remove([
                BJP_ROLE,
                CONGRESS_ROLE,
                AAP_ROLE,
                COCKROACH_ROLE
            ]);

            let role;
            let party;

            switch (interaction.customId) {

                case "bjp":
                    role = BJP_ROLE;
                    party = "🪷 BJP";
                    break;

                case "congress":
                    role = CONGRESS_ROLE;
                    party = "✋ Congress";
                    break;

                case "aap":
                    role = AAP_ROLE;
                    party = "🧹 AAP";
                    break;

                case "cockroach":
                    role = COCKROACH_ROLE;
                    party = "🪳 Cockroach Party";
                    break;

            }

            await interaction.member.roles.add(role);

            await interaction.reply({
                content: `✅ Successfully joined **${party}**`,
                ephemeral: true
            });

        } catch (err) {

            console.error("Party Button Error:", err);

            await interaction.reply({
                content: "❌ Failed to assign role.",
                ephemeral: true
            });

        }

    });

};