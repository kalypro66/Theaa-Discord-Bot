const {
    SlashCommandBuilder
} = require("discord.js");

async function run()
{
    return {
        content:
            "🏓 Pong!",

        allowedMentions: {
            repliedUser:
                false
        }
    };
}

module.exports = {
    name:
        "ping",

    aliases: [
        "latency",
        "botping"
    ],

    triggers: [
        "check ping",
        "show ping",
        "check latency"
    ],

    category:
        "utility",

    description:
        "Checks whether Theaa is responding.",

    permissions: [],

    data:
        new SlashCommandBuilder()
            .setName(
                "ping"
            )
            .setDescription(
                "Replies with Pong!"
            ),

    run,

    async execute(interaction)
    {
        const reply =
            await run();

        await interaction.reply(
            reply
        );
    }
};
