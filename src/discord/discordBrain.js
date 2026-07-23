const getServerContext =
    require("./serverContext");

const getMemberContext =
    require("./memberContext");

const getRoleContext =
    require("./roleContext");

const getMentionContext =
    require("./mentionsContext");

async function getContext({
    message,
    intent = "general"
}) {

    const guild = message.guild;

    const bot =
        guild.members.me;

    const author =
        message.member;

    const target =
        message.mentions.members.first() || null;

    const server =
        await getServerContext(
            message
        );

    const roles =
        await getRoleContext(
            message
        );

    const mentions =
        await getMentionContext(
            message
        );

    return {

        server,

        members: {

            bot:
                getMemberContext(bot),

            author:
                getMemberContext(author),

            target:
                getMemberContext(target)

        },

        roles,

        mentions,

        intent

    };

}

module.exports = {
    getContext
};