const processAutomod =
    require("../automod/processMessage");

const dispatcher =
    require("../dispatcher/dispatcher");

const discordBrain =
    require("../discord/discordBrain");

const {
    getPrefix
} = require("../discord/prefixManager");

async function isReplyToBot(
    message,
    botId
)
{
    const messageId =
        message.reference?.messageId;

    if (!messageId)
        return false;

    try
    {
        const repliedMessage =
            await message.channel.messages.fetch(
                messageId
            );

        return (
            repliedMessage.author.id ===
            botId
        );
    }
    catch (error)
    {
        console.error(
            "[Message Dispatcher] Failed to fetch replied message:",
            error
        );

        return false;
    }
}

function startTyping(channel)
{
    let active =
        true;

    const sendTyping = () =>
    {
        if (!active)
            return;

        channel.sendTyping()
            .catch(() => {});
    };

    sendTyping();

    const interval =
        setInterval(
            sendTyping,
            8000
        );

    interval.unref?.();

    return () =>
    {
        active =
            false;

        clearInterval(
            interval
        );
    };
}

module.exports = {
    name:
        "messageCreate",

    async execute(message)
    {
        if (message.author.bot)
            return;

        if (!message.guild)
            return;

        /*
        --------------------------------
        Identify Theaa interactions
        --------------------------------
        */

        const botId =
            message.client.user.id;

        const prefix =
            getPrefix(
                message.guild.id
            );

        const mentioned =
            message.mentions.users.has(
                botId
            );

        const repliedToBot =
            await isReplyToBot(
                message,
                botId
            );

        const isPrefixCommand =
            message.content.startsWith(
                prefix
            );

        const isBotInteraction =
            isPrefixCommand ||
            mentioned ||
            repliedToBot;

        /*
        --------------------------------
        AutoMod runs before routing

        Direct Theaa interactions still
        pass link/invite/mention checks,
        but do not count as spam.
        --------------------------------
        */

        const blocked =
            await processAutomod(
                message,
                {
                    skipSpam:
                        isBotInteraction
                }
            );

        if (blocked)
            return;

        if (
            !isPrefixCommand &&
            !mentioned &&
            !repliedToBot
        )
        {
            return;
        }

        /*
        --------------------------------
        Prepare message content
        --------------------------------
        */

        let content =
            message.content;

        if (isPrefixCommand)
        {
            content =
                content
                    .slice(
                        prefix.length
                    )
                    .trim();
        }
        else
        {
            content =
                content
                    .replace(
                        new RegExp(
                            `<@!?${botId}>`,
                            "g"
                        ),
                        ""
                    )
                    .trim();
        }

        if (!content)
        {
            content =
                "Hello!";
        }

        const stopTyping =
            startTyping(
                message.channel
            );

        try
        {
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
        }
        catch (error)
        {
            console.error(
                "[Message Dispatcher]",
                error
            );

            await message.reply({
                content:
                    "Something went wrong while talking to Theaa.",

                allowedMentions: {
                    repliedUser:
                        false
                }
            }).catch(() => {});
        }
        finally
        {
            stopTyping();
        }
    }
};
