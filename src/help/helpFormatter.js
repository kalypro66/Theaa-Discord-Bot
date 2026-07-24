const {
    createStandardEmbed,
    ERROR_EMBED_COLOR
} = require("../discord/embeds/embedStyle");

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

function createOverviewPages({
    client,
    guild,
    prefix,
    groups,
    totalCommands
})
{
    const firstPageCategories =
        new Set([
            "utility",
            "information",
            "server"
        ]);

    const pageGroups = [
        groups.filter(group =>
            firstPageCategories.has(
                group.category
            )
        ),

        groups.filter(group =>
            !firstPageCategories.has(
                group.category
            )
        )
    ].filter(page =>
        page.length > 0
    );

    if (pageGroups.length === 0)
    {
        pageGroups.push([]);
    }

    const pageCount =
        pageGroups.length;

    return pageGroups.map(
        (
            page,
            pageIndex
        ) =>
        {
            const embed =
                createStandardEmbed({
                    client,
                    guild
                })
                    .setTitle(
                        "Theaa Help"
                    )
                    .setDescription(
                        [
                            "Commands are generated automatically from Theaa's registry.",
                            `Registered commands: **${totalCommands}**.`,
                            `Page **${pageIndex + 1} of ${pageCount}**.`,
                            "",
                            `For command details, use \`/help command:<name>\` or \`${prefix}help <name>\`.`
                        ].join("\n")
                    );

            let fieldCount =
                0;

            for (const group of page)
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
                    index < chunks.length &&
                    fieldCount < MAX_FIELDS;
                    index++
                )
                {
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

            return embed;
        }
    );
}

function createCommandEmbed({
    client,
    guild,
    prefix,
    command
})
{
    return createStandardEmbed({
        client,
        guild
    })
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
        );
}

function createNotFoundEmbed({
    client,
    guild,
    query,
    prefix
})
{
    return createStandardEmbed(
        {
            client,
            guild
        },
        {
            color:
                ERROR_EMBED_COLOR
        }
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
        );
}

module.exports = {
    createOverviewPages,
    createCommandEmbed,
    createNotFoundEmbed
};
