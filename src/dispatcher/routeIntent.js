const messageRouter =
    require("../router/messageRouter");

const askAI =
    require("../ai/manager");

module.exports = async function routeIntent({

    intent,

    message,

    context

}) {

    switch (intent.type) {

        case "command": {

            const result =
                await messageRouter(

                    message,

                    context,

                    intent

                );

            if (result?.handled)
                return;

            const reply =
                await askAI(context);

            await message.reply({

                content: reply,

                allowedMentions: {
                    repliedUser: true
                }

            });

            return;

        }

        case "ai": {

            const reply =
                await askAI(context);

            await message.reply({

                content: reply,

                allowedMentions: {
                    repliedUser: true
                }

            });

            return;

        }

        default:

            return;

    }

};