const fs = require("node:fs");
const path = require("node:path");

const registry = new Map();

function register(name, command) {

    if (!name) return;

    registry.set(
        name.toLowerCase().trim(),
        command
    );

}

function loadCommands() {

    registry.clear();

    const commandsPath =
        path.join(__dirname, "..", "commands");

    const folders =
        fs.readdirSync(commandsPath);

    for (const folder of folders) {

        const folderPath =
            path.join(commandsPath, folder);

        if (!fs.statSync(folderPath).isDirectory())
            continue;

        const files =
            fs.readdirSync(folderPath)
                .filter(file =>
                    file.endsWith(".js")
                );

        for (const file of files) {

            const command =
                require(
                    path.join(folderPath, file)
                );

            if (
                !command.data ||
                !command.execute
            ) continue;

            /*
            --------------------------------
            Compatibility Layer
            --------------------------------
            */

            command.name ??=
                command.data.name;

            command.aliases ??= [];

            command.triggers ??= [];

            command.examples ??= [];

            command.category ??=
                "general";

            command.description ??=
                command.data.description || "";

            command.permissions ??= [];

            /*
            --------------------------------
            Register Main Command
            --------------------------------
            */

            register(
                command.data.name,
                command
            );

            /*
            --------------------------------
            Register Custom Name
            --------------------------------
            */

            register(
                command.name,
                command
            );

            /*
            --------------------------------
            Register Aliases
            --------------------------------
            */

            for (const alias of command.aliases) {

                register(
                    alias,
                    command
                );

            }

        }

    }

}

function findCommand(name) {

    if (!name) return null;

    return registry.get(
        name.toLowerCase().trim()
    );

}

function getAllCommands() {

    return [
        ...new Set(
            registry.values()
        )
    ];

}

/*
--------------------------------
NEW
Command Metadata
--------------------------------
*/

function getCommandMetadata() {

    return getAllCommands().map(command => ({

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