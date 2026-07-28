const {
    SlashCommandBuilder,
    InteractionContextType,
    ApplicationIntegrationType,
    AttachmentBuilder
} = require(
    "discord.js"
);

const {
    isDeveloper
} = require(
    "../../config/developer"
);

const {
    createStandardEmbed
} = require(
    "../../discord/embeds/embedStyle"
);

const {
    searchAdultMedia
} = require(
    "../../utils/adultMediaSearch"
);

async function run(context)
{
    if (
        context.guild ||
        !isDeveloper(
            context.user?.id
        )
    )
    {
        return {
            content:
                "Sorry, I can't help with that here.",

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    const query =
        (context.args || [])
            .join(" ")
            .trim();

    const result =
        await searchAdultMedia(
            query,
            {
                animated:
                    true
            }
        );

    if (!result.ok)
    {
        return {
            content:
                result.message,

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    const filename =
        `theaa-private-animated-${Date.now()}.${result.extension}`;

    const attachment =
        new AttachmentBuilder(
            result.buffer,
            {
                name:
                    filename
            }
        );

    const embed =
        createStandardEmbed({
            client:
                context.client,

            guild:
                null
        })
            .setAuthor({
                name:
                    "Private Animated Search",

                iconURL:
                    context.client?.user
                        ?.displayAvatarURL?.()
            })
            .setDescription(
                `Best match for: **${result.query}**\n[Source: ${result.provider}](${result.sourceUrl})`
            );

    if (
        [
            "gif",
            "webp",
            "png",
            "jpg",
            "jpeg"
        ].includes(
            result.extension
        )
    )
    {
        embed.setImage(
            `attachment://${filename}`
        );
    }

    return {
        embeds: [
            embed
        ],

        files: [
            attachment
        ],

        allowedMentions: {
            repliedUser:
                false
        }
    };
}

module.exports = {
    name:
        "nsfwgif",

    aliases: [
        "adultgif",
        "hentaigif"
    ],

    triggers: [],

    category:
        "ai",

    ownerDmOnly:
        true,

    description:
        "Searches adult animated media in the developer DM.",

    permissions: [],

    data:
        new SlashCommandBuilder()
            .setName(
                "nsfwgif"
            )
            .setDescription(
                "Search for adult animated anime media"
            )
            .setNSFW(
                true
            )
            .setContexts(
                InteractionContextType.BotDM
            )
            .setIntegrationTypes(
                ApplicationIntegrationType.GuildInstall
            )
            .addStringOption(option =>
                option
                    .setName(
                        "query"
                    )
                    .setDescription(
                        "Describe the GIF or animation to find"
                    )
                    .setRequired(
                        true
                    )
            ),

    run,

    async execute(interaction)
    {
        await interaction.deferReply();

        const reply =
            await run({
                guild:
                    interaction.guild,

                user:
                    interaction.user,

                channel:
                    interaction.channel,

                client:
                    interaction.client,

                args: [
                    interaction.options.getString(
                        "query",
                        true
                    )
                ]
            });

        await interaction.editReply(
            reply
        );
    }
};
