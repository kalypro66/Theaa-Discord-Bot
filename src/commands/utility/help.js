const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all commands'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📖 Help Menu')
            .setDescription('Here are my available commands.')
            .addFields(
                {
                    name: '🏓 Utility',
                    value: '`/ping` - Check bot latency\n`/help` - Show this menu'
                }
            )
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};