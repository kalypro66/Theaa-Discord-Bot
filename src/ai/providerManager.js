const askGroq =
    require("./groq");

const askOpenRouter =
    require("./openrouter");

const {
    analyzeImages
} = require(
    "./vision"
);

const providers = [
    {
        name:
            "groq",

        priority:
            1,

        ownerDmEnabled:
            false,

        cooldownUntil:
            0,

        ask:
            askGroq
    },
    {
        name:
            "openrouter",

        priority:
            2,

        ownerDmEnabled:
            true,

        cooldownUntil:
            0,

        ask:
            askOpenRouter
    }
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

function getProviderOrder(
    context,
    now =
        Date.now()
)
{
    const ownerDm =
        isOwnerDmContext(
            context
        );

    return providers
        .filter(provider =>
            provider.cooldownUntil <=
                now &&
            (
                !ownerDm ||
                provider.ownerDmEnabled
            )
        )
        .sort(
            (first, second) =>
                first.priority -
                second.priority
        );
}

function createImageContinuationContext(
    context,
    visionResult
)
{
    const originalMessage =
        String(
            context?.message ||
            "[Sent an image without a caption]"
        ).trim();

    const visualContext =
        String(
            visionResult?.visualContext ||
            visionResult?.reply ||
            ""
        ).trim();

    const classification =
        String(
            visionResult?.classification ||
            "SFW"
        ).trim();

    return {
        ...context,

        images:
            [],

        imageClassification:
            classification,

        visualContext,

        message:
`The user has just sent an image as the newest message in this ongoing conversation.

ACTUAL USER TEXT
${originalMessage}

PRIVATE VISUAL CONTEXT
Classification: ${classification}
${visualContext}

Respond to the actual user naturally using the recent conversation and the visual context.
Continue the existing task, topic, mood, or roleplay instead of resetting the conversation.
For a troubleshooting screenshot, identify the relevant error and give the next practical step.
Do not merely describe the whole image unless the user asked for a description.
Do not mention this internal visual-context block.`
    };
}

async function askTextProviders(
    context
)
{
    const ownerDm =
        isOwnerDmContext(
            context
        );

    const available =
        getProviderOrder(
            context
        );

    for (const provider of available)
    {
        try
        {
            console.log(
                `[AI] Trying ${provider.name}...`
            );

            const result =
                await provider.ask(
                    context
                );

            if (result.success)
            {
                console.log(
                    `[AI] ${provider.name} (${result.model || "default"}) answered.`
                );

                return result;
            }

            if (
                result.status === 429 &&
                result.retryAfter
            )
            {
                provider.cooldownUntil =
                    Date.now() +
                    result.retryAfter *
                        1000;
            }

            if (result.reply)
                return result;

            console.log(
                `[AI] ${provider.name} failed.`
            );
        }
        catch (error)
        {
            console.error(
                `[AI] ${provider.name} crashed.`,
                error
            );
        }
    }

    return {
        success:
            false,

        reply:
            ownerDm
                ? "I'm having trouble replying right now. Try again in a moment."
                : "Every AI provider is currently unavailable."
    };
}

async function handleImageConversation(
    context
)
{
    const visionResult =
        await analyzeImages(
            context
        );

    if (
        !visionResult.success ||
        visionResult.blocked
    )
    {
        return visionResult;
    }

    const continuationContext =
        createImageContinuationContext(
            context,
            visionResult
        );

    const conversationalResult =
        await askTextProviders(
            continuationContext
        );

    if (conversationalResult.success)
    {
        return {
            ...conversationalResult,

            imageClassification:
                visionResult.classification,

            visualContext:
                visionResult.visualContext
        };
    }

    console.log(
        "[Vision] Conversational continuation failed; using the factual vision response."
    );

    return visionResult;
}

async function providerManager(
    context
)
{
    const hasImages =
        Array.isArray(
            context?.images
        ) &&
        context.images.length > 0;

    if (hasImages)
    {
        return handleImageConversation(
            context
        );
    }

    return askTextProviders(
        context
    );
}

providerManager.isOwnerDmContext =
    isOwnerDmContext;

providerManager.getProviderOrder =
    getProviderOrder;

providerManager.createImageContinuationContext =
    createImageContinuationContext;

providerManager.askTextProviders =
    askTextProviders;

providerManager.handleImageConversation =
    handleImageConversation;

module.exports =
    providerManager;
