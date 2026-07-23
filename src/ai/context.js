const prompt = require("./prompt");
const { getHistory } = require("./memory");

function formatMember(title, member) {

    if (!member) return "";

    return `${title}

Display Name: ${member.displayName}
Username: @${member.username}
ID: ${member.id}

Highest Role:
${member.highestRole.name}

Roles:
${member.roles.length
    ? member.roles.map(r => r.name).join(", ")
    : "None"}

Permissions:
${member.permissions.length
    ? member.permissions.join(", ")
    : "None"}
`;

}

function buildMessages(context) {

    const history =
        getHistory(context.guildId);

    const messages = [];

    messages.push({
        role: "system",
        content: prompt
    });

    if (context.discordContext) {

        const {
            server,
            members,
            roles
        } = context.discordContext;

        messages.push({
            role: "system",
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

${formatMember("BOT (YOU)", members.bot)}

${formatMember("MESSAGE AUTHOR", members.author)}

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

    for (const msg of history) {

        messages.push({
            role: "user",
            content:
`${msg.speaker}: ${msg.text}`
        });

    }

    messages.push({

        role: "user",

        content:
`${context.username}:

${context.message}`

    });

    return messages;

}

module.exports = {
    buildMessages
};