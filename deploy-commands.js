const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandItems = fs.readdirSync(commandsPath);

for (const item of commandItems) {

    const itemPath = path.join(commandsPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {

        const commandFiles = fs.readdirSync(itemPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {

            const filePath = path.join(itemPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            }

        }

    } else if (item.endsWith('.js')) {

        const command = require(itemPath);

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }

    }

}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {

    try {

        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log('Successfully reloaded application (/) commands.');

    } catch (error) {

        console.error(error);

    }

})();