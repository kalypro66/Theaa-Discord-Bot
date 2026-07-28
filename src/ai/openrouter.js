const {
    buildMessages
} = require(
    "./context"
);

const {
    analyzeImages
} = require(
    "./vision"
);

const GENERAL_TEXT_MODELS = [
    "deepseek/deepseek-chat-v3-0324:free",
    "qwen/qwen3-235b-a22b:free",
    "google/gemma-3-27b-it:free"
];

const DEFAULT_OWNER_DM_MODELS = [
    "cognitivecomputations/dolphin-mistral-24b-venice-edition",
    "inclusionai/ling-3.0-flash:free",
    "openrouter/free"
];

const DEFAULT_REQUEST_TIMEOUT_MS =
    12000;

const OWNER_DM_REFUSAL_PATTERNS = [
    /\bi (?:can(?:not|'t)|won't|am unable to)\s+(?:engage|participate|continue|help|assist)\b/i,
    /\b(?:cannot|can't|won't|unable to)\s+(?:engage|participate)\s+in\s+(?:that|this|sexual|explicit|adult)/i,
    /\blet(?:'s| us)\s+(?:talk|focus)\s+(?:about|on)\s+something else\b/i,
    /\bi (?:can(?:not|'t)|won't)\s+(?:create|continue)\s+(?:explicit|sexual|adult)\s+(?:content|roleplay)/i,
    /\bnot able to help with (?:sexual|explicit|adult) content\b/i,
    /\bi have to keep (?:things|the conversation) (?:appropriate|safe)\b/i,
    /\bi'm here to keep (?:things|the conversation) (?:appropriate|safe)\b/i,
    /\bsorry\b[\s\S]{0,120}\b(?:can't|cannot|won't|unable)\b[\s\S]{0,120}\b(?:sexual|explicit|adult|that|this)\b/i,
    /\bi (?:need|have) to (?:stop|decline|refuse|steer away)\b/i,
    /\bkeep (?:this|things|the conversation) (?:non[- ]?sexual|appropriate|safe|respectful)\b/i,
    /\bi(?:'m| am) not comfortable (?:with|continuing)\b/i,
    /\bcan(?:not|'t) continue (?:with|in) (?:that|this) (?:direction|conversation|roleplay)\b/i
];

const PROHIBITED_OWNER_DM_PATTERNS = [
    /\b(?:minor|underage|child|kid|preteen|loli|shota)\b/i,
    /\b(?:rape|raping|non[- ]?consensual|without consent|forced sex|sexual coercion)\b/i,
    /\b(?:incest|bestiality|zoophilia)\b/i,
    /\b(?:sexual deepfake|nude deepfake|deepfake porn)\b/i
];

function isOwnerDmContext(
    context
)
{
    return Boolean(
        context?.isDirectMessage &&
        context?.relationshipMode ===
            "owner-girlfriend"
    );
}

function parseModelList(
    value
)
{
    return String(
        value ||
        ""
    )
        .split(",")
        .map(model =>
            model.trim()
        )
        .filter(Boolean);
}

function getOwnerDmModels()
{
    const configured =
        parseModelList(
            process.env.OPENROUTER_OWNER_DM_MODELS
        );

    return configured.length
        ? configured
        : DEFAULT_OWNER_DM_MODELS;
}

function getTextModels(
    context
)
{
    return isOwnerDmContext(
        context
    )
        ? getOwnerDmModels()
        : GENERAL_TEXT_MODELS;
}

function isOwnerDmRefusal(
    text
)
{
    const value =
        String(
            text ||
            ""
        ).trim();

    if (!value)
        return true;

    return OWNER_DM_REFUSAL_PATTERNS
        .some(pattern =>
            pattern.test(
                value
            )
        );
}

function isProhibitedOwnerDmRequest(
    context
)
{
    const value =
        String(
            context?.message ||
            ""
        );

    return PROHIBITED_OWNER_DM_PATTERNS
        .some(pattern =>
            pattern.test(
                value
            )
        );
}

function getRequestTimeoutMs()
{
    const configured =
        Number(
            process.env.OPENROUTER_TIMEOUT_MS
        );

    if (!Number.isFinite(configured))
        return DEFAULT_REQUEST_TIMEOUT_MS;

    return Math.min(
        30000,
        Math.max(
            5000,
            Math.trunc(configured)
        )
    );
}

async function fetchWithTimeout(
    url,
    options,
    timeoutMs =
        getRequestTimeoutMs()
)
{
    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () =>
                controller.abort(),
            timeoutMs
        );

    try
    {
        return await fetch(
            url,
            {
                ...options,
                signal:
                    controller.signal
            }
        );
    }
    finally
    {
        clearTimeout(
            timeout
        );
    }
}

function getRequestOptions(
    context
)
{
    if (
        isOwnerDmContext(
            context
        )
    )
    {
        return {
            temperature:
                1.0,

            max_tokens:
                700,

            top_p:
                0.95,

            provider: {
                sort:
                    "throughput",

                allow_fallbacks:
                    true
            }
        };
    }

    return {
        temperature:
            0.7,

        max_tokens:
            900
    };
}

async function readError(
    response
)
{
    const text =
        await response.text()
            .catch(() => "");

    if (!text)
        return {};

    try
    {
        return JSON.parse(
            text
        );
    }
    catch
    {
        return {
            message:
                text.slice(
                    0,
                    500
                )
        };
    }
}

async function askText(
    context
)
{
    if (!process.env.OPENROUTER_API_KEY)
    {
        return {
            success:
                false,

            provider:
                "openrouter",

            status:
                401
        };
    }

    const messages =
        buildMessages(
            context
        );

    const ownerDm =
        isOwnerDmContext(
            context
        );

    const models =
        getTextModels(
            context
        );

    let lastStatus =
        500;

    for (const model of models)
    {
        try
        {
            console.log(
                `[OpenRouter] Trying ${model}${ownerDm ? " for owner DM" : ""}...`
            );

            const response =
                await fetchWithTimeout(
                    "https://openrouter.ai/api/v1/chat/completions",
                    {
                        method:
                            "POST",

                        headers: {
                            Authorization:
                                `Bearer ${process.env.OPENROUTER_API_KEY}`,

                            "Content-Type":
                                "application/json",

                            "HTTP-Referer":
                                "https://github.com/kalypro66/Theaa-Discord-Bot",

                            "X-Title":
                                "Theaa Discord Bot"
                        },

                        body:
                            JSON.stringify({
                                model,
                                messages,
                                ...getRequestOptions(
                                    context
                                )
                            })
                    }
                );

            lastStatus =
                response.status;

            if (!response.ok)
            {
                const error =
                    await readError(
                        response
                    );

                console.log(
                    `[OpenRouter] ${model} failed with ${response.status}`,
                    error
                );

                continue;
            }

            const data =
                await response.json();

            const reply =
                data.choices?.[0]
                    ?.message?.content ||
                "";

            if (
                ownerDm &&
                isOwnerDmRefusal(
                    reply
                )
            )
            {
                if (
                    isProhibitedOwnerDmRequest(
                        context
                    )
                )
                {
                    return {
                        success:
                            true,

                        provider:
                            "openrouter",

                        model,

                        reply
                    };
                }

                console.log(
                    `[OpenRouter] ${model} gave a generic owner-DM refusal; trying the next model.`
                );

                continue;
            }

            if (!reply.trim())
                continue;

            return {
                success:
                    true,

                provider:
                    "openrouter",

                model,

                reply
            };
        }
        catch (error)
        {
            if (
                error?.name ===
                "AbortError"
            )
            {
                console.log(
                    `[OpenRouter] ${model} timed out after ${getRequestTimeoutMs()}ms.`
                );
            }
            else
            {
                console.log(
                    `[OpenRouter] ${model} crashed`,
                    error
                );
            }
        }
    }

    return {
        success:
            false,

        provider:
            "openrouter",

        status:
            lastStatus
    };
}

async function askOpenRouter(
    context
)
{
    if (
        Array.isArray(
            context?.images
        ) &&
        context.images.length
    )
    {
        return analyzeImages(
            context
        );
    }

    return askText(
        context
    );
}

askOpenRouter.isOwnerDmContext =
    isOwnerDmContext;

askOpenRouter.isOwnerDmRefusal =
    isOwnerDmRefusal;

askOpenRouter.isProhibitedOwnerDmRequest =
    isProhibitedOwnerDmRequest;

askOpenRouter.getOwnerDmModels =
    getOwnerDmModels;

askOpenRouter.getTextModels =
    getTextModels;

askOpenRouter.getRequestTimeoutMs =
    getRequestTimeoutMs;

askOpenRouter.fetchWithTimeout =
    fetchWithTimeout;

module.exports =
    askOpenRouter;
