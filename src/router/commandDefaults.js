const DEFAULTS = {
    serverinfo: {
        category: "information",
        aliases: [],
        triggers: []
    },
    addrole: {
        aliases: [
            "add role",
            "give role",
            "assign role"
        ],
        triggers: [
            "add a role",
            "give a role",
            "assign a role"
        ]
    },
    automod: {
        aliases: [
            "auto mod"
        ],
        triggers: [
            "configure automod",
            "show automod status"
        ]
    },
    ban: {
        aliases: [
            "ban member"
        ],
        triggers: [
            "ban this member",
            "ban that member"
        ]
    },
    kick: {
        aliases: [
            "kick member"
        ],
        triggers: [
            "kick this member",
            "kick that member"
        ]
    },
    lock: {
        aliases: [
            "lock channel"
        ],
        triggers: [
            "lock this channel"
        ]
    },
    nuke: {
        aliases: [
            "nuke channel",
            "reset channel"
        ],
        triggers: [
            "nuke this channel",
            "reset this channel"
        ]
    },
    purge: {
        aliases: [
            "clear messages",
            "delete messages"
        ],
        triggers: [
            "purge messages",
            "clear messages"
        ]
    },
    removerole: {
        aliases: [
            "remove role",
            "take role"
        ],
        triggers: [
            "remove a role",
            "take away a role"
        ]
    },
    setlogs: {
        aliases: [
            "set logs",
            "set log channel"
        ],
        triggers: [
            "set this as the log channel"
        ]
    },
    timeout: {
        aliases: [
            "time out",
            "mute member"
        ],
        triggers: [
            "timeout this member",
            "timeout that member"
        ]
    },
    unban: {
        aliases: [
            "unban user"
        ],
        triggers: [
            "remove this ban"
        ]
    },
    unlock: {
        aliases: [
            "unlock channel"
        ],
        triggers: [
            "unlock this channel"
        ]
    },
    warn: {
        aliases: [
            "warn member"
        ],
        triggers: [
            "warn this member",
            "warn that member"
        ]
    }
};

function getCommandDefaults(name)
{
    return DEFAULTS[
        String(name || "")
            .toLowerCase()
    ] || {
        category: null,
        aliases: [],
        triggers: []
    };
}

module.exports = {
    getCommandDefaults
};
