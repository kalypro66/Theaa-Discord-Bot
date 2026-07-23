const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Shows information about a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you want information about')
                .setRequired(false)
        ),

    async execute(interaction) {

        const user =
            interaction.options.getUser('user') || interaction.user;

        const member =
            interaction.guild.members.cache.get(user.id);

        const roles = member
            ? member.roles.cache
                .filter(role => role.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString())
                .join(', ') || 'None'
            : 'None';

        const boostStatus =
            member && member.premiumSince
                ? 'Yes'
                : 'No';

        const embed = new EmbedBuilder()
            .setColor('#00D9E6')
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`<@${user.id}>`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                {
                    name: 'ID',
                    value: user.id
                },
                {
                    name: 'Created Date',
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>\n(<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`
                },
                {
                    name: 'Join Date',
                    value: member && member.joinedTimestamp
                        ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n(<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)`
                        : 'Unknown'
                },
                {
                    name: 'Server Boost',
                    value: boostStatus
                },
                {
                    name: `Roles (${member ? member.roles.cache.size - 1 : 0})`,
                    value: roles
                }
            )
            .setFooter({
                text: `${interaction.client.user.username} | Today at ${new Date().toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                })}`,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.reply({
            embeds: [embed]
        });
    }
};