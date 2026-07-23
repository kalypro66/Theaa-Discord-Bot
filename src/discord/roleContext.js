async function getRoleContext(message) {

    const guild = message.guild;

    const roles = guild.roles.cache
        .filter(role => role.id !== guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => ({

            id: role.id,

            name: role.name,

            color: role.hexColor,

            position: role.position,

            hoisted: role.hoist,

            mentionable: role.mentionable,

            managed: role.managed,

            permissions:
                role.permissions
                    .toArray()
                    .sort(),

            memberCount:
                role.members.size,

            members:
                role.members.map(member => ({
                    id: member.id,
                    username: member.user.username,
                    displayName: member.displayName
                }))

        }));

    return roles;

}

module.exports = getRoleContext;