const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    MessageFlags
} = require("discord.js");

const PREVIOUS_BUTTON_ID =
    "help_previous";

const NEXT_BUTTON_ID =
    "help_next";

const HELP_TIMEOUT_MS =
    600000;

function createNavigationRow(
    pageIndex,
    pageCount,
    disabled = false
)
{
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(
                    PREVIOUS_BUTTON_ID
                )
                .setLabel(
                    "Previous"
                )
                .setStyle(
                    ButtonStyle.Secondary
                )
                .setDisabled(
                    disabled ||
                    pageIndex === 0
                ),

            new ButtonBuilder()
                .setCustomId(
                    NEXT_BUTTON_ID
                )
                .setLabel(
                    "Next"
                )
                .setStyle(
                    ButtonStyle.Secondary
                )
                .setDisabled(
                    disabled ||
                    pageIndex ===
                        pageCount - 1
                )
        );
}

function createPaginatedHelpResult({
    pages,
    userId
})
{
    if (
        !Array.isArray(pages) ||
        pages.length === 0
    )
    {
        throw new TypeError(
            "Paginated help requires at least one page."
        );
    }

    let pageIndex =
        0;

    const pageCount =
        pages.length;

    return {
        embeds: [
            pages[pageIndex]
        ],

        components: [
            createNavigationRow(
                pageIndex,
                pageCount
            )
        ],

        allowedMentions: {
            repliedUser:
                false
        },

        async afterReply(replyMessage)
        {
            if (
                pageCount <= 1
            )
            {
                return;
            }

            const collector =
                replyMessage
                    .createMessageComponentCollector({
                        componentType:
                            ComponentType.Button,

                        time:
                            HELP_TIMEOUT_MS
                    });

            collector.on(
                "collect",
                async interaction =>
                {
                    if (
                        interaction.user.id !==
                        userId
                    )
                    {
                        await interaction.reply({
                            content:
                                "Only the person who opened this help menu can use these buttons.",

                            flags:
                                MessageFlags.Ephemeral
                        });

                        return;
                    }

                    if (
                        interaction.customId ===
                        PREVIOUS_BUTTON_ID
                    )
                    {
                        pageIndex--;
                    }
                    else if (
                        interaction.customId ===
                        NEXT_BUTTON_ID
                    )
                    {
                        pageIndex++;
                    }
                    else
                    {
                        return;
                    }

                    pageIndex =
                        Math.max(
                            0,
                            Math.min(
                                pageIndex,
                                pageCount - 1
                            )
                        );

                    await interaction.update({
                        embeds: [
                            pages[pageIndex]
                        ],

                        components: [
                            createNavigationRow(
                                pageIndex,
                                pageCount
                            )
                        ]
                    });
                }
            );

            collector.on(
                "end",
                async () =>
                {
                    await replyMessage.edit({
                        components: [
                            createNavigationRow(
                                pageIndex,
                                pageCount,
                                true
                            )
                        ]
                    })
                        .catch(() => {});
                }
            );
        }
    };
}

module.exports = {
    createNavigationRow,
    createPaginatedHelpResult
};
