const memory =
    new Map();

const MAX_HISTORY_MESSAGES =
    120;

const MAX_HISTORY_CHARACTERS =
    30000;

function getMemoryKey(
    value
)
{
    if (
        value &&
        typeof value ===
            "object"
    )
    {
        return String(
            value.memoryKey ||
            value.guildId ||
            value.channelId ||
            value.userId ||
            "global"
        );
    }

    return String(
        value ||
        "global"
    );
}

function getHistory(
    value
)
{
    const key =
        getMemoryKey(
            value
        );

    if (!memory.has(key))
    {
        memory.set(
            key,
            []
        );
    }

    return memory.get(
        key
    );
}

function normalizeEntry(
    entryOrSpeaker,
    text,
    role
)
{
    if (
        entryOrSpeaker &&
        typeof entryOrSpeaker ===
            "object"
    )
    {
        return {
            role:
                entryOrSpeaker.role ===
                    "assistant"
                    ? "assistant"
                    : "user",

            speaker:
                String(
                    entryOrSpeaker.speaker ||
                    ""
                ).trim(),

            text:
                String(
                    entryOrSpeaker.text ||
                    ""
                ).trim()
        };
    }

    return {
        role:
            role === "assistant"
                ? "assistant"
                : "user",

        speaker:
            String(
                entryOrSpeaker ||
                ""
            ).trim(),

        text:
            String(
                text ||
                ""
            ).trim()
    };
}

function getCharacterCount(
    history
)
{
    return history.reduce(
        (
            total,
            entry
        ) =>
            total +
            entry.text.length +
            entry.speaker.length,
        0
    );
}

function trimHistory(
    history
)
{
    while (
        history.length >
        MAX_HISTORY_MESSAGES
    )
    {
        history.shift();
    }

    while (
        history.length > 2 &&
        getCharacterCount(
            history
        ) >
            MAX_HISTORY_CHARACTERS
    )
    {
        history.shift();
    }
}

function addMessage(
    value,
    entryOrSpeaker,
    text,
    role
)
{
    const entry =
        normalizeEntry(
            entryOrSpeaker,
            text,
            role
        );

    if (!entry.text)
        return;

    const history =
        getHistory(
            value
        );

    history.push(
        entry
    );

    trimHistory(
        history
    );
}

function addExchange(
    context,
    assistantReply
)
{
    const userMessage =
        String(
            context?.message ||
            ""
        ).trim();

    const reply =
        String(
            assistantReply ||
            ""
        ).trim();

    if (
        !userMessage ||
        !reply
    )
    {
        return;
    }

    addMessage(
        context,
        {
            role:
                "user",

            speaker:
                context.username ||
                "User",

            text:
                userMessage
        }
    );

    addMessage(
        context,
        {
            role:
                "assistant",

            speaker:
                context.botName ||
                "Theaa",

            text:
                reply
        }
    );
}

function clearHistory(
    value
)
{
    memory.delete(
        getMemoryKey(
            value
        )
    );
}

module.exports = {
    MAX_HISTORY_MESSAGES,
    MAX_HISTORY_CHARACTERS,
    getMemoryKey,
    getHistory,
    addMessage,
    addExchange,
    clearHistory
};
