const {
    Client,
    GatewayIntentBits
} = require("discord.js");

require("dotenv").config();

const commandHandler =
    require("./src/handlers/commandHandler");

const eventHandler =
    require("./src/handlers/eventHandler");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

commandHandler(client);
eventHandler(client);

client.on(
    "interactionCreate",
    async interaction =>
    {
        if (!interaction.isChatInputCommand())
            return;

        const command =
            client.commands.get(
                interaction.commandName
            );

        if (!command)
            return;

        try
        {
            await command.execute(
                interaction
            );
        }
        catch (error)
        {
            console.error(error);

            const reply = {
                content:
                    "Something went wrong while running this command.",
                flags:
                    64
            };

            if (
                interaction.replied ||
                interaction.deferred
            )
            {
                await interaction
                    .followUp(reply)
                    .catch(() => {});
            }
            else
            {
                await interaction
                    .reply(reply)
                    .catch(() => {});
            }
        }
    }
);

console.log("🚀 About to login...");

client.login(process.env.TOKEN)
    .then(() => {
        console.log("✅ Login promise resolved.");
    })
    .catch(error => {
        console.error("❌ Login failed:");
        console.error(error);
    });
