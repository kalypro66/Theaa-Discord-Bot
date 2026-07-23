async function getServerContext(message) {

    const guild = message.guild;

    const owner =
        await guild.fetchOwner();

    return {

        id: guild.id,

        name: guild.name,

        description:
            guild.description,

        icon:
            guild.iconURL(),

        banner:
            guild.bannerURL(),

        splash:
            guild.splashURL(),

        createdAt:
            guild.createdAt,

        memberCount:
            guild.memberCount,

        verificationLevel:
            guild.verificationLevel,

        premiumTier:
            guild.premiumTier,

        premiumSubscriptionCount:
            guild.premiumSubscriptionCount,

        owner: {

            id: owner.id,

            username:
                owner.user.username,

            displayName:
                owner.displayName

        }

    };

}

module.exports = getServerContext;