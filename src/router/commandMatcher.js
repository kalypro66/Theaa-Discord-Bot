const {
    getAllCommands
} = require("./commandRegistry");

function normalize(text)
{
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[?!.,]/g, "")
        .replace(/\s+/g, " ");
}

function getPhrases(command)
{
    return [
        command.name,
        ...(command.aliases || []),
        ...(command.triggers || []),
        ...(command.examples || [])
    ]
        .filter(Boolean)
        .sort(
            (first, second) =>
                second.length -
                first.length
        );
}

function matchCommandInput(message)
{
    const original =
        String(message || "")
            .trim();

    const text =
        normalize(original);

    for (const command of getAllCommands())
    {
        for (const phrase of getPhrases(command))
        {
            const normalizedPhrase =
                normalize(phrase);

            if (
                text !== normalizedPhrase &&
                !text.startsWith(
                    `${normalizedPhrase} `
                )
            )
            {
                continue;
            }

            const phraseWordCount =
                String(phrase)
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .length;

            const args =
                original
                    .split(/\s+/)
                    .slice(
                        phraseWordCount
                    );

            return {
                command,
                phrase,
                args
            };
        }
    }

    return null;
}

function matchCommand(message)
{
    return matchCommandInput(
        message
    )?.command || null;
}

module.exports =
    matchCommand;

module.exports.matchCommandInput =
    matchCommandInput;
