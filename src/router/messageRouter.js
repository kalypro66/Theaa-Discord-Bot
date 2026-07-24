const {
    findCommand
} = require("./commandRegistry");

const matchCommand =
    require("./commandMatcher");

const executeCommand =
    require("./executeCommand");

module.exports = async function messageRouter(
    message,
    context,
    intent = null
) {

    const content =
        context.message.trim();

    /*
    --------------------------------
    Prefix Command
    --------------------------------
    */

    const firstWord =
        content
            .split(/\s+/)[0]
            .toLowerCase();

    const prefixCommand =
        findCommand(firstWord);

    if (prefixCommand) {

        const args =
            content
                .split(/\s+/)
                .slice(1);

        await executeCommand(
            message,
            prefixCommand,
            args
        );

        return {

            handled: true,

            type: "command"

        };

    }

    /*
    --------------------------------
    AI Intent Command
    --------------------------------
    */

    if (
        intent?.type === "command" &&
        intent.command
    ) {

        const command =
            findCommand(intent.command);

        if (command) {

            await executeCommand(

                message,

                command,

                intent.args || []

            );

            return {

                handled: true,

                type: "command"

            };

        }

    }

    /*
    --------------------------------
    Natural Command
    --------------------------------
    */

    const command =
        matchCommand(content);

    if (command) {

        await executeCommand(
            message,
            command
        );

        return {

            handled: true,

            type: "command"

        };

    }

    /*
    --------------------------------
    Not a Command
    --------------------------------
    */

    return {

        handled: false,

        type: "ai"

    };

};