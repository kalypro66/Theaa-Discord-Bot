const {
    prepareImagesForVision
} = require(
    "./attachments"
);

const {
    getHistory
} = require(
    "./memory"
);

const MODEL_CACHE_MS =
    30 * 60 * 1000;

const MAX_OPENROUTER_MODELS =
    3;

const REQUEST_TIMEOUT_MS =
    45000;

const MAX_RECENT_HISTORY_ENTRIES =
    12;

const MAX_RECENT_HISTORY_CHARACTERS =
    6500;

const DEFAULT_GROQ_VISION_MODELS = [
    "qwen/qwen3.6-27b"
];

let modelCache = {
    expiresAt:
        0,

    models: []
};

const GENERIC_REFUSAL_PATTERNS = [
    /unable to (?:describe|analy[sz]e|assist|help)/i,
    /cannot (?:describe|analy[sz]e|assist|help)/i,
    /can't (?:describe|analy[sz]e|assist|help)/i,
    /violates? (?:the )?(?:guidelines|policy|policies)/i,
    /inappropriate and violates/i,
    /content (?:is )?not allowed/i,
    /not able to process (?:this|the) image/i,
    /as an ai/i
];

function isGenericRefusal(text)
{
    const value =
        String(text || "")
            .trim();

    if (!value)
        return true;

    return GENERIC_REFUSAL_PATTERNS
        .some(pattern =>
            pattern.test(
                value
            )
        );
}

function getConfiguredModels(
    environmentVariable
)
{
    return String(
        process.env[
            environmentVariable
        ] ||
        ""
    )
        .split(",")
        .map(value =>
            value.trim()
        )
        .filter(Boolean);
}

function getConfiguredVisionModels()
{
    return getConfiguredModels(
        "OPENROUTER_VISION_MODELS"
    );
}

function getGroqVisionModels()
{
    const configured =
        getConfiguredModels(
            "GROQ_VISION_MODELS"
        );

    return configured.length
        ? configured
        : DEFAULT_GROQ_VISION_MODELS;
}

function isFreeModel(model)
{
    if (
        String(model.id || "")
            .endsWith(":free")
    )
    {
        return true;
    }

    const pricing =
        model.pricing || {};

    return (
        Number(pricing.prompt || 0) === 0 &&
        Number(pricing.completion || 0) === 0
    );
}

async function discoverVisionModels()
{
    const configured =
        getConfiguredVisionModels();

    if (configured.length)
        return configured;

    if (
        modelCache.expiresAt >
            Date.now() &&
        modelCache.models.length
    )
    {
        return modelCache.models;
    }

    if (!process.env.OPENROUTER_API_KEY)
        return [];

    try
    {
        const response =
            await fetch(
                "https://openrouter.ai/api/v1/models?input_modalities=image&output_modalities=text&sort=throughput-high-to-low",
                {
                    headers: {
                        Authorization:
                            `Bearer ${process.env.OPENROUTER_API_KEY}`
                    }
                }
            );

        if (!response.ok)
        {
            throw new Error(
                `Model discovery failed with status ${response.status}.`
            );
        }

        const data =
            await response.json();

        const discovered =
            (data.data || [])
                .filter(model =>
                    model?.architecture
                        ?.input_modalities
                        ?.includes("image") &&
                    model?.architecture
                        ?.output_modalities
                        ?.includes("text") &&
                    isFreeModel(
                        model
                    )
                )
                .map(model =>
                    model.id
                )
                .filter(Boolean)
                .slice(
                    0,
                    MAX_OPENROUTER_MODELS
                );

        const models = [
            ...new Set([
                "openrouter/free",
                ...discovered
            ])
        ];

        modelCache = {
            expiresAt:
                Date.now() +
                MODEL_CACHE_MS,

            models
        };

        return models;
    }
    catch (error)
    {
        console.error(
            "[Vision] OpenRouter model discovery failed:",
            error.message
        );

        return [
            "openrouter/free"
        ];
    }
}

async function getVisionAttempts()
{
    const attempts = [];

    if (process.env.OPENROUTER_API_KEY)
    {
        const models =
            await discoverVisionModels();

        for (const model of models)
        {
            attempts.push({
                provider:
                    "openrouter",

                endpoint:
                    "https://openrouter.ai/api/v1/chat/completions",

                apiKey:
                    process.env.OPENROUTER_API_KEY,

                model,

                useDataUrls:
                    true
            });
        }
    }

    if (process.env.GROQ_API_KEY)
    {
        for (
            const model of
            getGroqVisionModels()
        )
        {
            attempts.push({
                provider:
                    "groq",

                endpoint:
                    "https://api.groq.com/openai/v1/chat/completions",

                apiKey:
                    process.env.GROQ_API_KEY,

                model,

                useDataUrls:
                    false
            });
        }
    }

    return attempts;
}

function formatHistoryEntry(entry)
{
    const role =
        entry?.role ===
            "assistant"
            ? "Theaa"
            : String(
                entry?.speaker ||
                "User"
            ).trim() ||
                "User";

    return `${role}: ${String(entry?.text || "").trim()}`;
}

function getRecentConversation(
    context
)
{
    const entries =
        getHistory(
            context
        )
            .slice(
                -MAX_RECENT_HISTORY_ENTRIES
            );

    const selected = [];
    let characters = 0;

    for (
        let index =
            entries.length - 1;
        index >= 0;
        index -= 1
    )
    {
        const line =
            formatHistoryEntry(
                entries[index]
            );

        if (!line.trim())
            continue;

        if (
            selected.length &&
            characters +
                line.length >
                MAX_RECENT_HISTORY_CHARACTERS
        )
        {
            break;
        }

        selected.unshift(
            line
        );

        characters +=
            line.length;
    }

    return selected.join(
        "\n"
    );
}

function buildVisionTaskText(
    context
)
{
    const currentMessage =
        String(
            context?.message ||
            "[Sent an image without a caption]"
        ).trim();

    const recentConversation =
        getRecentConversation(
            context
        );

    return `RECENT CONVERSATION
${recentConversation || "No earlier messages are available."}

LATEST USER MESSAGE
${currentMessage}

The attached image is the user's newest message in this same conversation.
Inspect it for the details needed to continue the conversation naturally.
Do not default to a generic image description.
If the recent conversation was troubleshooting and this is a screenshot, read the relevant command, error, and output, then capture the details needed for the next solution.
If the image was sent during an ongoing personal, romantic, or adult conversation in the verified owner DM, capture what is visibly relevant so the conversational reply can continue in the same context.
Only produce a standalone visual description when the user explicitly asked for one or no useful conversational intent can be inferred.`;
}

function createVisionSystemPrompt(
    context,
    {
        adultRetry =
            false
    } = {}
)
{
    const ownerDm =
        Boolean(
            context?.isDirectMessage
        );

    const surfaceRule =
        ownerDm
            ? `If clearly adult sexual content is visible, classify it as ADULT and provide a concise, factual, non-graphic description. Do not refuse solely because clearly adult nudity or consensual adult sexual content is present.`
            : `If explicit sexual activity or explicit sexual nudity is visible, classify it as ADULT and leave the answer empty. Do not mention DMs, private access, or where adult analysis may be available.`;

    const retryRule =
        adultRetry && ownerDm
            ? `A previous model refused without analyzing the image. Do the visual task directly. Benign images must be described normally. Clearly adult content may be identified factually and non-graphically.`
            : "";

    return `You are Theaa's visual-analysis engine.

Return one JSON object only, with this exact shape:
{"classification":"SFW","answer":"concise visual context needed for the next conversational reply"}

Allowed classification values:
- SFW: ordinary content, including non-explicit romance, swimwear, memes, screenshots, art, objects, people, animals, and scenery.
- ADULT: explicit sexual activity or explicit sexual nudity involving clearly adult subjects.
- SAFETY_BLOCK: sexual content involving a minor, a possible minor, or a subject whose adult age cannot be established from the image.

Rules:
- Analyze the supplied image instead of discussing policies.
- The answer field is visual context for another conversational model, not automatically a standalone description.
- Focus on details that help answer the latest message and continue the recent conversation.
- Describe only what is visibly supported.
- Do not invent identities, relationships, ages, locations, or hidden context.
- Read visible text when the user asks, but state when text is unclear.
- Never call an ordinary benign image inappropriate.
- Never return a generic refusal or mention platform guidelines.
- ${surfaceRule}
- For SAFETY_BLOCK, leave the answer empty.
- Do not eroticize, roleplay, or write graphic sexual detail.
- Keep the answer concise, useful, and directly relevant to the user's request and recent conversation.
${retryRule}`;
}

function buildVisionContent(
    context,
    preparedImages,
    {
        useDataUrls =
            false
    } = {}
)
{
    return [
        {
            type:
                "text",

            text:
                buildVisionTaskText(
                    context
                )
        },
        ...preparedImages.map(image => ({
            type:
                "image_url",

            image_url: {
                url:
                    useDataUrls
                        ? image.dataUrl
                        : image.url ||
                            image.dataUrl
            }
        }))
    ];
}

function extractJson(text)
{
    const cleaned =
        String(text || "")
            .trim()
            .replace(
                /^```(?:json)?\s*/i,
                ""
            )
            .replace(
                /\s*```$/,
                ""
            )
            .trim();

    const firstBrace =
        cleaned.indexOf(
            "{"
        );

    const lastBrace =
        cleaned.lastIndexOf(
            "}"
        );

    if (
        firstBrace === -1 ||
        lastBrace < firstBrace
    )
    {
        return null;
    }

    return cleaned.slice(
        firstBrace,
        lastBrace + 1
    );
}

function parseVisionResponse(text)
{
    if (
        !text ||
        isGenericRefusal(
            text
        )
    )
    {
        return null;
    }

    const json =
        extractJson(
            text
        );

    if (!json)
        return null;

    try
    {
        const parsed =
            JSON.parse(
                json
            );

        const classification =
            String(
                parsed.classification ||
                ""
            )
                .trim()
                .toUpperCase();

        if (
            ![
                "SFW",
                "ADULT",
                "SAFETY_BLOCK"
            ].includes(
                classification
            )
        )
        {
            return null;
        }

        return {
            classification,
            answer:
                String(
                    parsed.answer ||
                    ""
                ).trim()
        };
    }
    catch
    {
        return null;
    }
}

async function requestModel({
    attempt,
    context,
    preparedImages,
    adultRetry =
        false,
    systemPrompt =
        null,
    userText =
        null
})
{
    const controller =
        new AbortController();

    const timer =
        setTimeout(
            () =>
                controller.abort(),
            REQUEST_TIMEOUT_MS
        );

    try
    {
        const response =
            await fetch(
                attempt.endpoint,
                {
                    method:
                        "POST",

                    signal:
                        controller.signal,

                    headers: {
                        Authorization:
                            `Bearer ${attempt.apiKey}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            model:
                                attempt.model,

                            messages: [
                                {
                                    role:
                                        "system",

                                    content:
                                        systemPrompt ||
                                        createVisionSystemPrompt(
                                            context,
                                            {
                                                adultRetry
                                            }
                                        )
                                },
                                {
                                    role:
                                        "user",

                                    content:
                                        buildVisionContent(
                                            {
                                                ...context,
                                                message:
                                                    userText ||
                                                    context.message
                                            },
                                            preparedImages,
                                            {
                                                useDataUrls:
                                                    attempt.useDataUrls
                                            }
                                        )
                                }
                            ],

                            temperature:
                                0.1,

                            response_format: {
                                type:
                                    "json_object"
                            },

                            max_tokens:
                                900
                        })
                }
            );

        if (!response.ok)
        {
            const body =
                await response.text()
                    .catch(() => "");

            throw new Error(
                `${attempt.model} returned ${response.status}${body ? `: ${body.slice(0, 240)}` : ""}`
            );
        }

        const data =
            await response.json();

        return String(
            data.choices?.[0]
                ?.message?.content ||
            ""
        ).trim();
    }
    finally
    {
        clearTimeout(
            timer
        );
    }
}

function createVisionResult(
    parsed,
    context,
    attempt
)
{
    if (
        parsed.classification ===
        "SAFETY_BLOCK"
    )
    {
        return {
            success:
                true,

            provider:
                attempt.provider,

            model:
                attempt.model,

            classification:
                "SAFETY_BLOCK",

            blocked:
                true,

            visualContext:
                "",

            reply:
                "I can't analyze sexual content involving a minor or someone whose adult age is unclear."
        };
    }

    if (
        parsed.classification ===
        "ADULT" &&
        !context.isDirectMessage
    )
    {
        return {
            success:
                true,

            provider:
                attempt.provider,

            model:
                attempt.model,

            classification:
                "ADULT",

            blocked:
                true,

            visualContext:
                "",

            reply:
                "Sorry, I can't help with that image."
        };
    }

    const fallback =
        parsed.classification ===
            "ADULT"
            ? "The image contains explicit adult content involving clearly adult subjects."
            : "I can see the image, but the model did not return a useful description.";

    const visualContext =
        parsed.answer ||
        fallback;

    return {
        success:
            true,

        provider:
            attempt.provider,

        model:
            attempt.model,

        classification:
            parsed.classification,

        blocked:
            false,

        visualContext,

        reply:
            visualContext
    };
}

async function analyzeImages(
    context
)
{
    if (
        !process.env.GROQ_API_KEY &&
        !process.env.OPENROUTER_API_KEY
    )
    {
        return {
            success:
                false,

            status:
                401,

            reply:
                "No vision provider is configured."
        };
    }

    const preparedImages =
        await prepareImagesForVision(
            context.images
        );

    if (!preparedImages.length)
    {
        return {
            success:
                false,

            status:
                400,

            reply:
                "I couldn't download the attached image. Try sending it again as a PNG, JPG, WebP, or GIF."
        };
    }

    const attempts =
        await getVisionAttempts();

    let lastError =
        null;

    for (const attempt of attempts)
    {
        try
        {
            console.log(
                `[Vision] Trying ${attempt.provider}/${attempt.model}...`
            );

            const raw =
                await requestModel({
                    attempt,
                    context,
                    preparedImages
                });

            let parsed =
                parseVisionResponse(
                    raw
                );

            if (
                !parsed &&
                context.isDirectMessage
            )
            {
                console.log(
                    `[Vision] ${attempt.provider}/${attempt.model} did not return usable JSON; retrying owner-DM analysis.`
                );

                const retryRaw =
                    await requestModel({
                        attempt,
                        context,
                        preparedImages,
                        adultRetry:
                            true
                    });

                parsed =
                    parseVisionResponse(
                        retryRaw
                    );
            }

            if (!parsed)
            {
                console.log(
                    `[Vision] ${attempt.provider}/${attempt.model} returned a refusal or invalid response.`
                );

                continue;
            }

            return createVisionResult(
                parsed,
                context,
                attempt
            );
        }
        catch (error)
        {
            lastError =
                error;

            console.error(
                `[Vision] ${attempt.provider}/${attempt.model} failed:`,
                error.message
            );
        }
    }

    return {
        success:
            false,

        status:
            502,

        reply:
            "I couldn't get a reliable description from the available vision models right now.",

        error:
            lastError
    };
}

async function chooseBestImage(
    query,
    candidates
)
{
    const preparedImages =
        await prepareImagesForVision(
            candidates,
            6
        );

    if (!preparedImages.length)
        return null;

    const attempts =
        await getVisionAttempts();

    const systemPrompt =
        `You compare candidate images. Return one JSON object only in the form {"index":0}. Choose the image that best matches the user's request. Candidate order is zero-based and follows the image order in the request. Do not add explanation.`;

    const userText =
        `Choose the best candidate for: ${query}`;

    for (const attempt of attempts)
    {
        try
        {
            const raw =
                await requestModel({
                    attempt,
                    context: {
                        message:
                            userText,
                        isDirectMessage:
                            true
                    },
                    preparedImages,
                    systemPrompt,
                    userText
                });

            const json =
                extractJson(
                    raw
                );

            if (!json)
                continue;

            const parsed =
                JSON.parse(
                    json
                );

            const index =
                Number(
                    parsed.index
                );

            if (
                Number.isInteger(
                    index
                ) &&
                index >= 0 &&
                index < preparedImages.length
            )
            {
                return index;
            }
        }
        catch (error)
        {
            console.error(
                `[Vision Rank] ${attempt.provider}/${attempt.model} failed:`,
                error.message
            );
        }
    }

    return null;
}

module.exports = {
    isGenericRefusal,
    discoverVisionModels,
    getVisionAttempts,
    getRecentConversation,
    buildVisionTaskText,
    createVisionSystemPrompt,
    parseVisionResponse,
    analyzeImages,
    chooseBestImage
};
