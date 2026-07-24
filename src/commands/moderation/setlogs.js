const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const {
    createStandardEmbed
} = require("../../discord/embeds/embedStyle");

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

        const embed = createStandardEmbed(
                interaction,
                {
                    color:
                        '#5865F2'
                }
            )
            .setTitle('Log Channel Updated')
            .setDescription(
                `${channel} is now the server log channel.`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};