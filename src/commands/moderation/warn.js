const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const { sendLog } = require('../../utils/logger');
const warningsPath = path.join(
    __dirname,
    '../../../data/warnings.json'
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a member')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member to warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for the warning')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
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

        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: 'You cannot warn yourself.',
                ephemeral: true
            });
        }

        let warnings = {};

        try {
            warnings = JSON.parse(
                fs.readFileSync(warningsPath, 'utf8')
            );
        } catch (error) {
            console.error(error);
        }

        const guildId = interaction.guild.id;

        if (!warnings[guildId]) {
            warnings[guildId] = {};
        }

        if (!warnings[guildId][user.id]) {
            warnings[guildId][user.id] = [];
        }

        warnings[guildId][user.id].push({
            reason: reason,
            moderator: interaction.user.id,
            timestamp: Date.now()
        });

        fs.writeFileSync(
            warningsPath,
            JSON.stringify(warnings, null, 4)
        );

        const warningCount =
            warnings[guildId][user.id].length;

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('Member Warned')
            .setDescription(
                `${user} has received a warning.`
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
                    name: 'Warnings',
                    value: `${warningCount}`,
                    inline: true
                },
                {
                    name: 'Reason',
                    value: reason,
                    inline: false
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