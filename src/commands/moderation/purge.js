const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require(
    "discord.js"
);

const {
    createStandardEmbed
} = require(
    "../../discord/embeds/embedStyle"
);

const {
    sendLog
} = require(
    "../../utils/logger"
);

const MAX_PURGE_AMOUNT =
    500;

const DISCORD_BULK_LIMIT =
    100;

const MAX_BULK_DELETE_AGE =
    14 *
    24 *
    60 *
    60 *
    1000;

function isBulkDeletable(
    message,
    now = Date.now()
)
{
    return (
        Boolean(
            message
        ) &&
        message.bulkDeletable !==
            false &&
        Number.isFinite(
            message.createdTimestamp
        ) &&
        now -
            message.createdTimestamp <
            MAX_BULK_DELETE_AGE
    );
}

async function deleteMessageBatch(
    channel,
    messages
)
{
    if (messages.size === 1)
    {
        const message =
            messages.first();

        await message.delete();

        return {
            size:
                1
        };
    }

    return channel.bulkDelete(
        messages,
        true
    );
}

async function purgeMessages(
    channel,
    requestedAmount
)
{
    const amount =
        Math.min(
            Math.max(
                Number(
                    requestedAmount
                ) || 0,
                0
            ),
            MAX_PURGE_AMOUNT
        );

    let remaining =
        amount;

    let deletedCount =
        0;

    let before =
        null;

    let stoppedAtOldMessages =
        false;

    while (remaining > 0)
    {
        const limit =
            Math.min(
                remaining,
                DISCORD_BULK_LIMIT
            );

        const fetched =
            await channel.messages.fetch({
                limit,
                ...(before
                    ? {
                        before
                    }
                    : {})
            });

        if (!fetched.size)
            break;

        before =
            fetched.last()?.id ||
            null;

        const now =
            Date.now();

        const encounteredOldMessages =
            [
                ...fetched.values()
            ].some(message =>
                Number.isFinite(
                    message.createdTimestamp
                ) &&
                now -
                    message.createdTimestamp >=
                    MAX_BULK_DELETE_AGE
            );

        const deletable =
            fetched.filter(message =>
                isBulkDeletable(
                    message,
                    now
                )
            );

        let deleted = {
            size:
                0
        };

        if (deletable.size)
        {
            deleted =
                await deleteMessageBatch(
                    channel,
                    deletable
                );

            deletedCount +=
                deleted.size;

            remaining -=
                deleted.size;
        }

        if (encounteredOldMessages)
        {
            stoppedAtOldMessages =
                true;

            break;
        }

        if (
            fetched.size <
            limit
        )
        {
            break;
        }
    }

    return {
        requested:
            amount,

        deleted:
            deletedCount,

        stoppedAtOldMessages
    };
}

async function sendResult(
    interaction,
    response
)
{
    if (interaction.message)
    {
        return interaction.channel.send(
            response
        );
    }

    return interaction.editReply(
        response
    );
}

async function sendFailure(
    interaction
)
{
    const response = {
        content:
            "Failed to delete messages.",

        allowedMentions: {
            repliedUser:
                false
        }
    };

    if (interaction.message)
    {
        return interaction.channel
            .send(response)
            .catch(() => {});
    }

    if (interaction.deferred)
    {
        return interaction
            .editReply(response)
            .catch(() => {});
    }

    return interaction
        .reply({
            ...response,
            ephemeral:
                true
        })
        .catch(() => {});
}

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName(
                "purge"
            )
            .setDescription(
                "Delete up to 500 recent messages."
            )
            .addIntegerOption(option =>
                option
                    .setName(
                        "value"
                    )
                    .setDescription(
                        "Number of messages to delete"
                    )
                    .setRequired(
                        true
                    )
                    .setMinValue(
                        1
                    )
                    .setMaxValue(
                        MAX_PURGE_AMOUNT
                    )
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits
                    .ManageMessages
            ),

    async execute(
        interaction
    )
    {
        const amount =
            interaction.options
                .getInteger(
                    "value"
                );

        try
        {
            if (interaction.message)
            {
                await interaction
                    .deferReply();
            }
            else
            {
                await interaction
                    .deferReply({
                        flags:
                            MessageFlags.Ephemeral
                    });
            }

            const result =
                await purgeMessages(
                    interaction.channel,
                    amount
                );

            const embed =
                createStandardEmbed(
                    interaction,
                    {
                        color:
                            "#5865F2"
                    }
                )
                    .setTitle(
                        "Messages Deleted"
                    )
                    .addFields(
                        {
                            name:
                                "Moderator",

                            value:
                                `${interaction.user}`,

                            inline:
                                true
                        },
                        {
                            name:
                                "Channel",

                            value:
                                `${interaction.channel}`,

                            inline:
                                true
                        },
                        {
                            name:
                                "Deleted",

                            value:
                                `${result.deleted} message(s)`,

                            inline:
                                true
                        }
                    );

            if (
                result.stoppedAtOldMessages
            )
            {
                embed.setDescription(
                    "Some messages were not deleted because Discord bulk deletion only supports recent messages."
                );
            }

            const reply =
                await sendResult(
                    interaction,
                    {
                        embeds:
                            [embed]
                    }
                );

            await sendLog(
                interaction,
                embed
            );

            setTimeout(
                async () =>
                {
                    if (interaction.message)
                    {
                        await reply
                            ?.delete?.()
                            .catch(
                                () => {}
                            );

                        return;
                    }

                    await interaction
                        .deleteReply()
                        .catch(
                            () => {}
                        );
                },
                5000
            );
        }
        catch (error)
        {
            console.error(
                error
            );

            await sendFailure(
                interaction
            );
        }
    },

    MAX_PURGE_AMOUNT,
    DISCORD_BULK_LIMIT,
    MAX_BULK_DELETE_AGE,
    isBulkDeletable,
    deleteMessageBatch,
    purgeMessages
};
