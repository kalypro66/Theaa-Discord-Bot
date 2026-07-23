const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Shows a user banner')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user whose banner you want to view')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user =
            interaction.options.getUser('user') ||
            interaction.user;

        const fetchedUser = await user.fetch();

        if (!fetchedUser.banner) {
            return interaction.reply({
                content: `${user.username} does not have a profile banner.`,
                ephemeral: true
            });
        }

        const bannerURL = fetchedUser.bannerURL({
            extension: 'png',
            size: 4096
        });

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setAuthor({
                name: `${user.username}'s Banner`,
                iconURL: user.displayAvatarURL()
            })
            .setImage(bannerURL)
            .setFooter({
                text: `${interaction.client.user.username} | ${interaction.guild.name}`,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.reply({
            embeds: [embed]
        });
    }
};