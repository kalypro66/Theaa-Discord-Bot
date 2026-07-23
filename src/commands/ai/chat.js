const {
    SlashCommandBuilder
} = require("discord.js");

const askAI = require("../../ai/manager");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("chat")
        .setDescription("Chat with Thea.")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("What do you want to say?")
                .setRequired(true)
        ),

    async execute(interaction) {

        const message =
            interaction.options.getString("message");

        await interaction.deferReply();

        try {

            const reply = await askAI({
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                channelId: interaction.channel.id,
                username: interaction.user.username,
                message
            });

            await interaction.editReply({
                content: reply
            });

        } catch (err) {

            console.error(err);

            await interaction.editReply({
                content: "❌ Something went wrong while talking to Thea."
            });

        }

    }

};