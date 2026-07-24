const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const {
    createStandardEmbed
} = require("../../discord/embeds/embedStyle");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user from the server')
        .addStringOption(option =>
            option
                .setName('userid')
                .setDescription('The ID of the user to unban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for the unban')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.BanMembers
        ),

    async execute(interaction) {
        const userId = interaction.options.getString('userid');

        const reason =
            interaction.options.getString('reason') ||
            'No reason provided';

        try {
            const ban = await interaction.guild.bans.fetch(userId);

            await interaction.guild.members.unban(
                userId,
                reason
            );

            const embed = createStandardEmbed(
                interaction,
                {
                    color:
                        '#5865F2'
                }
            )
                .setTitle('User Unbanned')
                .setDescription(
                    `${ban.user} has been unbanned from the server.`
                )
                .addFields(
                    {
                        name: 'User',
                        value: `${ban.user}`,
                        inline: true
                    },
                    {
                        name: 'Moderator',
                        value: `${interaction.user}`,
                        inline: true
                    },
                    {
                        name: 'Reason',
                        value: reason,
                        inline: false
                    }
                );

            await interaction.reply({
                embeds: [embed]
            });

        } catch (error) {
            if (error.code === 10026) {
                return interaction.reply({
                    content: 'That user is not currently banned.',
                    ephemeral: true
                });
            }

            console.error(error);

            await interaction.reply({
                content: 'I could not unban that user. Make sure the User ID is correct.',
                ephemeral: true
            });
        }
    }
};