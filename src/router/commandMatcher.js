const {
    getAllCommands
} = require("./commandRegistry");

function normalize(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(/[?!.,]/g, "")
        .replace(/\s+/g, " ");

}

function startsWithPhrase(text, phrase) {

    return (
        text === phrase ||
        text.startsWith(phrase + " ")
    );

}

function matchCommand(message) {

    const text =
        normalize(message);

    const commands =
        getAllCommands();

    for (const command of commands) {

        /*
        ------------------------------
        Command Name
        ------------------------------
        */

        if (
            startsWithPhrase(
                text,
                normalize(command.name)
            )
        ) {

            return command;

        }

        /*
        ------------------------------
        Aliases
        ------------------------------
        */

        for (const alias of (command.aliases || [])) {

            if (
                startsWithPhrase(
                    text,
                    normalize(alias)
                )
            ) {

                return command;

            }

        }

        /*
        ------------------------------
        Triggers
        ------------------------------
        */

        for (const trigger of (command.triggers || [])) {

            if (
                startsWithPhrase(
                    text,
                    normalize(trigger)
                )
            ) {

                return command;

            }

        }

        /*
        ------------------------------
        Legacy Examples
        ------------------------------
        */

        for (const example of (command.examples || [])) {

            if (
                startsWithPhrase(
                    text,
                    normalize(example)
                )
            ) {

                return command;

            }

        }

    }

    return null;

}

module.exports = matchCommand;