const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const { sendLog } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Add a role to a member.')
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('The member')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('The role to add')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageRoles
        ),

    async execute(interaction) {

        const member = interaction.options.getMember('member');
        const role = interaction.options.getRole('role');

        if (!member) {
            return interaction.reply({
                content: 'That member could not be found.',
                ephemeral: true
            });
        }

        if (role.id === interaction.guild.id) {
            return interaction.reply({
                content: 'You cannot manage the everyone role.',
                ephemeral: true
            });
        }

        if (role.managed) {
            return interaction.reply({
                content: 'That role is managed by Discord and cannot be assigned.',
                ephemeral: true
            });
        }

        if (member.roles.cache.has(role.id)) {
            return interaction.reply({
                content: 'That member already has this role.',
                ephemeral: true
            });
        }

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({
                content: 'My highest role must be above the selected role.',
                ephemeral: true
            });
        }

        if (
            interaction.member.id !== interaction.guild.ownerId &&
            role.position >= interaction.member.roles.highest.position
        ) {
            return interaction.reply({
                content: 'You cannot manage a role equal to or higher than your highest role.',
                ephemeral: true
            });
        }

        await member.roles.add(role);

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('Role Added')
            .addFields(
                {
                    name: 'Member',
                    value: `${member}`,
                    inline: true
                },
                {
                    name: 'Role',
                    value: `${role}`,
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: `${interaction.user}`,
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