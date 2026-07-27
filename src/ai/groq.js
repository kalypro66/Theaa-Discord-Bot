const {
    buildMessages
} = require(
    "./context"
);

const MODELS = [
    "llama-3.3-70b-versatile",
    "qwen/qwen3-32b",
    "deepseek-r1-distill-llama-70b"
];

async function askGroq(
    context
)
{
    const messages =
        buildMessages(
            context
        );

    for (const model of MODELS)
    {
        try
        {
            const response =
                await fetch(
                    "https://api.groq.com/openai/v1/chat/completions",
                    {
                        method:
                            "POST",

                        headers: {
                            Authorization:
                                `Bearer ${process.env.GROQ_API_KEY}`,

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                model,
                                messages,
                                temperature:
                                    0.8
                            })
                    }
                );

            if (!response.ok)
            {
                const error =
                    await response.json();

                console.log(
                    `[Groq] ${model} failed`,
                    error
                );

                continue;
            }

            const data =
                await response.json();

            const reply =
                data.choices?.[0]
                    ?.message?.content ||
                "I don't know what to say.";

            return {
                success:
                    true,

                provider:
                    "groq",

                model,

                reply
            };
        }
        catch (error)
        {
            console.log(
                `[Groq] ${model} crashed`,
                error
            );
        }
    }

    return {
        success:
            false,

        provider:
            "groq",

        status:
            500
    };
}

module.exports =
    askGroq;
