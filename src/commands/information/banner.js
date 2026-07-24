const {
    SlashCommandBuilder
} = require("discord.js");

const {
    createStandardEmbed
} = require("../../discord/embeds/embedStyle");

const {
    resolveMember,
    createMemberErrorReply
} = require(
    "../../discord/resolvers/memberResolver"
);

async function buildBannerEmbed({
    user,
    client,
    guild
})
{
    const fetchedUser =
        await user.fetch();

    if (!fetchedUser.banner)
    {
        return {
            content:
                "This user doesn't have a profile banner.",

            allowedMentions: {
                repliedUser:
                    false
            }
        };
    }

    const isAnimated =
        fetchedUser.banner?.startsWith(
            "a_"
        );

    const bannerURL =
        fetchedUser.bannerURL({
            extension:
                isAnimated
                    ? "gif"
                    : "png",

            size:
                4096
        });

    const embed =
        createStandardEmbed({
            client,
            guild
        })
            .setAuthor({
                name:
                    `${user.username}'s Banner`,

                iconURL:
                    user.displayAvatarURL({
                        size:
                            128
                    })
            })
            .setImage(
                bannerURL
            );

    return {
        embeds: [
            embed
        ],

        allowedMentions: {
            repliedUser:
                false
        }
    };
}

async function run(context)
{
    const resolution =
        await resolveMember(
            context,
            {
                ignoredTerms: [
                    "banner",
                    "profile banner",
                    "show",
                    "send",
                    "get",
                    "give",
                    "display",
                    "view",
                    "see",
                    "open",
                    "check"
                ]
            }
        );

    if (!resolution.ok)
    {
        return createMemberErrorReply(
            resolution
        );
    }

    return buildBannerEmbed({
        user:
            resolution.user,

        client:
            context.client,

        guild:
            context.guild
    });
}

module.exports = {
    name:
        "banner",

    aliases: [
        "profilebanner"
    ],

    triggers: [
        "show my banner",
        "show banner",
        "show profile banner"
    ],

    category:
        "information",

    description:
        "Shows a server member's profile banner.",

    permissions: [],

    data:
        new SlashCommandBuilder()
            .setName(
                "banner"
            )
            .setDescription(
                "Shows a server member's profile banner"
            )
            .addUserOption(option =>
                option
                    .setName(
                        "user"
                    )
                    .setDescription(
                        "The server member whose banner you want to view"
                    )
                    .setRequired(
                        false
                    )
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

                client:
                    interaction.client,

                user:
                    interaction.user,

                targetMember:
                    interaction.options.getMember(
                        "user"
                    ),

                targetUser:
                    interaction.options.getUser(
                        "user"
                    ),

                message:
                    null,

                args: []
            });

        await interaction.reply(
            reply
        );
    }
};
