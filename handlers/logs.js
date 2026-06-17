const { Events, EmbedBuilder } = require("discord.js");

const {
    JOIN_LOG_CHANNEL,
    LEAVE_LOG_CHANNEL
} = require("../config");

module.exports = (client) => {

    // =========================
    // MEMBER JOIN LOG
    // =========================

    client.on(Events.GuildMemberAdd, async (member) => {

        try {

            const channel = member.guild.channels.cache.get(JOIN_LOG_CHANNEL);

            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor("#00ff88")
                .setTitle("📥 Member Joined")
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: "👤 User",
                        value: `${member.user.tag}`,
                        inline: true
                    },
                    {
                        name: "🆔 User ID",
                        value: member.id,
                        inline: true
                    },
                    {
                        name: "👥 Members",
                        value: `${member.guild.memberCount}`,
                        inline: true
                    }
                )
                .setFooter({
                    text: "Gandi Politics Logs"
                })
                .setTimestamp();

            await channel.send({
                embeds: [embed]
            });

        } catch (err) {

            console.error("Join Log Error:", err);

        }

    });

    // =========================
    // MEMBER LEAVE LOG
    // =========================

    client.on(Events.GuildMemberRemove, async (member) => {

        try {

            const channel = member.guild.channels.cache.get(LEAVE_LOG_CHANNEL);

            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor("#ff3b30")
                .setTitle("📤 Member Left")
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: "👤 User",
                        value: `${member.user.tag}`,
                        inline: true
                    },
                    {
                        name: "🆔 User ID",
                        value: member.id,
                        inline: true
                    },
                    {
                        name: "👥 Members Left",
                        value: `${member.guild.memberCount}`,
                        inline: true
                    }
                )
                .setFooter({
                    text: "Gandi Politics Logs"
                })
                .setTimestamp();

            await channel.send({
                embeds: [embed]
            });

        } catch (err) {

            console.error("Leave Log Error:", err);

        }

    });

};