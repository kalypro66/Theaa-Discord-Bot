const {
    findCommand
} = require("./commandRegistry");

const {
    matchCommandInput
} = require("./commandMatcher");

const executeCommand =
    require("./executeCommand");

module.exports =
    async function messageRouter(
        message,
        context,
        intent = null
    )
    {
        const match =
            matchCommandInput(
                context.message
            );

        if (
            intent?.type === "command" &&
            intent.command
        )
        {
            const command =
                findCommand(
                    intent.command
                );

            if (command)
            {
                const args =
                    match?.command === command
                        ? match.args
                        : intent.args || [];

                await executeCommand(
                    message,
                    command,
                    args
                );

                return {
                    handled:
                        true,
                    type:
                        "command"
                };
            }
        }

        if (match)
        {
            await executeCommand(
                message,
                match.command,
                match.args
            );

            return {
                handled:
                    true,
                type:
                    "command"
            };
        }

        return {
            handled:
                false,
            type:
                "ai"
        };
    };
