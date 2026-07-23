const detectIntent =
    require("./detectIntent");

const routeIntent =
    require("./routeIntent");

const classifyIntent =
    require("../ai/classifyIntent");

module.exports = async function dispatcher({

    message,

    context

}) {

    /*
    --------------------------------
    Prefix Commands
    --------------------------------
    */

    if (
        message.content.startsWith(
            context.prefix || ""
        )
    ) {

        return routeIntent({

            intent: {

                type: "command"

            },

            message,

            context

        });

    }

    /*
    --------------------------------
    Natural Language AI Classification
    --------------------------------
    */

    const aiIntent =
        await classifyIntent(context);

    if (
        aiIntent.type === "command"
    ) {

        context.message =
            aiIntent.command;

        return routeIntent({

            intent: {

                type: "command"

            },

            message,

            context

        });

    }

    /*
    --------------------------------
    Fallback Intent Detector
    --------------------------------
    */

    const intent =
        detectIntent(context);

    return routeIntent({

        intent,

        message,

        context

    });

};