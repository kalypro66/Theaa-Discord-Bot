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
        .setName('purge')
        .setDescription('Delete up to 100 messages.')
        .addIntegerOption(option =>
            option
                .setName('value')
                .setDescription('Number of messages to delete')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageMessages
        ),

    async execute(interaction) {

        const amount = interaction.options.getInteger('value');

        try {

            const deleted = await interaction.channel.bulkDelete(amount, true);

            const embed = createStandardEmbed(
                interaction,
                {
                    color:
                        '#5865F2'
                }
            )
                .setTitle('Messages Deleted')
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
                    },
                    {
                        name: 'Deleted',
                        value: `${deleted.size} message(s)`,
                        inline: true
                    }
                );

            const response = await interaction.reply({
                embeds: [embed],
                withResponse: true
            });

            const reply =
                response.resource?.message ||
                await interaction.fetchReply();

            await sendLog(interaction, embed);

            setTimeout(async () => {
                await reply.delete().catch(() => {});
            }, 5000);

        } catch (error) {

            console.error(error);

            if (!interaction.replied) {
                await interaction.reply({
                    content: 'Failed to delete messages.',
                    ephemeral: true
                });
            }
        }
    }
};