const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const {
    createStandardEmbed
} = require("../../discord/embeds/embedStyle");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.KickMembers
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

        if (!member.kickable) {
            return interaction.reply({
                content: 'I cannot kick this member. They may have a higher role than me.',
                ephemeral: true
            });
        }

        try {
            await member.kick(reason);

            const embed = createStandardEmbed(
                interaction,
                {
                    color:
                        '#5865F2'
                }
            )
                .setTitle('Member Kicked')
                .setDescription(
                    `${user} has been kicked from the server.`
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
                content: 'I could not kick that member.',
                ephemeral: true
            });
        }
    }
};