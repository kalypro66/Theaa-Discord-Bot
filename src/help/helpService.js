function getRegistry()
{
    return require(
        "../router/commandRegistry"
    );
}

const CATEGORY_ORDER = [
    "utility",
    "information",
    "moderation",
    "ai",
    "general"
];

const CATEGORY_LABELS = {
    utility:
        "Utility",

    information:
        "Information",

    moderation:
        "Moderation",

    ai:
        "AI",

    general:
        "General"
};

function normalizeCategory(category)
{
    return String(
        category || "general"
    )
        .trim()
        .toLowerCase();
}

function normalizeCommand(command)
{
    return {
        name:
            String(
                command.name || "unknown"
            ).toLowerCase(),

        description:
            String(
                command.description ||
                "No description available."
            ).trim(),

        category:
            normalizeCategory(
                command.category
            ),

        aliases:
            Array.isArray(
                command.aliases
            )
                ? command.aliases
                : [],

        triggers:
            Array.isArray(
                command.triggers
            )
                ? command.triggers
                : [],

        permissions:
            Array.isArray(
                command.permissions
            )
                ? command.permissions
                : []
    };
}

function getCommands()
{
    return getRegistry()
        .getCommandMetadata()
        .map(normalizeCommand)
        .sort((first, second) =>
        {
            return first.name.localeCompare(
                second.name
            );
        });
}

function getGroupedCommands()
{
    const groups =
        new Map();

    for (const command of getCommands())
    {
        if (
            !groups.has(
                command.category
            )
        )
        {
            groups.set(
                command.category,
                []
            );
        }

        groups.get(
            command.category
        ).push(
            command
        );
    }

    return [...groups.entries()]
        .map(([category, commands]) =>
        {
            return {
                category,

                label:
                    CATEGORY_LABELS[
                        category
                    ] ||
                    category
                        .charAt(0)
                        .toUpperCase() +
                    category.slice(1),

                commands
            };
        })
        .sort((first, second) =>
        {
            const firstIndex =
                CATEGORY_ORDER.indexOf(
                    first.category
                );

            const secondIndex =
                CATEGORY_ORDER.indexOf(
                    second.category
                );

            const safeFirst =
                firstIndex === -1
                    ? CATEGORY_ORDER.length
                    : firstIndex;

            const safeSecond =
                secondIndex === -1
                    ? CATEGORY_ORDER.length
                    : secondIndex;

            if (
                safeFirst !==
                safeSecond
            )
            {
                return (
                    safeFirst -
                    safeSecond
                );
            }

            return first.label.localeCompare(
                second.label
            );
        });
}

function cleanQuery(query)
{
    return String(
        query || ""
    )
        .trim()
        .replace(
            /^[/!?]+/,
            ""
        )
        .split(/\s+/)[0]
        .toLowerCase();
}

function getCommandDetails(query)
{
    const name =
        cleanQuery(
            query
        );

    if (!name)
        return null;

    const command =
        getRegistry()
            .findCommand(
                name
            );

    if (!command)
        return null;

    return normalizeCommand(
        command
    );
}

module.exports = {
    getCommands,
    getGroupedCommands,
    getCommandDetails
};
