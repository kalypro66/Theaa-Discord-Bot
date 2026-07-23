const askGemini = require("./gemini");
const askGroq = require("./groq");
const askOpenRouter = require("./openrouter");

const providers = [
    {
        name: "gemini",
        priority: 1,
        cooldownUntil: 0,
        ask: askGemini
    },
    {
        name: "groq",
        priority: 2,
        cooldownUntil: 0,
        ask: askGroq
    },
    {
        name: "openrouter",
        priority: 3,
        cooldownUntil: 0,
        ask: askOpenRouter
    }
];

async function providerManager(context) {

    const now = Date.now();

    const available = providers
        .filter(provider => provider.cooldownUntil <= now)
        .sort((a, b) => a.priority - b.priority);

    for (const provider of available) {

        try {

            console.log(`[AI] Trying ${provider.name}...`);

            const result = await provider.ask(context);

            if (result.success) {

                console.log(
                    `[AI] ${provider.name} (${result.model || "default"}) answered.`
                );

                return result;

            }

            if (
                result.status === 429 &&
                result.retryAfter
            ) {

                provider.cooldownUntil =
                    Date.now() +
                    result.retryAfter * 1000;

            }

            console.log(
                `[AI] ${provider.name} failed.`
            );

        } catch (err) {

            console.error(
                `[AI] ${provider.name} crashed.`,
                err
            );

        }

    }

    return {
        success: false,
        reply: "😭 Every AI provider is currently unavailable."
    };

}

module.exports = providerManager;