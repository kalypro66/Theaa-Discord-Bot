const processAutomod =
    require("../automod/processMessage");

const {
    getPrefix
} = require("../discord/prefixManager");

const {
    findCommand
} = require("../router/commandRegistry");

const executeCommand =
    require("../router/executeCommand");

const {
    handleOwnerDm
} = require("./ownerDm");

module.exports = {
    name:
        "messageCreate",

    async execute(message)
    {
        if (message.author.bot)
            return;

        if (!message.guild)
        {
            await handleOwnerDm(
                message
            );

            return;
        }

        const prefix =
            String(
                getPrefix(
                    message.guild.id
                ) || ""
            );

        const isPrefixCommand =
            Boolean(prefix) &&
            message.content.startsWith(
                prefix
            );

        const blocked =
            await processAutomod(
                message,
                {
                    skipSpam:
                        isPrefixCommand
                }
            );

        if (
            blocked ||
            !isPrefixCommand
        )
        {
            return;
        }

        const content =
            message.content
                .slice(
                    prefix.length
                )
                .trim();

        if (!content)
            return;

        const [commandName, ...args] =
            content.split(/\s+/);

        const command =
            findCommand(
                commandName
            );

        if (!command)
            return;

        try
        {
            await executeCommand(
                message,
                command,
                args
            );
        }
        catch (error)
        {
            console.error(
                "[Prefix Command]",
                error
            );

            await message.reply({
                content:
                    "Something went wrong while running that command.",

                allowedMentions: {
                    repliedUser:
                        false
                }
            }).catch(() => {});
        }
    }
};
