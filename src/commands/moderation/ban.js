const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const {
    createStandardEmbed
} = require("../../discord/embeds/embedStyle");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a member from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.BanMembers
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');

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

        if (!member.bannable) {
            return interaction.reply({
                content: 'I cannot ban this member. They may have a higher role than me.',
                ephemeral: true
            });
        }

        try {
            await member.ban({
                reason: reason
            });

            const embed = createStandardEmbed(
                interaction,
                {
                    color:
                        '#5865F2'
                }
            )
                .setTitle('Member Banned')
                .setDescription(
                    `${user} has been banned from the server.`
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
                content: 'I could not ban that member.',
                ephemeral: true
            });
        }
    }
};