const {
    EmbedBuilder
} = require("discord.js");

const EMBED_COLOR =
    "#5865F2";

const ERROR_COLOR =
    "#ED4245";

const MAX_FIELD_LENGTH =
    1024;

const MAX_FIELDS =
    25;

function cleanDescription(description)
{
    return String(
        description ||
        "No description available."
    )
        .replace(/\s+/g, " ")
        .trim();
}

function splitLines(lines)
{
    const chunks = [];
    let current = "";

    for (const originalLine of lines)
    {
        const line =
            originalLine.length >
            MAX_FIELD_LENGTH
                ? `${originalLine.slice(
                    0,
                    MAX_FIELD_LENGTH - 3
                )}...`
                : originalLine;

        const next =
            current
                ? `${current}\n${line}`
                : line;

        if (
            next.length >
            MAX_FIELD_LENGTH
        )
        {
            if (current)
            {
                chunks.push(
                    current
                );
            }

            current =
                line;
        }
        else
        {
            current =
                next;
        }
    }

    if (current)
    {
        chunks.push(
            current
        );
    }

    return chunks;
}

function formatAliases(aliases)
{
    if (!aliases.length)
        return "None";

    return aliases
        .map(alias =>
            `\`${alias}\``
        )
        .join(", ");
}

function formatPermissions(permissions)
{
    if (!permissions.length)
        return "None";

    return permissions
        .map(permission =>
            String(permission)
        )
        .join(", ");
}

function formatTriggers(triggers)
{
    if (!triggers.length)
        return "None";

    return triggers
        .map(trigger =>
            `\`${trigger}\``
        )
        .join("\n");
}

function createOverviewEmbed({
    client,
    prefix,
    groups,
    totalCommands
})
{
    const embed =
        new EmbedBuilder()
            .setColor(
                EMBED_COLOR
            )
            .setTitle(
                "Theaa Help"
            )
            .setDescription(
                [
                    "Commands are generated automatically from Theaa's registry.",
                    "",
                    `For command details, use \`/help command:<name>\` or \`${prefix}help <name>\`.`
                ].join("\n")
            );

    let fieldCount =
        0;

    for (const group of groups)
    {
        const lines =
            group.commands.map(command =>
            {
                return (
                    `\`${command.name}\` — ` +
                    cleanDescription(
                        command.description
                    )
                );
            });

        const chunks =
            splitLines(
                lines
            );

        for (
            let index = 0;
            index < chunks.length;
            index++
        )
        {
            if (
                fieldCount >=
                MAX_FIELDS
            )
            {
                break;
            }

            embed.addFields({
                name:
                    index === 0
                        ? group.label
                        : `${group.label} continued`,

                value:
                    chunks[index],

                inline:
                    false
            });

            fieldCount++;
        }

        if (
            fieldCount >=
            MAX_FIELDS
        )
        {
            break;
        }
    }

    if (fieldCount === 0)
    {
        embed.addFields({
            name:
                "Commands",

            value:
                "No commands are currently registered."
        });
    }

    embed
        .setFooter({
            text:
                `${client.user.username} | ${totalCommands} commands`,

            iconURL:
                client.user.displayAvatarURL()
        })
        .setTimestamp();

    return embed;
}

function createCommandEmbed({
    client,
    prefix,
    command
})
{
    return new EmbedBuilder()
        .setColor(
            EMBED_COLOR
        )
        .setTitle(
            `Command: ${command.name}`
        )
        .setDescription(
            cleanDescription(
                command.description
            )
        )
        .addFields(
            {
                name:
                    "Category",

                value:
                    command.category
                        .charAt(0)
                        .toUpperCase() +
                    command.category.slice(1),

                inline:
                    true
            },
            {
                name:
                    "Aliases",

                value:
                    formatAliases(
                        command.aliases
                    ),

                inline:
                    true
            },
            {
                name:
                    "Required permissions",

                value:
                    formatPermissions(
                        command.permissions
                    ),

                inline:
                    false
            },
            {
                name:
                    "Usage",

                value:
                    [
                        `Slash: \`/${command.name}\``,
                        `Prefix: \`${prefix}${command.name}\``
                    ].join("\n"),

                inline:
                    false
            },
            {
                name:
                    "Natural-language triggers",

                value:
                    formatTriggers(
                        command.triggers
                    ),

                inline:
                    false
            }
        )
        .setFooter({
            text:
                client.user.username,

            iconURL:
                client.user.displayAvatarURL()
        })
        .setTimestamp();
}

function createNotFoundEmbed({
    client,
    query,
    prefix
})
{
    return new EmbedBuilder()
        .setColor(
            ERROR_COLOR
        )
        .setTitle(
            "Command not found"
        )
        .setDescription(
            [
                `No registered command matches \`${query}\`.`,
                "",
                `Use \`${prefix}help\` to view all available commands.`
            ].join("\n")
        )
        .setFooter({
            text:
                client.user.username,

            iconURL:
                client.user.displayAvatarURL()
        });
}

module.exports = {
    createOverviewEmbed,
    createCommandEmbed,
    createNotFoundEmbed
};
