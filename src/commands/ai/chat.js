const {
    SlashCommandBuilder
} = require("discord.js");

const askAI =
    require("../../ai/manager");

async function run(context)
{
    const message =
        (context.args || [])
            .join(" ")
            .trim();

    if (!message)
    {
        return {
            content:
                "Tell me what you want to talk about.",

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    const reply =
        await askAI({
            userId:
                context.user.id,

            guildId:
                context.guild.id,

            channelId:
                context.channel.id,

            username:
                context.member?.displayName ||
                context.user.username,

            message
        });

    return {
        content:
            reply,

        allowedMentions: {
            repliedUser:
                false
        }
    };
}

module.exports = {
    name:
        "chat",

    aliases: [
        "ask theaa",
        "talk to theaa"
    ],

    triggers: [
        "chat with theaa",
        "ask theaa",
        "talk to theaa"
    ],

    category:
        "general",

    description:
        "Chat with Theaa.",

    permissions: [],

    data:
        new SlashCommandBuilder()
            .setName(
                "chat"
            )
            .setDescription(
                "Chat with Theaa."
            )
            .addStringOption(option =>
                option
                    .setName(
                        "message"
                    )
                    .setDescription(
                        "What do you want to say?"
                    )
                    .setRequired(
                        true
                    )
            ),

    run,

    async execute(interaction)
    {
        await interaction.deferReply();

        const reply =
            await run({
                guild:
                    interaction.guild,

                member:
                    interaction.member,

                user:
                    interaction.user,

                channel:
                    interaction.channel,

                client:
                    interaction.client,

                message:
                    null,

                args: [
                    interaction.options.getString(
                        "message",
                        true
                    )
                ]
            });

        await interaction.editReply(
            reply
        );
    }
};
