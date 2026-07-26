const providerManager =
    require("./providerManager");

const {
    getProtectedResponse
} = require(
    "./protectedResponses"
);

function normalizeReply(reply)
{
    if (typeof reply !== "string")
        return reply;

    return reply.replace(
        /^(?:Theaa|Thea):\s*/,
        ""
    );
}

async function askAI(context)
{
    const protectedReply =
        getProtectedResponse(
            context
        );

    if (protectedReply)
        return normalizeReply(
            protectedReply
        );

    try
    {
        const result =
            await providerManager(
                context
            );

        if (result.success)
            return normalizeReply(
                result.reply
            );

        return normalizeReply(
            result.reply ||
            "Every AI provider is unavailable right now."
        );
    }
    catch (error)
    {
        console.error(error);

        return (
            "Something went wrong while thinking."
        );
    }
}

module.exports =
    askAI;
