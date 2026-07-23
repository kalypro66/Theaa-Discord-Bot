const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

function getRequestText(args)
{
    return (args || [])
        .join(" ")
        .replace(
            /\b(avatar|pfp|profilepicture|profile picture)\b/gi,
            " "
        )
        .replace(/\s+/g, " ")
        .trim();
}

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
            size: 4096
        });

    return new EmbedBuilder()
        .setColor("#5865F2")
        .setAuthor({
            name:
                `${user.username}'s Avatar`,
            iconURL:
                user.displayAvatarURL({
                    size: 128
                })
        })
        .setImage(
            avatarURL
        )
        .setFooter({
            text:
                `${client.user.username} | ${guild.name}`,
            iconURL:
                client.user.displayAvatarURL()
        });
}

async function getServerMember(
    guild,
    userId
)
{
    return guild.members.cache.get(
        userId
    ) || await guild.members.fetch(
        userId
    ).catch(() => null);
}

async function run(context)
{
    let targetUser =
        context.targetUser || null;

    if (
        !targetUser &&
        context.message
    )
    {
        targetUser =
            context.message.mentions.users.find(
                user =>
                    user.id !==
                    context.client.user.id
            ) || null;
    }

    const requestText =
        getRequestText(
            context.args
        );

    const isSelfRequest =
        !requestText ||
        /^(me|my|mine|myself)$/i.test(
            requestText
        );

    if (!targetUser)
    {
        if (isSelfRequest)
        {
            targetUser =
                context.user;
        }
        else
        {
            return {
                content:
                    "That person isn't in this server. Mention a server member instead.",
                allowedMentions: {
                    repliedUser: false
                }
            };
        }
    }

    const member =
        await getServerMember(
            context.guild,
            targetUser.id
        );

    if (!member)
    {
        return {
            content:
                "That person isn't in this server.",
            allowedMentions: {
                repliedUser: false
            }
        };
    }

    const embed =
        buildAvatarEmbed({
            user:
                member.user,
            client:
                context.client,
            guild:
                context.guild
        });

    return {
        embeds: [embed],
        allowedMentions: {
            repliedUser: false
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
        "Shows a user's avatar.",

    permissions: [],

    data:
        new SlashCommandBuilder()
            .setName("avatar")
            .setDescription(
                "Shows a user avatar"
            )
            .addUserOption(option =>
                option
                    .setName("user")
                    .setDescription(
                        "The server member whose avatar you want to view"
                    )
                    .setRequired(false)
            ),

    run,

    async execute(interaction)
    {
        const reply =
            await run({
                guild:
                    interaction.guild,
                client:
                    interaction.client,
                user:
                    interaction.user,
                targetUser:
                    interaction.options.getUser(
                        "user"
                    ) || interaction.user,
                message:
                    null,
                args: []
            });

        await interaction.reply(
            reply
        );
    }
};
