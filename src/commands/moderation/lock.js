const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const {
    createStandardEmbed
} = require("../../discord/embeds/embedStyle");

const { sendLog } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock the current channel.')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        ),

    async execute(interaction) {

        const everyone = interaction.guild.roles.everyone;

        const permissions = interaction.channel.permissionsFor(everyone);

        if (!permissions.has(PermissionFlagsBits.SendMessages)) {
            return interaction.reply({
                content: 'This channel is already locked.',
                ephemeral: true
            });
        }

        await interaction.channel.permissionOverwrites.edit(everyone, {
            SendMessages: false,
            SendMessagesInThreads: false
        });

        const embed = createStandardEmbed(
                interaction,
                {
                    color:
                        '#5865F2'
                }
            )
            .setTitle('Channel Locked')
            .addFields(
                {
                    name: 'Moderator',
                    value: `${interaction.user}`,
                    inline: true
                },
                {
                    name: 'Channel',
                    value: `${interaction.channel}`,
                    inline: true
                }
            );

        await interaction.reply({
            embeds: [embed]
        });

        await sendLog(interaction, embed);
    }
};