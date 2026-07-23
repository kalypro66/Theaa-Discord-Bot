const {
    SlashCommandBuilder
} = require("discord.js");

const {
    getCommands,
    getGroupedCommands,
    getCommandDetails
} = require("../../help/helpService");

const {
    createOverviewEmbed,
    createCommandEmbed,
    createNotFoundEmbed
} = require("../../help/helpFormatter");

const {
    getPrefix
} = require("../../discord/prefixManager");

async function run(context)
{
    const prefix =
        getPrefix(
            context.guild.id
        );

    const query =
        (context.args || [])
            .join(" ")
            .trim();

    if (query)
    {
        const command =
            getCommandDetails(
                query
            );

        if (!command)
        {
            return {
                embeds: [
                    createNotFoundEmbed({
                        client:
                            context.client,

                        query,

                        prefix
                    })
                ],

                allowedMentions: {
                    repliedUser:
                        false
                }
            };
        }

        return {
            embeds: [
                createCommandEmbed({
                    client:
                        context.client,

                    prefix,

                    command
                })
            ],

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    const commands =
        getCommands();

    const groups =
        getGroupedCommands();

    return {
        embeds: [
            createOverviewEmbed({
                client:
                    context.client,

                prefix,

                groups,

                totalCommands:
                    commands.length
            })
        ],

        allowedMentions: {
            repliedUser:
                false
        }
    };
}

module.exports = {
    name:
        "help",

    aliases: [
        "commands"
    ],

    triggers: [
        "show commands",
        "show help"
    ],

    category:
        "utility",

    description:
        "Shows all available commands or detailed help for one command.",

    permissions: [],

    data:
        new SlashCommandBuilder()
            .setName(
                "help"
            )
            .setDescription(
                "Shows available commands"
            )
            .addStringOption(option =>
                option
                    .setName(
                        "command"
                    )
                    .setDescription(
                        "Command to view detailed help for"
                    )
                    .setRequired(
                        false
                    )
            ),

    run,

    async execute(interaction)
    {
        const commandName =
            interaction.options.getString(
                "command"
            );

        const reply =
            await run({
                guild:
                    interaction.guild,

                client:
                    interaction.client,

                user:
                    interaction.user,

                message:
                    null,

                args:
                    commandName
                        ? [commandName]
                        : []
            });

        await interaction.reply(
            reply
        );
    }
};
