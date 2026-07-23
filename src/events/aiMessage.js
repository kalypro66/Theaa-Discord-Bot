const askAI =
    require("../ai/manager");

const dispatcher =
    require("../dispatcher/dispatcher");

const discordBrain =
    require("../discord/discordBrain");

const {
    getPrefix
} = require("../discord/prefixManager");

module.exports = {

    name: "messageCreate",

    async execute(message) {

        if (message.author.bot) return;
        if (!message.guild) return;

        const botId =
            message.client.user.id;

        const prefix =
            getPrefix(message.guild.id);

        const mentioned =
            message.mentions.users.has(botId);

        const replied =
            message.reference &&
            message.reference.messageId;

        let repliedToBot = false;

        if (replied) {

            try {

                const repliedMessage =
                    await message.channel.messages.fetch(
                        message.reference.messageId
                    );

                repliedToBot =
                    repliedMessage.author.id === botId;

            } catch (err) {

                console.error(err);

            }

        }

        const isPrefixCommand =
            message.content.startsWith(prefix);

        if (
            !isPrefixCommand &&
            !mentioned &&
            !repliedToBot
        ) return;

        let content = message.content;

        if (isPrefixCommand) {

            content = content
                .slice(prefix.length)
                .trim();

        } else {

            content = content
                .replace(
                    new RegExp(`<@!?${botId}>`, "g"),
                    ""
                )
                .trim();

        }

        if (!content.length)
            content = "Hello!";

        try {

            const discordContext =
                await discordBrain.getContext({
                    message
                });

            const context = {

                guildId:
                    message.guild.id,

                userId:
                    message.author.id,

                username:
                    message.member?.displayName ||
                    message.author.username,

                channelId:
                    message.channel.id,

                channelName:
                    message.channel.name ||
                    "unknown",

                botName:
                    message.client.user.username,

                prefix,

                message:
                    content,

                discordContext

            };

            await dispatcher({

                message,

                context

            });

        } catch (err) {

            console.error(err);

            await message.reply(
                "❌ Something went wrong while talking to Theaa."
            );

        }

    }

};