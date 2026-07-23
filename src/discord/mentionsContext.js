async function getMentionContext(message) {

    const mentions =
        [...message.mentions.members.values()]
            .map(member => ({
                id: member.id,
                username: member.user.username,
                displayName: member.displayName
            }));

    let repliedUser = null;

    if (message.reference?.messageId) {

        try {

            const replied =
                await message.channel.messages.fetch(
                    message.reference.messageId
                );

            if (replied.member) {

                repliedUser = {

                    id: replied.member.id,

                    username:
                        replied.member.user.username,

                    displayName:
                        replied.member.displayName

                };

            }

        } catch {}

    }

    return {

        mentions,

        repliedUser

    };

}

module.exports = getMentionContext;