const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const {
    createStandardEmbed
} = require("../../discord/embeds/embedStyle");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeouts a member')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member to timeout')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for the timeout')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');

        const duration = interaction.options.getInteger('duration');

        const reason =
            interaction.options.getString('reason') ||
            'No reason provided';

        const member = await interaction.guild.members
            .fetch(user.id)
            .catch(() => null);

        if (!member) {
            return interaction.reply({
                content: 'That user is not in this server.',
                ephemeral: true
            });
        }

        if (!member.moderatable) {
            return interaction.reply({
                content: 'I cannot timeout this member. They may have a higher role than me.',
                ephemeral: true
            });
        }

        try {
            await member.timeout(
                duration * 60 * 1000,
                reason
            );

            const embed = createStandardEmbed(
                interaction,
                {
                    color:
                        '#5865F2'
                }
            )
                .setTitle('Member Timed Out')
                .setDescription(
                    `${user} has been timed out.`
                )
                .addFields(
                    {
                        name: 'User',
                        value: `${user}`,
                        inline: true
                    },
                    {
                        name: 'Moderator',
                        value: `${interaction.user}`,
                        inline: true
                    },
                    {
                        name: 'Duration',
                        value: `${duration} minute${duration === 1 ? '' : 's'}`,
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
            console.error(error);

            await interaction.reply({
                content: 'I could not timeout that member.',
                ephemeral: true
            });
        }
    }
};