function normalizeText(text)
{
    return String(text || "")
        .toLowerCase()
        .replace(/[?!.,]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function prepareMessageResponse(response)
{
    const options =
        typeof response === "string"
            ? {
                content:
                    response
            }
            : {
                ...(response || {})
            };

    delete options.ephemeral;
    delete options.private;
    delete options.flags;
    delete options.withResponse;

    options.allowedMentions ??= {
        repliedUser:
            false
    };

    return options;
}

function getOptionSchema(command, args)
{
    const data =
        command.data?.toJSON?.() || {};

    const topLevel =
        data.options || [];

    const subcommands =
        topLevel.filter(option =>
            option.type === 1
        );

    if (!subcommands.length)
    {
        return {
            requiresSubcommand:
                false,
            subcommand:
                null,
            options:
                topLevel
        };
    }

    const normalizedArgs =
        normalizeText(
            args.join(" ")
        );

    const selected =
        subcommands.find(option =>
            normalizeText(args[0]) ===
            option.name
        ) ||
        subcommands.find(option =>
            normalizedArgs.startsWith(
                option.name
            )
        ) ||
        null;

    return {
        requiresSubcommand:
            true,
        subcommand:
            selected?.name || null,
        options:
            selected?.options || []
    };
}

function getUnusedIndexes(args, consumed)
{
    return args
        .map((_, index) => index)
        .filter(index =>
            !consumed.has(index)
        );
}

function findUnusedIndex(
    args,
    consumed,
    predicate
)
{
    return getUnusedIndexes(
        args,
        consumed
    ).find(index =>
        predicate(
            args[index],
            index
        )
    ) ?? -1;
}

function consumeMentionToken(
    args,
    consumed,
    id
)
{
    const index =
        findUnusedIndex(
            args,
            consumed,
            token =>
                String(token)
                    .includes(id)
        );

    if (index >= 0)
        consumed.add(index);
}

async function fetchMember(
    guild,
    userId
)
{
    return (
        guild.members.cache.get(
            userId
        ) ||
        await guild.members
            .fetch(userId)
            .catch(() => null)
    );
}

async function resolveUserOption(
    message,
    args,
    consumed,
    mentionUsers
)
{
    const mentioned =
        mentionUsers.shift();

    if (mentioned)
    {
        consumeMentionToken(
            args,
            consumed,
            mentioned.id
        );

        return {
            user:
                mentioned,
            member:
                await fetchMember(
                    message.guild,
                    mentioned.id
                )
        };
    }

    const index =
        findUnusedIndex(
            args,
            consumed,
            token =>
                /^(?:<@!?)?\d{17,20}>?$/.test(
                    String(token)
                )
        );

    if (index < 0)
    {
        return {
            user:
                null,
            member:
                null
        };
    }

    consumed.add(index);

    const userId =
        String(args[index])
            .replace(/\D/g, "");

    const member =
        await fetchMember(
            message.guild,
            userId
        );

    const user =
        member?.user ||
        await message.client.users
            .fetch(userId)
            .catch(() => null);

    return {
        user,
        member
    };
}

async function resolveRoleOption(
    message,
    args,
    consumed,
    mentionRoles
)
{
    const mentioned =
        mentionRoles.shift();

    if (mentioned)
    {
        consumeMentionToken(
            args,
            consumed,
            mentioned.id
        );

        return mentioned;
    }

    const idIndex =
        findUnusedIndex(
            args,
            consumed,
            token =>
                /^(?:<@&)?\d{17,20}>?$/.test(
                    String(token)
                )
        );

    if (idIndex >= 0)
    {
        consumed.add(idIndex);

        const roleId =
            String(args[idIndex])
                .replace(/\D/g, "");

        return (
            message.guild.roles.cache.get(
                roleId
            ) ||
            await message.guild.roles
                .fetch(roleId)
                .catch(() => null)
        );
    }

    const remainingText =
        getUnusedIndexes(
            args,
            consumed
        )
            .map(index => args[index])
            .join(" ")
            .trim();

    if (!remainingText)
        return null;

    const normalized =
        normalizeText(
            remainingText
        );

    const matches = [
        ...message.guild.roles.cache.values()
    ].filter(role =>
        role.id !== message.guild.id &&
        normalizeText(role.name) ===
            normalized
    );

    if (matches.length !== 1)
        return null;

    for (
        const index of
        getUnusedIndexes(
            args,
            consumed
        )
    )
    {
        consumed.add(index);
    }

    return matches[0];
}

function removeFillerWords(tokens)
{
    const filler =
        new Set([
            "for",
            "reason",
            "reason:",
            "because",
            "with",
            "to",
            "on",
            "please",
            "pls",
            "plz"
        ]);

    return tokens.filter(token =>
        !filler.has(
            normalizeText(token)
        )
    );
}

async function parseOptions(
    message,
    command,
    providedArgs
)
{
    const args =
        Array.isArray(providedArgs)
            ? [...providedArgs]
            : [];

    const {
        requiresSubcommand,
        subcommand,
        options
    } = getOptionSchema(
        command,
        args
    );

    const consumed =
        new Set();

    if (
        subcommand &&
        normalizeText(args[0]) ===
            subcommand
    )
    {
        consumed.add(0);
    }

    const mentionUsers = [
        ...message.mentions.users
            .filter(user =>
                user.id !==
                message.client.user.id
            )
            .values()
    ];

    const mentionRoles = [
        ...message.mentions.roles
            .values()
    ];

    const values = {};

    for (const option of options)
    {
        if (option.type === 6)
        {
            values[option.name] =
                await resolveUserOption(
                    message,
                    args,
                    consumed,
                    mentionUsers
                );

            continue;
        }

        if (option.type === 8)
        {
            values[option.name] =
                await resolveRoleOption(
                    message,
                    args,
                    consumed,
                    mentionRoles
                );

            continue;
        }

        if (option.type === 4)
        {
            const index =
                findUnusedIndex(
                    args,
                    consumed,
                    token =>
                        /^-?\d+$/.test(
                            String(token)
                        )
                );

            values[option.name] =
                index >= 0
                    ? Number(args[index])
                    : null;

            if (index >= 0)
                consumed.add(index);

            continue;
        }

        if (option.type !== 3)
            continue;

        if (option.name === "userid")
        {
            const index =
                findUnusedIndex(
                    args,
                    consumed,
                    token =>
                        /\d{17,20}/.test(
                            String(token)
                        )
                );

            values[option.name] =
                index >= 0
                    ? String(args[index])
                        .replace(/\D/g, "")
                    : null;

            if (index >= 0)
                consumed.add(index);

            continue;
        }

        if (
            Array.isArray(option.choices) &&
            option.choices.length
        )
        {
            const choices =
                option.choices.map(choice =>
                    String(choice.value)
                );

            const index =
                findUnusedIndex(
                    args,
                    consumed,
                    token =>
                        choices.includes(
                            normalizeText(token)
                        )
                );

            values[option.name] =
                index >= 0
                    ? normalizeText(
                        args[index]
                    )
                    : null;

            if (index >= 0)
                consumed.add(index);

            continue;
        }

        const remainingIndexes =
            getUnusedIndexes(
                args,
                consumed
            );

        if (option.name === "prefix")
        {
            const index =
                remainingIndexes[0] ?? -1;

            values[option.name] =
                index >= 0
                    ? args[index]
                    : null;

            if (index >= 0)
                consumed.add(index);

            continue;
        }

        const remaining =
            remainingIndexes.map(
                index => args[index]
            );

        const cleaned =
            removeFillerWords(
                remaining
            );

        values[option.name] =
            cleaned.length
                ? cleaned.join(" ")
                : null;

        for (const index of remainingIndexes)
            consumed.add(index);
    }

    return {
        requiresSubcommand,
        subcommand,
        options,
        values
    };
}

function validateParsedOptions(parsed)
{
    if (
        parsed.requiresSubcommand &&
        !parsed.subcommand
    )
    {
        return "Choose a valid subcommand.";
    }

    for (const option of parsed.options)
    {
        const value =
            option.type === 6
                ? parsed.values[option.name]
                    ?.user
                : parsed.values[option.name];

        if (
            option.required &&
            value == null
        )
        {
            return `Provide the required \`${option.name}\` option.`;
        }

        if (
            option.type === 4 &&
            value != null
        )
        {
            if (
                option.min_value != null &&
                value < option.min_value
            )
            {
                return `\`${option.name}\` must be at least ${option.min_value}.`;
            }

            if (
                option.max_value != null &&
                value > option.max_value
            )
            {
                return `\`${option.name}\` cannot be greater than ${option.max_value}.`;
            }
        }
    }

    return null;
}

function createOptionsResolver(parsed)
{
    function requireValue(
        value,
        required,
        label
    )
    {
        if (
            value == null &&
            required
        )
        {
            throw new Error(
                `Missing ${label} option.`
            );
        }

        return value ?? null;
    }

    return {
        getSubcommand(
            required = true
        )
        {
            return requireValue(
                parsed.subcommand,
                required,
                "subcommand"
            );
        },

        getUser(name, required = false)
        {
            return requireValue(
                parsed.values[name]?.user,
                required,
                name
            );
        },

        getMember(name)
        {
            return parsed.values[name]
                ?.member || null;
        },

        getRole(name, required = false)
        {
            return requireValue(
                parsed.values[name],
                required,
                name
            );
        },

        getInteger(name, required = false)
        {
            return requireValue(
                parsed.values[name],
                required,
                name
            );
        },

        getString(name, required = false)
        {
            return requireValue(
                parsed.values[name],
                required,
                name
            );
        }
    };
}

function hasRequiredPermission(
    message,
    command
)
{
    if (
        message.guild.ownerId ===
        message.author.id
    )
    {
        return true;
    }

    const required =
        command.data
            ?.toJSON?.()
            ?.default_member_permissions;

    if (!required)
        return true;

    try
    {
        return message.member.permissions.has(
            BigInt(required)
        );
    }
    catch
    {
        return false;
    }
}

module.exports =
    async function createMessageInteraction(
        message,
        command,
        args
    )
    {
        if (
            !hasRequiredPermission(
                message,
                command
            )
        )
        {
            await message.reply(
                prepareMessageResponse({
                    content:
                        "You do not have the required server permission to use this command."
                })
            );

            return {
                blocked:
                    true,
                interaction:
                    null
            };
        }

        const parsed =
            await parseOptions(
                message,
                command,
                args
            );

        const optionError =
            validateParsedOptions(
                parsed
            );

        if (optionError)
        {
            await message.reply(
                prepareMessageResponse({
                    content:
                        optionError
                })
            );

            return {
                blocked:
                    true,
                interaction:
                    null
            };
        }

        const commandName =
            command.data?.name ||
            command.name ||
            "";

        let replied = false;
        let deferred = false;
        let replyMessage = null;

        const adapter = {
            id:
                message.id,
            commandName,
            guild:
                message.guild,
            guildId:
                message.guild.id,
            channel:
                message.channel,
            channelId:
                message.channel.id,
            client:
                message.client,
            user:
                message.author,
            member:
                message.member,
            message,
            options:
                createOptionsResolver(
                    parsed
                ),

            isChatInputCommand()
            {
                return true;
            },

            get replied()
            {
                return replied;
            },

            get deferred()
            {
                return deferred;
            },

            async deferReply()
            {
                deferred = true;

                await message.channel
                    .sendTyping()
                    .catch(() => {});
            },

            async reply(response)
            {
                replyMessage =
                    await message.reply(
                        prepareMessageResponse(
                            response
                        )
                    );

                replied = true;

                return {
                    resource: {
                        message:
                            replyMessage
                    }
                };
            },

            async editReply(response)
            {
                const options =
                    prepareMessageResponse(
                        response
                    );

                replyMessage =
                    replyMessage
                        ? await replyMessage.edit(
                            options
                        )
                        : await message.reply(
                            options
                        );

                replied = true;

                return replyMessage;
            },

            async followUp(response)
            {
                return message.channel.send(
                    prepareMessageResponse(
                        response
                    )
                );
            },

            async fetchReply()
            {
                return replyMessage;
            }
        };

        return {
            blocked:
                false,
            interaction:
                adapter
        };
    };

module.exports.prepareMessageResponse =
    prepareMessageResponse;

module.exports.parseOptions =
    parseOptions;

module.exports.validateParsedOptions =
    validateParsedOptions;
