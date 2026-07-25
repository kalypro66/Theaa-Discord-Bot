const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const {
    getPrefix,
    setPrefix
} = require("../../discord/prefixManager");

function getRequestedPrefix(args)
{
    return (args || [])
        .join(" ")
        .trim()
        .replace(
            /^(?:to|as|into)\s+/i,
            ""
        )
        .trim();
}

async function run(context)
{
    if (
        !context.guild ||
        !context.member
    )
    {
        return {
            content:
                "This command can only be used in a server.",

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    if (
        !context.member.permissions.has(
            PermissionFlagsBits.ManageGuild
        )
    )
    {
        return {
            content:
                "You need the Manage Server permission to change the prefix.",

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    const prefix =
        getRequestedPrefix(
            context.args
        );

    if (!prefix)
    {
        return {
            content:
                "Provide the new prefix you want to use.",

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    if (prefix.length > 5)
    {
        return {
            content:
                "The prefix cannot be longer than 5 characters.",

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    const oldPrefix =
        getPrefix(
            context.guild.id
        );

    setPrefix(
        context.guild.id,
        prefix
    );

    return {
        content:
            `Prefix changed from \`${oldPrefix}\` to \`${prefix}\`.`,

        allowedMentions: {
            repliedUser:
                false
        }
    };
}

module.exports = {
    name:
        "setprefix",

    aliases: [
        "prefix",
        "server prefix",
        "change prefix",
        "change server prefix",
        "set the prefix"
    ],

    triggers: [
        "change prefix",
        "change server prefix",
        "set server prefix",
        "set the prefix"
    ],

    category:
        "utility",

    description:
        "Changes the command prefix for this server.",

    permissions: [
        "Manage Server"
    ],

    data:
        new SlashCommandBuilder()
            .setName(
                "setprefix"
            )
            .setDescription(
                "Change this server's prefix."
            )
            .addStringOption(option =>
                option
                    .setName(
                        "prefix"
                    )
                    .setDescription(
                        "New server prefix"
                    )
                    .setRequired(
                        true
                    )
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.ManageGuild
            ),

    run,

    async execute(interaction)
    {
        const reply =
            await run({
                guild:
                    interaction.guild,

                member:
                    interaction.member,

                user:
                    interaction.user,

                channel:
                    interaction.channel,

                client:
                    interaction.client,

                message:
                    null,

                args: [
                    interaction.options.getString(
                        "prefix",
                        true
                    )
                ]
            });

        await interaction.reply(
            reply
        );
    }
};
