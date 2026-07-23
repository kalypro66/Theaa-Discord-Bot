const providerManager = require("./providerManager");

async function askAI(context) {

    try {

        const result =
            await providerManager(context);

        if (result.success) {
            return result.reply;
        }

        return (
            result.reply ||
            "😭 Every AI provider is unavailable."
        );

    } catch (err) {

        console.error(err);

        return "😭 Something went wrong while thinking.";

    }

}

module.exports = askAI;