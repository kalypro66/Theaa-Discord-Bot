const providerManager =
    require("./providerManager");

const {
    getProtectedResponse
} = require(
    "./protectedResponses"
);

async function askAI(context)
{
    const protectedReply =
        getProtectedResponse(
            context
        );

    if (protectedReply)
        return protectedReply;

    try
    {
        const result =
            await providerManager(
                context
            );

        if (result.success)
            return result.reply;

        return (
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
