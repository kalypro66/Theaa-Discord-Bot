const {
    isDeveloper
} = require("../config/developer");

const {
    startTyping
} = require("../utils/typingIndicator");

const ownerDmPrompt =
    require("../ai/prompt/ownerDm");

const {
    getImageAttachments
} = require("../ai/attachments");

const siteImageCommand =
    require("../commands/ai/siteimage");

const nsfwImageCommand =
    require("../commands/ai/nsfwimage");

const nsfwGifCommand =
    require("../commands/ai/nsfwgif");

const OWNER_DM_AI_TIMEOUT_MS =
    40000;

const DISCORD_MESSAGE_LIMIT =
    1900;

function getDmContent(message)
{
    const content =
        String(
            message?.content || ""
        ).trim();

    if (content)
        return content;

    const images =
        getImageAttachments(
            message
        );

    if (images.length)
    {
        return "[Sent an image without a caption]";
    }

    return "Hello!";
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

        isNsfwChannel:
            true,

        relationshipMode:
            "owner-girlfriend",

        images:
            getImageAttachments(
                message
            )
    };
}

function getNsfwImagePrompt(content)
{
    const match =
        content.match(
            /^(?:\/?nsfwimage|\/?adultimage|\/?hentaiimage)\s+(.+)$/i
        );

    return match?.[1]?.trim() ||
        null;
}

function getNsfwGifPrompt(content)
{
    const match =
        content.match(
            /^(?:\/?nsfwgif|\/?adultgif|\/?hentaigif)\s+(.+)$/i
        );

    return match?.[1]?.trim() ||
        null;
}

function getSiteImageRequest(content)
{
    const urlMatch =
        content.match(
            /https?:\/\/[^\s<>]+/i
        );

    if (!urlMatch)
        return null;

    const startsWithUrl =
        content.trim()
            .startsWith(
                urlMatch[0]
            );

    const explicitlyRequestsImages =
        /^(?:\/?siteimage|\/?siteimages|websiteimage|webimage)\b/i.test(content) ||
        /\b(?:images?|pics?|photos?)\s+from\b/i.test(content) ||
        /\b(?:send|show|get|find)\s+(?:me\s+)?(?:images?|pics?|photos?)\b/i.test(content);

    if (
        !startsWithUrl &&
        !explicitlyRequestsImages
    )
    {
        return null;
    }

    const url =
        urlMatch[0]
            .replace(
                /[),.;!?]+$/,
                ""
            );

    const query =
        content
            .replace(
                urlMatch[0],
                " "
            )
            .replace(
                /^(?:\/?siteimage|\/?siteimages|websiteimage|webimage)\b/i,
                " "
            )
            .replace(
                /\b(?:send|show|get|find)\s+(?:me\s+)?(?:images?|pics?|photos?)\s+from\b/i,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    return {
        url,
        query
    };
}

function normalizeToolReply(reply)
{
    if (
        typeof reply ===
        "string"
    )
    {
        return {
            content:
                reply
        };
    }

    return {
        ...(reply || {})
    };
}

async function runOwnerDmTool(message)
{
    const content =
        String(
            message.content ||
            ""
        ).trim();

    const nsfwImagePrompt =
        getNsfwImagePrompt(
            content
        );

    if (nsfwImagePrompt)
    {
        return normalizeToolReply(
            await nsfwImageCommand.run({
                guild:
                    null,

                user:
                    message.author,

                channel:
                    message.channel,

                client:
                    message.client,

                message,

                args:
                    nsfwImagePrompt.split(
                        /\s+/
                    )
            })
        );
    }

    const nsfwGifPrompt =
        getNsfwGifPrompt(
            content
        );

    if (nsfwGifPrompt)
    {
        return normalizeToolReply(
            await nsfwGifCommand.run({
                guild:
                    null,

                user:
                    message.author,

                channel:
                    message.channel,

                client:
                    message.client,

                message,

                args:
                    nsfwGifPrompt.split(
                        /\s+/
                    )
            })
        );
    }

    const siteRequest =
        getSiteImageRequest(
            content
        );

    if (siteRequest)
    {
        return normalizeToolReply(
            await siteImageCommand.run({
                guild:
                    null,

                user:
                    message.author,

                channel:
                    message.channel,

                client:
                    message.client,

                message,

                args: [
                    siteRequest.url,
                    ...siteRequest.query
                        .split(
                            /\s+/
                        )
                        .filter(Boolean)
                ]
            })
        );
    }

    return null;
}

function withTimeout(
    promise,
    timeoutMs =
        OWNER_DM_AI_TIMEOUT_MS
)
{
    let timeout;

    const timeoutPromise =
        new Promise((resolve) =>
        {
            timeout =
                setTimeout(
                    () =>
                        resolve({
                            timedOut:
                                true
                        }),
                    timeoutMs
                );
        });

    return Promise.race([
        Promise.resolve(promise)
            .then(value => ({
                timedOut:
                    false,
                value
            })),
        timeoutPromise
    ]).finally(() =>
        clearTimeout(
            timeout
        )
    );
}

function splitDiscordText(
    text,
    limit =
        DISCORD_MESSAGE_LIMIT
)
{
    const value =
        String(
            text ||
            ""
        ).trim();

    if (!value)
        return [];

    const chunks = [];
    let remaining =
        value;

    while (
        remaining.length >
        limit
    )
    {
        let splitAt =
            remaining.lastIndexOf(
                "\n",
                limit
            );

        if (splitAt < limit * 0.5)
        {
            splitAt =
                remaining.lastIndexOf(
                    " ",
                    limit
                );
        }

        if (splitAt < limit * 0.5)
            splitAt = limit;

        chunks.push(
            remaining
                .slice(
                    0,
                    splitAt
                )
                .trim()
        );

        remaining =
            remaining
                .slice(
                    splitAt
                )
                .trim();
    }

    if (remaining)
        chunks.push(remaining);

    return chunks;
}

async function sendOwnerDmText(
    message,
    text
)
{
    const chunks =
        splitDiscordText(
            text
        );

    if (!chunks.length)
    {
        chunks.push(
            "I couldn't think of a reply."
        );
    }

    await message.reply({
        content:
            chunks[0],

        allowedMentions: {
            repliedUser:
                false
        }
    });

    for (
        const chunk of
        chunks.slice(1)
    )
    {
        await message.channel.send({
            content:
                chunk,

            allowedMentions: {
                parse: []
            }
        });
    }
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
        const toolReply =
            await runOwnerDmTool(
                message
            );

        if (toolReply)
        {
            toolReply.allowedMentions ??= {
                repliedUser:
                    false
            };

            await message.reply(
                toolReply
            );

            return {
                handled:
                    true,

                tool:
                    true
            };
        }

        const context =
            createDmContext(
                message
            );

        const result =
            await withTimeout(
                askAI(
                    context
                )
            );

        const content =
            result.timedOut
                ? "I'm having trouble replying right now. Try again in a moment."
                : typeof result.value ===
                    "string" &&
                result.value.trim()
                    ? result.value
                    : "I couldn't think of a reply.";

        if (result.timedOut)
        {
            console.error(
                `[Owner DM] AI response timed out after ${OWNER_DM_AI_TIMEOUT_MS}ms.`
            );
        }

        await sendOwnerDmText(
            message,
            content
        );

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
                "Something went wrong while handling that request.",

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
    getNsfwImagePrompt,
    getNsfwGifPrompt,
    getSiteImageRequest,
    runOwnerDmTool,
    withTimeout,
    splitDiscordText,
    sendOwnerDmText,
    handleOwnerDm
};
