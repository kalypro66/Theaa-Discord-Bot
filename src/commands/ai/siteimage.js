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
    fetchSiteImages
} = require(
    "../../utils/siteImages"
);

const {
    chooseBestImage
} = require(
    "../../ai/vision"
);

const {
    fetchImageBuffer
} = require(
    "../../ai/attachments"
);

function getExtension(
    contentType
)
{
    if (
        contentType.includes(
            "jpeg"
        )
    )
    {
        return "jpg";
    }

    if (
        contentType.includes(
            "webp"
        )
    )
    {
        return "webp";
    }

    if (
        contentType.includes(
            "gif"
        )
    )
    {
        return "gif";
    }

    return "png";
}

async function run(
    context
)
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
                "This command is only available in my developer's private DMs.",

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    const [url, ...rest] =
        context.args || [];

    const query =
        rest.join(" ")
            .trim();

    if (!url)
    {
        return {
            content:
                "Send a public webpage URL and describe the image you want.",

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    const candidates =
        await fetchSiteImages(
            url,
            {
                query,
                limit:
                    8
            }
        );

    if (!candidates.length)
    {
        return {
            content:
                "I couldn't find usable images on that page.",

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    const index =
        query
            ? await chooseBestImage(
                query,
                candidates.slice(
                    0,
                    6
                )
            )
            : 0;

    const selected =
        candidates[
            index ?? 0
        ];

    const downloaded =
        await fetchImageBuffer({
            url:
                selected.url,

            contentType:
                null,

            size:
                0
        });

    const extension =
        getExtension(
            downloaded.contentType
        );

    const filename =
        `theaa-site-image-${Date.now()}.${extension}`;

    const attachment =
        new AttachmentBuilder(
            downloaded.buffer,
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
                    "Website Image"
            })
            .setDescription(
                query
                    ? `Best match for: **${query}**`
                    : "Best image found on the linked page."
            )
            .setImage(
                `attachment://${filename}`
            );

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
        "siteimage",

    aliases: [
        "siteimages",
        "websiteimage",
        "webimage"
    ],

    triggers: [
        "get an image from a website",
        "find an image on this website"
    ],

    category:
        "ai",

    description:
        "Finds the best matching image on a webpage. Owner DM only.",

    permissions: [],

    data:
        new SlashCommandBuilder()
            .setName(
                "siteimage"
            )
            .setDescription(
                "Find the best matching image on a webpage"
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
                        "url"
                    )
                    .setDescription(
                        "Public webpage URL"
                    )
                    .setRequired(
                        true
                    )
            )
            .addStringOption(option =>
                option
                    .setName(
                        "query"
                    )
                    .setDescription(
                        "What should the image show?"
                    )
                    .setRequired(
                        true
                    )
            ),

    run,

    async execute(
        interaction
    )
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
                        "url",
                        true
                    ),
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
