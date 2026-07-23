const { GoogleGenAI } = require("@google/genai");

const { buildMessages } = require("./context");
const { addMessage } = require("./memory");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function askGemini(context) {

    const messages = buildMessages(context);

    const systemPrompt = messages
        .filter(msg => msg.role === "system")
        .map(msg => msg.content)
        .join("\n\n");

    const conversation = messages
        .filter(msg => msg.role !== "system")
        .map(msg => msg.content)
        .join("\n\n");

    const contents = [
        {
            role: "user",
            parts: [
                {
                    text:
`${systemPrompt}

${conversation}`
                }
            ]
        }
    ];

    try {

        const response =
            await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents
            });

        const reply =
            response.text ||
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
            provider: "gemini",
            reply
        };

    } catch (error) {

        console.error(error);

        const status =
            error.status || error.code;

        let retryAfter = null;

        if (status === 429 && error.message) {

            const match =
                error.message.match(
                    /retry in ([\\d.]+)s/i
                );

            if (match) {

                retryAfter = Math.ceil(
                    parseFloat(match[1])
                );

            }

        }

        return {
            success: false,
            provider: "gemini",
            status,
            retryAfter,
            error
        };

    }

}

module.exports = askGemini;