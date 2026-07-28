const {
    REST,
    Routes
} = require("discord.js");

const fs = require("node:fs");
const path = require("node:path");

require("dotenv").config();

const OWNER_DM_AI_FILES =
    new Set([
        "siteimage.js",
        "nsfwimage.js",
        "nsfwgif.js"
    ]);

function loadCommands()
{
    const commands = [];

    const commandsPath =
        path.join(
            __dirname,
            "src",
            "commands"
        );

    for (
        const folder of
        fs.readdirSync(
            commandsPath
        )
    )
    {
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
            fs.readdirSync(
                folderPath
            )
                .filter(file =>
                    file.endsWith(
                        ".js"
                    )
                )
                .filter(file =>
                    folder !== "ai" ||
                    OWNER_DM_AI_FILES.has(
                        file
                    )
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
                command.data &&
                typeof command.execute ===
                    "function"
            )
            {
                commands.push({
                    folder,
                    data:
                        command.data.toJSON()
                });
            }
        }
    }

    return commands;
}

const commands =
    loadCommands();

const globalCommands =
    commands
        .filter(command =>
            command.folder ===
                "ai"
        )
        .map(command =>
            command.data
        );

const guildCommands =
    commands
        .filter(command =>
            command.folder !==
                "ai"
        )
        .map(command =>
            command.data
        );

const rest =
    new REST({
        version:
            "10"
    }).setToken(
        process.env.TOKEN
    );

(async () =>
{
    try
    {
        console.log(
            "Started refreshing application commands."
        );

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body:
                    guildCommands
            }
        );

        console.log(
            `Reloaded ${guildCommands.length} guild command(s).`
        );

        await rest.put(
            Routes.applicationCommands(
                process.env.CLIENT_ID
            ),
            {
                body:
                    globalCommands
            }
        );

        console.log(
            `Reloaded ${globalCommands.length} owner-DM command(s).`
        );
    }
    catch (error)
    {
        console.error(
            error
        );

        process.exitCode =
            1;
    }
})();
