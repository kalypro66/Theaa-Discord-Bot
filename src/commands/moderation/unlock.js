const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const { sendLog } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock the current channel.')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        ),

    async execute(interaction) {

        const everyone = interaction.guild.roles.everyone;

        const permissions = interaction.channel.permissionsFor(everyone);

        if (permissions.has(PermissionFlagsBits.SendMessages)) {
            return interaction.reply({
                content: 'This channel is already unlocked.',
                ephemeral: true
            });
        }

        await interaction.channel.permissionOverwrites.edit(everyone, {
            SendMessages: null,
            SendMessagesInThreads: null
        });

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('Channel Unlocked')
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
            )
            .setFooter({
                text: `${interaction.client.user.username} | ${interaction.guild.name}`,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });

        await sendLog(interaction, embed);
    }
};