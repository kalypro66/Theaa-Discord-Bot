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

function buildAvatarEmbed({
    user,
    client,
    guild
})
{
    const isAnimated =
        user.avatar?.startsWith("a_");

    const avatarURL =
        user.displayAvatarURL({
            extension:
                isAnimated
                    ? "gif"
                    : "png",

            size:
                4096
        });

    return createStandardEmbed({
        client,
        guild
    })
        .setAuthor({
            name:
                `${user.username}'s Avatar`,

            iconURL:
                user.displayAvatarURL({
                    size:
                        128
                })
        })
        .setImage(
            avatarURL
        );
}

async function run(context)
{
    const resolution =
        await resolveMember(
            context,
            {
                ignoredTerms: [
                    "avatar",
                    "pfp",
                    "profile picture",
                    "profilepicture",
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

    const embed =
        buildAvatarEmbed({
            user:
                resolution.user,

            client:
                context.client,

            guild:
                context.guild
        });

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

module.exports = {
    name:
        "avatar",

    aliases: [
        "pfp",
        "profilepicture"
    ],

    triggers: [
        "show my avatar",
        "show me my avatar",
        "show avatar",
        "show pfp",
        "show profile picture"
    ],

    category:
        "information",

    description:
        "Shows a server member's avatar.",

    permissions: [],

    data:
        new SlashCommandBuilder()
            .setName(
                "avatar"
            )
            .setDescription(
                "Shows a server member's avatar"
            )
            .addUserOption(option =>
                option
                    .setName(
                        "user"
                    )
                    .setDescription(
                        "The server member whose avatar you want to view"
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
