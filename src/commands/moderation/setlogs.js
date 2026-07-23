const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const logsPath = path.join(
    __dirname,
    '../../config/logs.json'
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Sets the current channel as the server log channel')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {
        const channel = interaction.channel;

        let logs = {};

        try {
            logs = JSON.parse(
                fs.readFileSync(logsPath, 'utf8')
            );
        } catch (error) {
            console.error(error);
        }

        logs[interaction.guild.id] = channel.id;

        fs.writeFileSync(
            logsPath,
            JSON.stringify(logs, null, 4)
        );

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('Log Channel Updated')
            .setDescription(
                `${channel} is now the server log channel.`
            )
            .setFooter({
                text: `${interaction.client.user.username} | ${interaction.guild.name}`,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};