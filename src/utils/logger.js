const fs = require('node:fs');
const path = require('node:path');

const logsPath = path.join(
    __dirname,
    '../config/logs.json'
);

async function sendLog(interaction, embed) {
    let logs = {};

    try {
        logs = JSON.parse(
            fs.readFileSync(logsPath, 'utf8')
        );
    } catch (error) {
        console.error(error);
        return;
    }

    const logChannelId =
        logs[interaction.guild.id];

    if (!logChannelId) return;

    const logChannel =
        interaction.guild.channels.cache.get(
            logChannelId
        );

    if (!logChannel) return;

    await logChannel.send({
        embeds: [embed]
    });
}

module.exports = {
    sendLog
};