const {
    SlashCommandBuilder
} = require("discord.js");

const {
    getCommands,
    getGroupedCommands,
    getCommandDetails
} = require("../../help/helpService");

const {
    createOverviewPages,
    createCommandEmbed,
    createNotFoundEmbed
} = require("../../help/helpFormatter");

const {
    createPaginatedHelpResult
} = require("../../help/helpPagination");

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

                        guild:
                            context.guild,

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

                    guild:
                        context.guild,

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

    const pages =
        createOverviewPages({
            client:
                context.client,

            guild:
                context.guild,

            prefix,

            groups,

            totalCommands:
                commands.length
        });

    return createPaginatedHelpResult({
        pages,

        userId:
            context.user.id
    });

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

        const {
            afterReply,
            ...replyOptions
        } = reply;

        const response =
            await interaction.reply({
                ...replyOptions,
                withResponse:
                    true
            });

        const replyMessage =
            response.resource?.message ||
            await interaction.fetchReply();

        if (
            typeof afterReply ===
            "function"
        )
        {
            await afterReply(
                replyMessage
            );
        }
    }
};
