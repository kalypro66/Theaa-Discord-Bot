const {
    SlashCommandBuilder
} = require("discord.js");

const {
    createStandardEmbed
} = require("../../discord/embeds/embedStyle");

function buildDescription(
    guild,
    owner,
    createdTimestamp
)
{
    return [
        `**Server ID:** \`${guild.id}\``,
        `**Owner:** ${owner}`,
        `**Members:** ${guild.memberCount}`,
        `**Roles:** ${guild.roles.cache.size}`,
        `**Channels:** ${guild.channels.cache.size}`,
        `**Boost Level:** ${guild.premiumTier}`,
        `**Boosts:** ${guild.premiumSubscriptionCount || 0}`,
        `**Created:** <t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`
    ].join("\n");
}

async function run(context)
{
    const guild =
        context.guild;

    const owner =
        await guild.fetchOwner();

    const createdTimestamp =
        Math.floor(
            guild.createdTimestamp /
            1000
        );

    const iconURL =
        guild.iconURL();

    return createStandardEmbed({
        client:
            context.client,

        guild
    })
        .setAuthor({
            name:
                guild.name,

            ...(iconURL
                ? {
                    iconURL
                }
                : {})
        })
        .setThumbnail(
            guild.iconURL({
                size:
                    512
            })
        )
        .setDescription(
            buildDescription(
                guild,
                owner,
                createdTimestamp
            )
        );
}

module.exports = {
    name:
        "serverinfo",

    aliases: [
        "serverinfo",
        "server info",
        "server information",
        "about this server",
        "this server"
    ],

    triggers: [
        "show me the server info",
        "show server info",
        "show me server information",
        "show server information",
        "tell me about this server",
        "information about this server",
        "server details",
        "show server details",
        "who owns this server",
        "who is the owner of this server",
        "how many members are here",
        "how many people are in this server",
        "server statistics",
        "show server statistics",
        "show me server stats",
        "what server is this",
        "give me server info",
        "give me server details"
    ],

    category:
        "server",

    description:
        "Shows information about the server.",

    permissions: [],

    data:
        new SlashCommandBuilder()
            .setName(
                "serverinfo"
            )
            .setDescription(
                "Shows information about the server"
            ),

    run,

    async execute(interaction)
    {
        const embed =
            await run({
                guild:
                    interaction.guild,

                client:
                    interaction.client
            });

        await interaction.reply({
            embeds: [
                embed
            ]
        });
    }
};
