const {
    getCommandMetadata
} = require(
    "../router/commandRegistry"
);

const {
    classifyWithProviders
} = require(
    "./intentProvider"
);

function conversationIntent()
{
    return {
        type:
            "conversation"
    };
}

function buildCommandList()
{
    return getCommandMetadata()
        .map(command =>
        {
            const aliases =
                command.aliases.length
                    ? command.aliases.join(
                        ", "
                    )
                    : "None";

            const triggers =
                command.triggers.length
                    ? command.triggers.join(
                        ", "
                    )
                    : "None";

            return `Command:
${command.name}

Description:
${command.description || "No description"}

Aliases:
${aliases}

Triggers:
${triggers}`;
        })
        .join(
            "\n\n------------------------------\n\n"
        );
}

function buildPrompt(
    context,
    commandList
)
{
    return `You are an intent classifier for a Discord bot.

Your ONLY job is deciding whether the user wants to execute a command.

Return ONLY valid JSON.

Conversation:

{
  "type":"conversation"
}

Command:

{
  "type":"command",
  "command":"<command name>",
  "args":[]
}

Rules:

- args must always exist for a command.
- args must be an array.
- If no arguments exist, return [].
- If the user mentions a person, put the person's name in args.
- If the user gives extra information, include it in args.
- Never invent arguments.
- Never invent a command name.
- If the user is just chatting, return {"type":"conversation"}.

Available Commands

${commandList}

User:

${context.message}`;
}

function extractJson(
    text
)
{
    const cleaned =
        String(text || "")
            .trim()
            .replace(
                /^```(?:json)?\s*/i,
                ""
            )
            .replace(
                /\s*```$/,
                ""
            )
            .trim();

    const firstBrace =
        cleaned.indexOf(
            "{"
        );

    const lastBrace =
        cleaned.lastIndexOf(
            "}"
        );

    if (
        firstBrace === -1 ||
        lastBrace < firstBrace
    )
    {
        return null;
    }

    return cleaned.slice(
        firstBrace,
        lastBrace + 1
    );
}

function normalizeIntent(
    rawIntent,
    commandNames
)
{
    if (
        !rawIntent ||
        typeof rawIntent !==
            "object"
    )
    {
        return conversationIntent();
    }

    if (
        rawIntent.type !==
            "command"
    )
    {
        return conversationIntent();
    }

    const commandName =
        String(
            rawIntent.command ||
            ""
        )
            .trim()
            .toLowerCase();

    if (
        !commandNames.has(
            commandName
        )
    )
    {
        return conversationIntent();
    }

    return {
        type:
            "command",

        command:
            commandName,

        args:
            Array.isArray(
                rawIntent.args
            )
                ? rawIntent.args
                    .map(value =>
                        String(value)
                    )
                    .filter(Boolean)
                : []
    };
}

module.exports =
    async function classifyIntent(
        context
    )
    {
        const commandMetadata =
            getCommandMetadata();

        const commandNames =
            new Set(
                commandMetadata.map(
                    command =>
                        command.name
                )
            );

        const prompt =
            buildPrompt(
                context,
                buildCommandList()
            );

        const response =
            await classifyWithProviders(
                prompt
            );

        if (!response.success)
        {
            return conversationIntent();
        }

        try
        {
            const jsonText =
                extractJson(
                    response.text
                );

            if (!jsonText)
            {
                return conversationIntent();
            }

            const result =
                normalizeIntent(
                    JSON.parse(
                        jsonText
                    ),
                    commandNames
                );

            console.log(
                "[Intent]",
                JSON.stringify(
                    result
                )
            );

            return result;
        }
        catch (error)
        {
            console.error(
                "[Intent] Invalid classifier response.",
                error
            );

            return conversationIntent();
        }
    };
