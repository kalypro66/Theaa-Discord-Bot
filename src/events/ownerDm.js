const {
    isDeveloper
} = require("../config/developer");

const {
    startTyping
} = require("../utils/typingIndicator");

const ownerDmPrompt =
    require("../ai/prompt/ownerDm");

function getDmContent(message)
{
    const content =
        String(
            message?.content || ""
        ).trim();

    return content ||
        "Hello!";
}

function isAuthorizedOwnerDm(message)
{
    return Boolean(
        message &&
        !message.guild &&
        !message.author?.bot &&
        isDeveloper(
            message.author?.id
        )
    );
}

function createDmContext(message)
{
    const userId =
        String(
            message.author.id
        );

    return {
        guildId:
            `dm:${userId}`,

        memoryKey:
            `dm:${userId}`,

        userId,

        username:
            message.author.globalName ||
            message.author.username ||
            "Developer",

        channelId:
            message.channel.id,

        channelName:
            "Direct Message",

        botName:
            message.client.user.username,

        prefix:
            "",

        message:
            getDmContent(message),

        discordContext:
            null,

        systemPrompt:
            ownerDmPrompt,

        isDirectMessage:
            true,

        relationshipMode:
            "owner-girlfriend"
    };
}

async function handleOwnerDm(
    message,
    {
        ask
    } = {}
)
{
    if (
        !isAuthorizedOwnerDm(
            message
        )
    )
    {
        return {
            handled:
                false,

            reason:
                "unauthorized"
        };
    }

    const askAI =
        typeof ask ===
            "function"
            ? ask
            : require("../ai/manager");

    const stopTyping =
        startTyping(
            message.channel
        );

    try
    {
        const context =
            createDmContext(
                message
            );

        const reply =
            await askAI(
                context
            );

        const content =
            typeof reply ===
                "string" &&
            reply.trim()
                ? reply
                : "I couldn't think of a reply.";

        await message.reply({
            content,
            allowedMentions: {
                repliedUser:
                    false
            }
        });

        return {
            handled:
                true,

            context
        };
    }
    catch (error)
    {
        console.error(
            "[Owner DM]",
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

        return {
            handled:
                true,

            error
        };
    }
    finally
    {
        stopTyping();
    }
}

module.exports = {
    getDmContent,
    isAuthorizedOwnerDm,
    createDmContext,
    handleOwnerDm
};
