const {
    PermissionFlagsBits
} = require("discord.js");

const {
    createStandardEmbed
} = require("../discord/embeds/embedStyle");

const fs =
    require("node:fs");

const path =
    require("node:path");

const automodPath =
    path.join(
        __dirname,
        "../data/automod.json"
    );

const logsPath =
    path.join(
        __dirname,
        "../config/logs.json"
    );

const spamCache =
    new Map();

function readJson(filePath)
{
    try
    {
        if (!fs.existsSync(filePath))
        {
            return {};
        }

        const content =
            fs.readFileSync(
                filePath,
                "utf8"
            ).trim();

        return content
            ? JSON.parse(content)
            : {};
    }
    catch (error)
    {
        console.error(
            `[AutoMod] Failed to read ${path.basename(filePath)}:`,
            error
        );

        return {};
    }
}

module.exports = async function processMessage(
    message,
    options = {}
)
{
    if (!message.guild)
        return false;

    if (message.author.bot)
        return false;

    const automodData =
        readJson(
            automodPath
        );

    const settings =
        automodData[
            message.guild.id
        ];

    if (!settings)
        return false;

    const member =
        message.member ||
        await message.guild.members
            .fetch(
                message.author.id
            )
            .catch(() => null);

    if (!member)
        return false;

    const isServerOwner =
        message.author.id ===
        message.guild.ownerId;

    const staffPermissions = [
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.ManageGuild,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.ModerateMembers,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.ManageRoles
    ];

    const isStaff =
        staffPermissions.some(
            permission =>
                member.permissions.has(
                    permission
                )
        );

    if (
        isServerOwner ||
        isStaff
    )
    {
        return false;
    }

    const logsData =
        readJson(
            logsPath
        );

    const logChannel =
        message.guild.channels.cache.get(
            logsData[
                message.guild.id
            ]
        );

    async function punish(
        feature,
        reason
    )
    {
        const originalContent =
            message.content ||
            "[No text content]";

        await message.delete()
            .catch(() => {});

        const warning =
            await message.channel.send({
                content:
                    `${message.author}, ${reason}`
            }).catch(() => null);

        if (warning)
        {
            const timeout =
                setTimeout(() =>
                {
                    warning.delete()
                        .catch(() => {});
                }, 5000);

            timeout.unref?.();
        }

        if (logChannel)
        {
            const displayedContent =
                originalContent.length > 1024
                    ? `${originalContent.slice(0, 1021)}...`
                    : originalContent;

            const embed =
                createStandardEmbed(
                    {
                        client:
                            message.client,

                        guild:
                            message.guild
                    },
                    {
                        color:
                            "Red"
                    }
                )
                    .setTitle(
                        `AutoMod | ${feature}`
                    )
                    .addFields(
                        {
                            name:
                                "User",

                            value:
                                `${message.author}`,

                            inline:
                                true
                        },
                        {
                            name:
                                "Channel",

                            value:
                                `${message.channel}`,

                            inline:
                                true
                        },
                        {
                            name:
                                "Message",

                            value:
                                displayedContent
                        }
                    );

            await logChannel.send({
                embeds:
                    [embed]
            }).catch(error =>
            {
                console.error(
                    "[AutoMod] Failed to send log:",
                    error
                );
            });
        }

        return true;
    }

    if (settings.invites)
    {
        const inviteRegex =
            /(discord\.gg\/|discord\.com\/invite\/)[A-Za-z0-9-]+/i;

        if (
            inviteRegex.test(
                message.content
            )
        )
        {
            return punish(
                "Invite Deleted",
                "invite links are not allowed in this server."
            );
        }
    }

    if (settings.links)
    {
        const linkRegex =
            /(https?:\/\/|www\.|[a-zA-Z0-9-]+\.(com|net|org|gg|io|co|me|xyz))/i;

        if (
            linkRegex.test(
                message.content
            )
        )
        {
            return punish(
                "Link Deleted",
                "links are not allowed in this server."
            );
        }
    }

    if (settings.mentions)
    {
        const userMentions =
            (
                message.content.match(
                    /<@!?\d+>/g
                ) || []
            ).length;

        const roleMentions =
            (
                message.content.match(
                    /<@&\d+>/g
                ) || []
            ).length;

        const everyoneMentions =
            (
                message.content.match(
                    /@(everyone|here)/g
                ) || []
            ).length;

        const mentionCount =
            userMentions +
            roleMentions +
            everyoneMentions;

        if (mentionCount >= 5)
        {
            return punish(
                "Mass Mentions",
                "mass mentioning is not allowed in this server."
            );
        }
    }

    if (
        settings.everyone &&
        message.mentions.everyone
    )
    {
        return punish(
            "Everyone Mention",
            "@everyone and @here are not allowed in this server."
        );
    }

    if (
        settings.spam &&
        options.skipSpam !== true
    )
    {
        const cacheKey =
            `${message.guild.id}:${message.author.id}`;

        const now =
            Date.now();

        const timestamps =
            spamCache.get(
                cacheKey
            ) || [];

        timestamps.push(
            now
        );

        while (
            timestamps.length &&
            timestamps[0] <
                now - 5000
        )
        {
            timestamps.shift();
        }

        spamCache.set(
            cacheKey,
            timestamps
        );

        if (
            timestamps.length >= 5
        )
        {
            spamCache.delete(
                cacheKey
            );

            return punish(
                "Spam Detected",
                "please stop spamming."
            );
        }
    }

    return false;
};
