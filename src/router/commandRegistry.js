const fs = require("node:fs");
const path = require("node:path");

const {
    PermissionsBitField
} = require("discord.js");

const {
    getCommandDefaults
} = require("./commandDefaults");

const registry = new Map();

function register(name, command)
{
    if (!name)
        return;

    registry.set(
        String(name)
            .toLowerCase()
            .trim(),
        command
    );
}

function mergeUnique(...groups)
{
    return [
        ...new Set(
            groups
                .flat()
                .filter(Boolean)
        )
    ];
}

function humanizePermission(permission)
{
    return String(permission)
        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        );
}

function derivePermissions(command)
{
    const raw =
        command.data
            ?.toJSON?.()
            ?.default_member_permissions;

    if (!raw)
        return [];

    try
    {
        return new PermissionsBitField(
            BigInt(raw)
        )
            .toArray()
            .map(
                humanizePermission
            );
    }
    catch
    {
        return [];
    }
}

function loadCommands()
{
    registry.clear();

    const commandsPath =
        path.join(
            __dirname,
            "..",
            "commands"
        );

    for (
        const folder of
        fs.readdirSync(commandsPath)
    )
    {
        // THEAA_SERVER_AI_FOLDER_DISABLED
        if (folder === "ai")
            continue;

        const folderPath =
            path.join(
                commandsPath,
                folder
            );

        if (
            !fs.statSync(
                folderPath
            ).isDirectory()
        )
        {
            continue;
        }

        const files =
            fs.readdirSync(folderPath)
                .filter(file =>
                    file.endsWith(".js")
                );

        for (const file of files)
        {
            const command =
                require(
                    path.join(
                        folderPath,
                        file
                    )
                );

            if (
                !command.data ||
                typeof command.execute !==
                    "function"
            )
            {
                continue;
            }

            // THEAA_OWNER_DM_ONLY_COMMAND
            if (command.ownerDmOnly)
                continue;

            const defaults =
                getCommandDefaults(
                    command.data.name
                );

            command.name ??=
                command.data.name;

            command.aliases =
                mergeUnique(
                    command.aliases || [],
                    defaults.aliases
                );

            command.triggers =
                mergeUnique(
                    command.triggers || [],
                    defaults.triggers
                );

            command.examples ??= [];

            command.category =
                defaults.category ||
                command.category ||
                (folder === "ai"
                    ? "general"
                    : folder);

            command.description ??=
                command.data.description ||
                "";

            if (
                !Array.isArray(
                    command.permissions
                ) ||
                command.permissions.length ===
                    0
            )
            {
                command.permissions =
                    derivePermissions(
                        command
                    );
            }

            register(
                command.data.name,
                command
            );

            register(
                command.name,
                command
            );

            for (
                const alias of
                command.aliases
            )
            {
                register(
                    alias,
                    command
                );
            }
        }
    }
}

function findCommand(name)
{
    if (!name)
        return null;

    return registry.get(
        String(name)
            .toLowerCase()
            .trim()
    ) || null;
}

function getAllCommands()
{
    return [
        ...new Set(
            registry.values()
        )
    ];
}

function getCommandMetadata()
{
    return getAllCommands()
        .map(command => ({
            name:
                command.name,
            description:
                command.description,
            category:
                command.category,
            aliases:
                command.aliases,
            triggers:
                command.triggers,
            permissions:
                command.permissions
        }));
}

loadCommands();

module.exports = {
    findCommand,
    getAllCommands,
    getCommandMetadata,
    loadCommands
};
