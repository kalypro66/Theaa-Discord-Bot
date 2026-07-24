const USER_ID_PATTERN =
    /\b(\d{17,20})\b/;

const USER_MENTION_PATTERN =
    /<@!?(\d{17,20})>/;

const SELF_WORDS =
    new Set([
        "me",
        "my",
        "mine",
        "myself",
        "self",
        "own"
    ]);

const POLITE_TERMS = [
    "please",
    "pls",
    "plz"
];

function escapeRegExp(text)
{
    return String(text)
        .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
}

function normalizeArgs(args)
{
    return (
        Array.isArray(args)
            ? args
            : []
    )
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
}

function removeTerms(
    text,
    terms
)
{
    let cleaned =
        String(text || "");

    const uniqueTerms = [
        ...new Set([
            ...POLITE_TERMS,
            ...(terms || [])
        ])
    ]
        .filter(Boolean)
        .sort(
            (first, second) =>
                second.length -
                first.length
        );

    for (const term of uniqueTerms)
    {
        const pattern =
            escapeRegExp(term)
                .replace(
                    /\s+/g,
                    "\\s+"
                );

        cleaned =
            cleaned.replace(
                new RegExp(
                    `\\b${pattern}\\b`,
                    "gi"
                ),
                " "
            );
    }

    return cleaned
        .replace(
            USER_MENTION_PATTERN,
            " "
        )
        .replace(
            USER_ID_PATTERN,
            " "
        )
        .replace(/\s+/g, " ")
        .trim();
}

function isSelfRequest(text)
{
    if (!text)
        return true;

    const words =
        text
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

    return (
        words.length > 0 &&
        words.every(word =>
            SELF_WORDS.has(word)
        )
    );
}

function getMentionedUser(context)
{
    if (
        !context.message ||
        !context.message.mentions
    )
    {
        return null;
    }

    return (
        context.message.mentions.users.find(
            user =>
                user.id !==
                context.client.user.id
        ) || null
    );
}

function getExplicitUserId(text)
{
    const mentionMatch =
        String(text || "")
            .match(
                USER_MENTION_PATTERN
            );

    if (mentionMatch)
        return mentionMatch[1];

    const idMatch =
        String(text || "")
            .match(
                USER_ID_PATTERN
            );

    return idMatch
        ? idMatch[1]
        : null;
}

async function fetchGuildMember(
    guild,
    userId
)
{
    const cachedMember =
        guild.members.cache.get(
            userId
        );

    if (cachedMember)
        return cachedMember;

    return guild.members.fetch(
        userId
    ).catch(() => null);
}

function failure(
    code,
    message
)
{
    return {
        ok: false,
        code,
        message
    };
}

async function resolveMember(
    context,
    options = {}
)
{
    if (
        !context.guild ||
        !context.user
    )
    {
        return failure(
            "SERVER_ONLY",
            "This command can only be used in a server."
        );
    }

    const argsText =
        normalizeArgs(
            context.args
        );

    let targetId =
        context.targetMember?.id ||
        context.targetUser?.id ||
        null;

    if (!targetId)
    {
        const mentionedUser =
            getMentionedUser(
                context
            );

        targetId =
            mentionedUser?.id ||
            null;
    }

    if (!targetId)
    {
        targetId =
            getExplicitUserId(
                argsText
            );
    }

    const requestText =
        removeTerms(
            argsText,
            options.ignoredTerms
        );

    if (!targetId)
    {
        if (
            isSelfRequest(
                requestText
            )
        )
        {
            targetId =
                context.user.id;
        }
        else
        {
            return failure(
                "TARGET_REQUIRED",
                "I couldn't resolve that server member. Mention them or provide their user ID."
            );
        }
    }

    let member = null;

    if (
        context.member?.id ===
        targetId
    )
    {
        member =
            context.member;
    }

    if (!member)
    {
        member =
            await fetchGuildMember(
                context.guild,
                targetId
            );
    }

    if (!member)
    {
        return failure(
            "MEMBER_NOT_FOUND",
            "That person isn't in this server."
        );
    }

    return {
        ok: true,
        member,
        user:
            member.user
    };
}

function createMemberErrorReply(
    resolution
)
{
    return {
        content:
            resolution.message,

        allowedMentions: {
            repliedUser:
                false
        }
    };
}

module.exports = {
    resolveMember,
    createMemberErrorReply
};
