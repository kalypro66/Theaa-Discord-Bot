const createMessageInteraction =
    require("./messageInteractionAdapter");

function createRunContext(
    message,
    args
)
{
    return {
        guild:
            message.guild,
        member:
            message.member,
        user:
            message.author,
        channel:
            message.channel,
        client:
            message.client,
        message,
        args
    };
}

async function sendRunResult(
    message,
    result
)
{
    if (!result)
        return null;

    let replyOptions;

    if (
        typeof result === "object" &&
        typeof result.toJSON ===
            "function" &&
        result.data
    )
    {
        replyOptions = {
            embeds: [
                result
            ]
        };
    }
    else if (
        typeof result === "string"
    )
    {
        replyOptions = {
            content:
                result
        };
    }
    else
    {
        replyOptions =
            result;
    }

    const {
        afterReply,
        ...response
    } = replyOptions;

    response.allowedMentions ??= {
        repliedUser:
            false
    };

    const replyMessage =
        await message.reply(
            response
        );

    if (
        typeof afterReply ===
        "function"
    )
    {
        await afterReply(
            replyMessage
        );
    }

    return replyMessage;
}

module.exports =
    async function executeCommand(
        message,
        command,
        providedArgs = null
    )
    {
        const args =
            Array.isArray(providedArgs)
                ? providedArgs
                : message.content
                    .trim()
                    .split(/\s+/)
                    .slice(1);

        if (
            typeof command.run ===
            "function"
        )
        {
            const result =
                await command.run(
                    createRunContext(
                        message,
                        args
                    )
                );

            return sendRunResult(
                message,
                result
            );
        }

        if (
            typeof command.executeMessage ===
            "function"
        )
        {
            return command.executeMessage(
                message,
                args
            );
        }

        if (
            typeof command.execute ===
            "function"
        )
        {
            const {
                blocked,
                interaction
            } =
                await createMessageInteraction(
                    message,
                    command,
                    args
                );

            if (blocked)
                return null;

            return command.execute.call(
                command,
                interaction
            );
        }

        return message.reply({
            content:
                "This command is unavailable.",
            allowedMentions: {
                repliedUser:
                    false
            }
        });
    };

module.exports.sendRunResult =
    sendRunResult;
