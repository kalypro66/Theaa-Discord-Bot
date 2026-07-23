const routeIntent =
    require("./routeIntent");

const classifyIntent =
    require("../ai/classifyIntent");

const matchCommand =
    require("../router/commandMatcher");

const {
    findCommand,
    getAllCommands
} = require("../router/commandRegistry");

function normalize(text)
{
    return text
        .toLowerCase()
        .replace(/[?!.,]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function escapeRegExp(text)
{
    return text.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}

function getCommandNames(command)
{
    return [
        command.data?.name,
        command.name,
        ...(command.aliases || [])
    ].filter(Boolean);
}

function extractArgs(content, command)
{
    let cleaned =
        content.trim();

    cleaned =
        cleaned.replace(
            /^(show|send|get|give|display|view|see|open|check)\s+/i,
            ""
        );

    const names =
        getCommandNames(command)
            .sort(
                (a, b) =>
                    b.length - a.length
            );

    for (const name of names)
    {
        const pattern =
            escapeRegExp(name)
                .replace(/\s+/g, "\\s+");

        cleaned =
            cleaned.replace(
                new RegExp(
                    `\\b${pattern}\\b`,
                    "i"
                ),
                " "
            );
    }

    return cleaned
        .replace(/\s+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

function findNamedCommand(content)
{
    const normalized =
        normalize(content);

    const isActionRequest =
        /^(show|send|get|give|display|view|see|open|check)\b/i
            .test(normalized);

    if (!isActionRequest)
        return null;

    const paddedText =
        ` ${normalized} `;

    for (const command of getAllCommands())
    {
        for (
            const name of
            getCommandNames(command)
        )
        {
            const normalizedName =
                normalize(name);

            if (
                paddedText.includes(
                    ` ${normalizedName} `
                )
            )
            {
                return command;
            }
        }
    }

    return null;
}

function detectLocalCommand(content)
{
    const trimmed =
        content.trim();

    const words =
        trimmed.split(/\s+/);

    const directCommand =
        findCommand(
            words[0]?.toLowerCase()
        );

    if (directCommand)
    {
        return {
            type:
                "command",

            command:
                directCommand.name,

            args:
                words.slice(1)
        };
    }

    const triggerCommand =
        matchCommand(trimmed);

    if (triggerCommand)
    {
        return {
            type:
                "command",

            command:
                triggerCommand.name,

            args:
                extractArgs(
                    trimmed,
                    triggerCommand
                )
        };
    }

    const namedCommand =
        findNamedCommand(trimmed);

    if (namedCommand)
    {
        return {
            type:
                "command",

            command:
                namedCommand.name,

            args:
                extractArgs(
                    trimmed,
                    namedCommand
                )
        };
    }

    return null;
}

module.exports = async function dispatcher({
    message,
    context
})
{
    if (
        message.content.startsWith(
            context.prefix || ""
        )
    )
    {
        return routeIntent({
            intent: {
                type:
                    "command"
            },
            message,
            context
        });
    }

    const localIntent =
        detectLocalCommand(
            context.message
        );

    if (localIntent)
    {
        return routeIntent({
            intent:
                localIntent,
            message,
            context
        });
    }

    const aiIntent =
        await classifyIntent(
            context
        );

    return routeIntent({
        intent:
            aiIntent,
        message,
        context
    });
};
