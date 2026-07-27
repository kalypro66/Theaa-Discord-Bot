const PROVIDERS = [
    {
        name:
            "groq",

        endpoint:
            "https://api.groq.com/openai/v1/chat/completions",

        apiKeyEnvironmentVariable:
            "GROQ_API_KEY",

        models: [
            "llama-3.3-70b-versatile",
            "qwen/qwen3-32b",
            "deepseek-r1-distill-llama-70b"
        ]
    },
    {
        name:
            "openrouter",

        endpoint:
            "https://openrouter.ai/api/v1/chat/completions",

        apiKeyEnvironmentVariable:
            "OPENROUTER_API_KEY",

        models: [
            "deepseek/deepseek-chat-v3-0324:free",
            "qwen/qwen3-235b-a22b:free",
            "google/gemma-3-27b-it:free"
        ]
    }
];

const CLASSIFIER_SYSTEM_PROMPT =
    "Classify the Discord message using the supplied command list. Return one JSON object only. Do not use markdown.";

function getApiKey(provider)
{
    return String(
        process.env[
            provider.apiKeyEnvironmentVariable
        ] || ""
    ).trim();
}

function getResponseText(data)
{
    return String(
        data?.choices?.[0]?.message?.content ||
        ""
    ).trim();
}

async function requestModel({
    provider,
    model,
    prompt
})
{
    const apiKey =
        getApiKey(
            provider
        );

    if (!apiKey)
    {
        return {
            success:
                false,

            skipped:
                true,

            status:
                null
        };
    }

    try
    {
        const response =
            await fetch(
                provider.endpoint,
                {
                    method:
                        "POST",

                    headers: {
                        Authorization:
                            `Bearer ${apiKey}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            model,

                            messages: [
                                {
                                    role:
                                        "system",

                                    content:
                                        CLASSIFIER_SYSTEM_PROMPT
                                },
                                {
                                    role:
                                        "user",

                                    content:
                                        prompt
                                }
                            ],

                            temperature:
                                0,

                            max_tokens:
                                250
                        })
                }
            );

        if (!response.ok)
        {
            return {
                success:
                    false,

                skipped:
                    false,

                status:
                    response.status
            };
        }

        const data =
            await response.json();

        const text =
            getResponseText(
                data
            );

        if (!text)
        {
            return {
                success:
                    false,

                skipped:
                    false,

                status:
                    502
            };
        }

        return {
            success:
                true,

            provider:
                provider.name,

            model,
            text
        };
    }
    catch (error)
    {
        console.error(
            `[Intent] ${provider.name}/${model} crashed.`,
            error
        );

        return {
            success:
                false,

            skipped:
                false,

            status:
                null
        };
    }
}

async function classifyWithProviders(
    prompt
)
{
    for (const provider of PROVIDERS)
    {
        if (!getApiKey(provider))
        {
            console.log(
                `[Intent] Skipping ${provider.name}: API key is not configured.`
            );

            continue;
        }

        for (const model of provider.models)
        {
            console.log(
                `[Intent] Trying ${provider.name}/${model}...`
            );

            const result =
                await requestModel({
                    provider,
                    model,
                    prompt
                });

            if (result.success)
            {
                console.log(
                    `[Intent] ${provider.name}/${model} classified the message.`
                );

                return result;
            }

            console.log(
                `[Intent] ${provider.name}/${model} failed${result.status ? ` (${result.status})` : ""}.`
            );

            if (result.status === 401)
            {
                break;
            }

            if (result.status === 429)
            {
                break;
            }
        }
    }

    return {
        success:
            false,

        text:
            null
    };
}

module.exports = {
    classifyWithProviders
};
