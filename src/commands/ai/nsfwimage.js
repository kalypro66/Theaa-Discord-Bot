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
                    false
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
        `theaa-private-image-${Date.now()}.${result.extension}`;

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
                    "Private Image Search",

                iconURL:
                    context.client?.user
                        ?.displayAvatarURL?.()
            })
            .setDescription(
                `Best match for: **${result.query}**\n[Source: ${result.provider}](${result.sourceUrl})`
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
        "nsfwimage",

    aliases: [
        "adultimage",
        "hentaiimage"
    ],

    triggers: [],

    category:
        "ai",

    ownerDmOnly:
        true,

    description:
        "Searches adult anime images in the developer DM.",

    permissions: [],

    data:
        new SlashCommandBuilder()
            .setName(
                "nsfwimage"
            )
            .setDescription(
                "Search for an adult anime image"
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
                        "Describe the image to find"
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
