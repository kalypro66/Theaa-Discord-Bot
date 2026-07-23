const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../data/automod.json');

const FEATURES = [
    { name: 'Invites', value: 'invites' },
    { name: 'Links', value: 'links' },
    { name: 'Mass Mentions', value: 'mentions' },
    { name: 'Spam', value: 'spam' },
    { name: 'Everyone & Here', value: 'everyone' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure AutoMod.')

        .addSubcommand(sub =>
            sub
                .setName('enable')
                .setDescription('Enable an AutoMod feature.')
                .addStringOption(option =>
                    option
                        .setName('feature')
                        .setDescription('Select a feature')
                        .setRequired(true)
                        .addChoices(...FEATURES)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName('disable')
                .setDescription('Disable an AutoMod feature.')
                .addStringOption(option =>
                    option
                        .setName('feature')
                        .setDescription('Select a feature')
                        .setRequired(true)
                        .addChoices(...FEATURES)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName('status')
                .setDescription('View AutoMod status.')
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        let data = {};

        if (fs.existsSync(filePath)) {
            data = JSON.parse(
                fs.readFileSync(filePath, 'utf8')
            );
        }

        if (!data[interaction.guild.id]) {

            data[interaction.guild.id] = {
                invites: false,
                links: false,
                mentions: false,
                spam: false,
                everyone: false
            };

        }

        const settings = data[interaction.guild.id];
        const sub = interaction.options.getSubcommand();

        if (sub === 'enable' || sub === 'disable') {

            const feature = interaction.options.getString('feature');

            settings[feature] = sub === 'enable';

            fs.writeFileSync(
                filePath,
                JSON.stringify(data, null, 4)
            );

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('AutoMod Updated')
                .setDescription(
                    `**${feature.charAt(0).toUpperCase() + feature.slice(1)}** has been **${sub === 'enable' ? 'Enabled' : 'Disabled'}**.`
                )
                .addFields({
                    name: 'Moderator',
                    value: `${interaction.user}`,
                    inline: true
                })
                .setFooter({
                    text: `${interaction.client.user.username} | ${interaction.guild.name}`,
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed]
            });

        }
                const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🛡️ AutoMod Status')
            .addFields(
                {
                    name: 'Invites',
                    value: settings.invites ? '🟢 Enabled' : '🔴 Disabled',
                    inline: true
                },
                {
                    name: 'Links',
                    value: settings.links ? '🟢 Enabled' : '🔴 Disabled',
                    inline: true
                },
                {
                    name: 'Mass Mentions',
                    value: settings.mentions ? '🟢 Enabled' : '🔴 Disabled',
                    inline: true
                },
                {
                    name: 'Spam',
                    value: settings.spam ? '🟢 Enabled' : '🔴 Disabled',
                    inline: true
                },
                {
                    name: 'Everyone & Here',
                    value: settings.everyone ? '🟢 Enabled' : '🔴 Disabled',
                    inline: true
                }
            )
            .setFooter({
                text: `${interaction.client.user.username} | ${interaction.guild.name}`,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed]
        });

    }
};