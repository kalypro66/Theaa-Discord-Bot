const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {

    /*
    --------------------------------
    Command Metadata
    --------------------------------
    */

    name: "serverinfo",

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

    category: "server",

    description:
        "Shows information about the server.",

    /*
    --------------------------------
    Slash Command
    --------------------------------
    */

    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription(
            "Shows information about the server"
        ),

    /*
    --------------------------------
    Shared Logic
    --------------------------------
    */

    async run(ctx) {

        const guild = ctx.guild;

        const owner =
            await guild.fetchOwner();

        const createdTimestamp =
            Math.floor(
                guild.createdTimestamp / 1000
            );

        const embed =
            new EmbedBuilder()
                .setColor("#5865F2")
                .setAuthor({

                    name: guild.name,

                    iconURL:
                        guild.iconURL()

                })
                .setThumbnail(
                    guild.iconURL({
                        size: 512
                    })
                )
                .addFields(

                    {

                        name: "Server ID",

                        value: guild.id

                    },

                    {

                        name: "Owner",

                        value: `${owner}`

                    },

                    {

                        name: "Members",

                        value:
                            `${guild.memberCount}`,

                        inline: true

                    },

                    {

                        name: "Roles",

                        value:
                            `${guild.roles.cache.size}`,

                        inline: true

                    },

                    {

                        name: "Channels",

                        value:
                            `${guild.channels.cache.size}`,

                        inline: true

                    },

                    {

                        name: "Boost Level",

                        value:
                            `${guild.premiumTier}`,

                        inline: true

                    },

                    {

                        name: "Boosts",

                        value:
                            `${guild.premiumSubscriptionCount || 0}`,

                        inline: true

                    },

                    {

                        name:
                            "Created Date",

                        value:
`<t:${createdTimestamp}:F>
(<t:${createdTimestamp}:R>)`

                    }

                )
                .setFooter({

                    text:
`${ctx.client.user.username} | ${guild.name}`,

                    iconURL:
                        ctx.client.user.displayAvatarURL()

                });

        return embed;

    },

    /*
    --------------------------------
    Slash Execution
    --------------------------------
    */

    async execute(interaction) {

        const embed =
            await this.run({

                guild:
                    interaction.guild,

                client:
                    interaction.client

            });

        await interaction.reply({

            embeds: [embed]

        });

    }

};