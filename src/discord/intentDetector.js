/*
--------------------------------
Theaa Intent Detector
--------------------------------

Responsibility:
Determine what the user is trying
to do.

This file NEVER executes commands.
It only classifies the message.
*/

function detectIntent(message) {

    if (!message)
        return {
            type: "conversation"
        };

    const text =
        message
            .toLowerCase()
            .trim();

    /*
    --------------------------
    Empty
    --------------------------
    */

    if (!text.length) {

        return {

            type: "conversation"

        };

    }

    /*
    --------------------------
    Command Indicators
    --------------------------
    */

    const commandStarters = [

        "show",

        "display",

        "open",

        "enable",

        "disable",

        "turn on",

        "turn off",

        "set",

        "create",

        "delete",

        "remove",

        "ban",

        "kick",

        "mute",

        "warn",

        "userinfo",

        "serverinfo",

        "avatar",

        "help",

        "ping"

    ];

    for (const starter of commandStarters) {

        if (

            text === starter ||

            text.startsWith(starter + " ")

        ) {

            return {

                type: "command"

            };

        }

    }

    /*
    --------------------------
    Default
    --------------------------
    */

    return {

        type: "conversation"

    };

}

module.exports = detectIntent;