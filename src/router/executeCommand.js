module.exports = async function executeCommand(
    message,
    command,
    providedArgs = null
) {

    /*
    --------------------------------
    Arguments
    --------------------------------
    */

    const args =
        Array.isArray(providedArgs)
            ? providedArgs
            : message.content
                .trim()
                .split(/\s+/)
                .slice(1);

    /*
    --------------------------------
    New Architecture
    --------------------------------
    */

    if (typeof command.run === "function") {

        const result =
            await command.run({

                guild:
                    message.guild,

                member:
                    message.member,

                user:
                    message.author,

                channel:
                    message.channel,

                client:
                    message.client,

                message,

                args

            });

        if (!result)
            return;

        /*
        --------------------------------
        EmbedBuilder
        --------------------------------
        */

        if (
            result &&
            typeof result === "object" &&
            Array.isArray(result.data?.fields)
        ) {

            return message.reply({

                embeds: [result]

            });

        }

        /*
        --------------------------------
        String
        --------------------------------
        */

        if (typeof result === "string") {

            return message.reply({

                content: result

            });

        }

        /*
        --------------------------------
        Reply Object
        --------------------------------
        */

        const {
            afterReply,
            ...replyOptions
        } = result;

        const replyMessage =
            await message.reply(
                replyOptions
            );

        if (
            typeof afterReply ===
            "function"
        )
        {
            await afterReply(
                replyMessage
            );
        }

        return replyMessage;

    }

    /*
    --------------------------------
    Legacy
    --------------------------------
    */

    if (typeof command.executeMessage === "function") {

        return command.executeMessage(
            message,
            args
        );

    }

    /*
    --------------------------------
    Unsupported
    --------------------------------
    */

    return message.reply({

        content:
            "❌ This command doesn't support prefix commands yet."

    });

};