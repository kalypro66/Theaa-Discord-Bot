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

function buildRolesValue(member)
{
    const roles =
        member.roles.cache
            .filter(
                role =>
                    role.id !==
                    member.guild.id
            )
            .sort(
                (first, second) =>
                    second.position -
                    first.position
            )
            .map(
                role =>
                    role.toString()
            );

    if (!roles.length)
        return "None";

    let value = "";

    for (const role of roles)
    {
        const addition =
            value
                ? `, ${role}`
                : role;

        if (
            value.length +
            addition.length >
            1000
        )
        {
            return `${value}, and more...`;
        }

        value += addition;
    }

    return value;
}

function buildUserInfoEmbed({
    member,
    client,
    guild
})
{
    const user =
        member.user;

    const createdTimestamp =
        Math.floor(
            user.createdTimestamp /
            1000
        );

    const joinedTimestamp =
        member.joinedTimestamp
            ? Math.floor(
                member.joinedTimestamp /
                1000
            )
            : null;

    const roles =
        buildRolesValue(
            member
        );

    const roleCount =
        Math.max(
            member.roles.cache.size - 1,
            0
        );

    return createStandardEmbed(
        {
            client,
            guild
        },
        {
            color:
                "#00D9E6"
        }
    )
        .setAuthor({
            name:
                user.username,

            iconURL:
                user.displayAvatarURL({
                    size:
                        128
                })
        })
        .setDescription(
            `${member}`
        )
        .setThumbnail(
            user.displayAvatarURL({
                size:
                    512
            })
        )
        .addFields(
            {
                name:
                    "ID",

                value:
                    user.id
            },
            {
                name:
                    "Created Date",

                value:
                    `<t:${createdTimestamp}:F>\n(<t:${createdTimestamp}:R>)`
            },
            {
                name:
                    "Join Date",

                value:
                    joinedTimestamp
                        ? `<t:${joinedTimestamp}:F>\n(<t:${joinedTimestamp}:R>)`
                        : "Unknown"
            },
            {
                name:
                    "Server Boost",

                value:
                    member.premiumSince
                        ? "Yes"
                        : "No"
            },
            {
                name:
                    `Roles (${roleCount})`,

                value:
                    roles
            }
        );
}

async function run(context)
{
    const resolution =
        await resolveMember(
            context,
            {
                ignoredTerms: [
                    "userinfo",
                    "user info",
                    "user information",
                    "memberinfo",
                    "member info",
                    "member information",
                    "whois",
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
        buildUserInfoEmbed({
            member:
                resolution.member,

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
        "userinfo",

    aliases: [
        "memberinfo",
        "whois"
    ],

    triggers: [
        "show my user info",
        "show user info",
        "show member info",
        "who am i"
    ],

    category:
        "information",

    description:
        "Shows information about a server member.",

    permissions: [],

    data:
        new SlashCommandBuilder()
            .setName(
                "userinfo"
            )
            .setDescription(
                "Shows information about a server member"
            )
            .addUserOption(option =>
                option
                    .setName(
                        "user"
                    )
                    .setDescription(
                        "The server member you want information about"
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
