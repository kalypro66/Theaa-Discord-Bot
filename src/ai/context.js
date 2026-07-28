const prompt =
    require("./prompt");

const {
    getHistory
} = require(
    "./memory"
);

function formatMember(
    title,
    member
)
{
    if (!member)
        return "";

    return `${title}

Display Name: ${member.displayName}
Username: @${member.username}
ID: ${member.id}

Highest Role:
${member.highestRole.name}

Roles:
${member.roles.length
    ? member.roles
        .map(role =>
            role.name
        )
        .join(", ")
    : "None"}

Permissions:
${member.permissions.length
    ? member.permissions.join(", ")
    : "None"}
`;
}

function formatHistoryEntry(
    entry
)
{
    if (
        entry.role ===
            "assistant"
    )
    {
        return {
            role:
                "assistant",

            content:
                entry.text
        };
    }

    const speaker =
        entry.speaker ||
        "User";

    return {
        role:
            "user",

        content:
            `${speaker}: ${entry.text}`
    };
}

function buildUserMessageContent(
    context
)
{
    const images =
        Array.isArray(
            context.images
        )
            ? context.images.filter(image => image?.url)
            : [];

    const text =
        `${context.username}:

${context.message}`;

    if (!images.length)
        return text;

    return [
        {
            type:
                "text",
            text:
                `${text}

Attached image count: ${images.length}.
Describe or help with the attached image(s) when relevant.`
        },
        ...images.map(image => ({
            type:
                "image_url",
            image_url: {
                url:
                    image.url
            }
        }))
    ];
}

function buildMessages(
    context
)
{
    const history =
        getHistory(
            context
        );

    const messages = [];

    messages.push({
        role:
            "system",

        content:
            context.systemPrompt ||
            prompt
    });

    if (context.discordContext)
    {
        const {
            server,
            members,
            roles
        } = context.discordContext;

        messages.push({
            role:
                "system",

            content:
`LIVE DISCORD CONTEXT

SERVER

Name: ${server.name}
Members: ${server.memberCount}
Owner: ${server.owner.displayName} (@${server.owner.username})

SERVER ROLES

${roles.map(role =>
`• ${role.name}
Members: ${role.memberCount}
Mentionable: ${role.mentionable}
Hoisted: ${role.hoisted}`
).join("\n\n")}

${formatMember(
    "BOT (YOU)",
    members.bot
)}

${formatMember(
    "MESSAGE AUTHOR",
    members.author
)}

${members.target
    ? formatMember(
        "MENTIONED USER",
        members.target
    )
    : ""}

Everything above is LIVE Discord data.

Never invent:
- roles
- permissions
- ownership
- moderators
- members
- server information

If the answer exists in this context,
use it instead of guessing.
`
        });
    }

    if (Array.isArray(context.images) && context.images.length)
    {
        messages.push({
            role:
                "system",

            content:
                `IMAGE MODE\n\nThe user attached ${context.images.length} image(s). Analyze the image(s) directly. If the user asks what is in the picture, describe what you can actually observe. If text inside the image is readable, you may mention it. If something is unclear, say that it is unclear instead of guessing.`
        });
    }

    for (const entry of history)
    {
        messages.push(
            formatHistoryEntry(
                entry
            )
        );
    }

    messages.push({
        role:
            "user",

        content:
            buildUserMessageContent(
                context
            )
    });

    return messages;
}

module.exports = {
    buildMessages,
    formatHistoryEntry
};
