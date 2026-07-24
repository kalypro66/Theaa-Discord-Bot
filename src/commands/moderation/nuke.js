const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} = require('discord.js');

const {
    createStandardEmbed
} = require("../../discord/embeds/embedStyle");

const { sendLog } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Completely resets the current channel.')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        ),

    async execute(interaction) {

        const embed = createStandardEmbed(
                interaction,
                {
                    color:
                        '#ED4245'
                }
            )
            .setTitle('Confirm Nuke')
            .setDescription(
                'Are you sure you want to permanently reset this channel?\n\nThis action cannot be undone.'
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_nuke')
                    .setLabel('Confirm Nuke')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId('cancel_nuke')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

        const response = await interaction.reply({
            embeds: [embed],
            components: [row],
            withResponse: true
        });

        const reply =
            response.resource?.message ||
            await interaction.fetchReply();

        const collector = reply.createMessageComponentCollector({
            time: 30000
        });

        collector.on('collect', async i => {

            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: 'Only the command author can use these buttons.',
                    ephemeral: true
                });
            }

            if (i.customId === 'cancel_nuke') {

                collector.stop();

                return i.update({
                    content: 'Nuke cancelled.',
                    embeds: [],
                    components: []
                });
            }

            if (i.customId === 'confirm_nuke') {

                collector.stop();
                                await i.update({
                    content: 'Nuking channel...',
                    embeds: [],
                    components: []
                });

                const oldChannel = interaction.channel;

                const newChannel = await oldChannel.clone({
                    reason: `Channel nuked by ${interaction.user.tag}`
                });

                await newChannel.setPosition(oldChannel.position);

                await oldChannel.delete(
                    `Channel nuked by ${interaction.user.tag}`
                );

                const successEmbed = createStandardEmbed(
                interaction,
                {
                    color:
                        '#5865F2'
                }
            )
                    .setTitle('Channel Nuked')
                    .setDescription(
                        `This channel has been reset by ${interaction.user}.`
                    );

                await newChannel.send({
                    embeds: [successEmbed]
                });

                await sendLog(interaction, successEmbed);
            }

        });

        collector.on('end', async (_, reason) => {

            if (reason !== 'time') return;

            await interaction.editReply({
                content: 'Nuke request expired.',
                embeds: [],
                components: []
            }).catch(() => {});
        });

    }
};