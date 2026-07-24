const {
    EmbedBuilder
} = require("discord.js");

const DEFAULT_EMBED_COLOR =
    "#5865F2";

const ERROR_EMBED_COLOR =
    "#ED4245";

function createFooter({
    client,
    guild
})
{
    const guildName =
        guild?.name ||
        "Direct Message";

    const iconURL =
        client?.user?.displayAvatarURL?.();

    return {
        text:
            `Theaa | ${guildName}`,

        ...(iconURL
            ? {
                iconURL
            }
            : {})
    };
}

function applyStandardEmbedStyle(
    embed,
    {
        client,
        guild,
        color =
            DEFAULT_EMBED_COLOR,
        timestamp =
            true
    } = {}
)
{
    if (
        !(embed instanceof EmbedBuilder)
    )
    {
        throw new TypeError(
            "applyStandardEmbedStyle requires an EmbedBuilder instance."
        );
    }

    embed
        .setColor(
            color
        )
        .setFooter(
            createFooter({
                client,
                guild
            })
        );

    if (timestamp)
    {
        embed.setTimestamp();
    }

    return embed;
}

function createStandardEmbed(
    context,
    options = {}
)
{
    return applyStandardEmbedStyle(
        new EmbedBuilder(),
        {
            client:
                context?.client,

            guild:
                context?.guild,

            ...options
        }
    );
}

module.exports = {
    DEFAULT_EMBED_COLOR,
    ERROR_EMBED_COLOR,
    createFooter,
    applyStandardEmbedStyle,
    createStandardEmbed
};
