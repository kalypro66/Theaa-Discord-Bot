const { buildMessages } = require("./context");
const { addMessage } = require("./memory");

const MODELS = [
    "deepseek/deepseek-chat-v3-0324:free",
    "qwen/qwen3-235b-a22b:free",
    "google/gemma-3-27b-it:free"
];

async function askOpenRouter(context) {

    const messages = buildMessages(context);

    for (const model of MODELS) {

        try {

            const response = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.8
                    })
                }
            );

            if (!response.ok) {

                const error = await response.json();

                console.log(
                    `[OpenRouter] ${model} failed`,
                    error
                );

                continue;

            }

            const data = await response.json();

            const reply =
                data.choices?.[0]?.message?.content ||
                "I don't know what to say 😭";

            addMessage(
                context.guildId,
                context.username,
                context.message
            );

            addMessage(
                context.guildId,
                context.botName || "Thea",
                reply
            );

            return {
                success: true,
                provider: "openrouter",
                model,
                reply
            };

        } catch (err) {

            console.log(
                `[OpenRouter] ${model} crashed`,
                err
            );

        }

    }

    return {
        success: false,
        provider: "openrouter",
        status: 500
    };

}

module.exports = askOpenRouter;