const {
    Collection
} = require("discord.js");

const fs = require("node:fs");
const path = require("node:path");

module.exports = client => {

    client.commands = new Collection();

    const commandsPath =
        path.join(__dirname, "..", "commands");

    const folders =
        fs.readdirSync(commandsPath);

    for (const folder of folders) {

        const folderPath =
            path.join(commandsPath, folder);

        if (!fs.statSync(folderPath).isDirectory())
            continue;

        const commandFiles =
            fs.readdirSync(folderPath)
                .filter(file => file.endsWith(".js"));

        for (const file of commandFiles) {

            const filePath =
                path.join(folderPath, file);

            const command =
                require(filePath);

            if (
                command.data &&
                command.execute
            ) {

                client.commands.set(
                    command.data.name,
                    command
                );

            } else {

                console.log(
                    `[WARNING] ${filePath} is missing "data" or "execute".`
                );

            }

        }

    }

};