const {
    findCommand
} = require("../router/commandRegistry");

module.exports = function detectIntent(
    context
) {

    const content =
        context.message.trim();

    const firstWord =
        content
            .split(/\s+/)[0]
            .toLowerCase();

    const command =
        findCommand(firstWord);

    if (command) {

        return {

            type: "command",

            command

        };

    }

    return {

        type: "ai"

    };

};