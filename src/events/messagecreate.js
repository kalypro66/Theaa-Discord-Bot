const {
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const automodPath = path.join(__dirname, '../data/automod.json');
const logsPath = path.join(__dirname, '../config/logs.json');

const spamCache = new Map();

module.exports = {
    name: 'messageCreate',

    async execute(message) {

        if (!message.guild) return;
        if (message.author.bot) return;

        let automodData = {};

        if (fs.existsSync(automodPath)) {
            automodData = JSON.parse(
                fs.readFileSync(automodPath, 'utf8')
            );
        }

        const settings = automodData[message.guild.id];

        if (!settings) return;

        if (
            message.member.permissions.has(PermissionFlagsBits.Administrator) ||
            message.member.permissions.has(PermissionFlagsBits.ManageMessages)
        ) return;

        const logsData = fs.existsSync(logsPath)
            ? JSON.parse(fs.readFileSync(logsPath, 'utf8'))
            : {};

        const logChannel =
            message.guild.channels.cache.get(
                logsData[message.guild.id]
            );

        async function punish(feature, reason) {

            const content = message.content;

            await message.delete().catch(() => {});

            const warning = await message.channel.send({
                content: `${message.author}, ${reason}`
            });

            setTimeout(() => {
                warning.delete().catch(() => {});
            }, 5000);

            if (logChannel) {

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(`🚨 AutoMod | ${feature}`)
                    .addFields(
                        {
                            name: 'User',
                            value: `${message.author}`,
                            inline: true
                        },
                        {
                            name: 'Channel',
                            value: `${message.channel}`,
                            inline: true
                        },
                        {
                            name: 'Message',
                            value:
                                content.length > 1024
                                    ? content.slice(0, 1021) + '...'
                                    : content
                        }
                    )
                    .setTimestamp()
                    .setFooter({
                        text: message.guild.name,
                        iconURL: message.guild.iconURL()
                    });

                await logChannel.send({
                    embeds: [embed]
                });

            }

        }

        /* ---------------- Anti Invites ---------------- */

        if (settings.invites) {

            const inviteRegex =
                /(discord\.gg\/|discord\.com\/invite\/)[A-Za-z0-9-]+/i;

            if (inviteRegex.test(message.content)) {

                return punish(
                    'Invite Deleted',
                    'invite links are not allowed in this server.'
                );

            }

        }

        /* ---------------- Anti Links ---------------- */

        if (settings.links) {

            const linkRegex =
                /(https?:\/\/|www\.|[a-zA-Z0-9-]+\.(com|net|org|gg|io|co|me|xyz))/i;

            if (linkRegex.test(message.content)) {

                return punish(
                    'Link Deleted',
                    'links are not allowed in this server.'
                );

            }

        }

        /* ---------------- Anti Mass Mentions ---------------- */

        if (settings.mentions) {

            const userMentions =
                (message.content.match(/<@!?\d+>/g) || []).length;

            const roleMentions =
                (message.content.match(/<@&\d+>/g) || []).length;

            const everyoneMentions =
                (message.content.match(/@(everyone|here)/g) || []).length;

            const mentionCount =
                userMentions +
                roleMentions +
                everyoneMentions;

            if (mentionCount >= 5) {

                return punish(
                    'Mass Mentions',
                    'mass mentioning is not allowed in this server.'
                );

            }

        }

        /* ---------------- Anti Everyone ---------------- */

        if (settings.everyone) {

            if (message.mentions.everyone) {

                return punish(
                    'Everyone Mention',
                    '@everyone and @here are not allowed in this server.'
                );

            }

        }
                /* ---------------- Anti Spam ---------------- */

        if (settings.spam) {

            const userId = message.author.id;

            if (!spamCache.has(userId)) {
                spamCache.set(userId, []);
            }

            const timestamps = spamCache.get(userId);

            timestamps.push(Date.now());

            while (
                timestamps.length &&
                timestamps[0] < Date.now() - 5000
            ) {
                timestamps.shift();
            }

            if (timestamps.length >= 5) {

                spamCache.set(userId, []);

                return punish(
                    'Spam Detected',
                    'please stop spamming.'
                );

            }

        }

    }

};