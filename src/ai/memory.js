const memory = new Map();

const MAX_HISTORY = 50;

function getHistory(guildId) {

    if (!memory.has(guildId)) {
        memory.set(guildId, []);
    }

    return memory.get(guildId);

}

function addMessage(guildId, speaker, text) {

    const history = getHistory(guildId);

    history.push({
        speaker,
        text
    });

    if (history.length > MAX_HISTORY) {
        history.shift();
    }

}

function clearHistory(guildId) {

    memory.delete(guildId);

}

module.exports = {
    getHistory,
    addMessage,
    clearHistory
};