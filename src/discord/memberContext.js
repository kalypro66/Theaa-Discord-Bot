function getMemberContext(member) {

    if (!member) return null;

    const roles = member.roles.cache
        .filter(role => role.id !== member.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => ({
            id: role.id,
            name: role.name
        }));

    return {

        id: member.id,

        username:
            member.user.username,

        displayName:
            member.displayName,

        nickname:
            member.nickname,

        bot:
            member.user.bot,

        owner:
            member.guild.ownerId === member.id,

        avatar:
            member.displayAvatarURL(),

        createdAt:
            member.user.createdAt,

        joinedAt:
            member.joinedAt,

        premiumSince:
            member.premiumSince,

        communicationDisabledUntil:
            member.communicationDisabledUntil,

        highestRole: {

            id:
                member.roles.highest.id,

            name:
                member.roles.highest.name,

            position:
                member.roles.highest.position

        },

        roles,

        permissions:
            member.permissions
                .toArray()
                .sort()

    };

}

module.exports = getMemberContext;