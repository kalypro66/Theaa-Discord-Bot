const providerManager =
    require("./providerManager");

const {
    getProtectedResponse
} = require(
    "./protectedResponses"
);

const {
    addExchange
} = require(
    "./memory"
);

function normalizeReply(
    reply
)
{
    if (
        typeof reply !==
            "string"
    )
    {
        return reply;
    }

    return reply.replace(
        /^(?:Theaa|Thea):\s*/,
        ""
    );
}

function finishReply(
    context,
    reply
)
{
    const normalized =
        normalizeReply(
            reply
        );

    if (
        typeof normalized ===
            "string" &&
        normalized.trim()
    )
    {
        addExchange(
            context,
            normalized
        );
    }

    return normalized;
}

async function askAI(
    context
)
{
    const protectedReply =
        getProtectedResponse(
            context
        );

    if (protectedReply)
    {
        return finishReply(
            context,
            protectedReply
        );
    }

    try
    {
        const result =
            await providerManager(
                context
            );

        if (result.success)
        {
            return finishReply(
                context,
                result.reply
            );
        }

        return normalizeReply(
            result.reply ||
            "Every AI provider is unavailable right now."
        );
    }
    catch (error)
    {
        console.error(
            error
        );

        return (
            "Something went wrong while thinking."
        );
    }
}

module.exports =
    askAI;
