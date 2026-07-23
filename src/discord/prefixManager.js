const fs = require("node:fs");
const path = require("node:path");

const PREFIX_FILE = path.join(
    __dirname,
    "..",
    "data",
    "prefixes.json"
);

const DEFAULT_PREFIX = "!";

function loadPrefixes() {

    if (!fs.existsSync(PREFIX_FILE)) {
        fs.writeFileSync(PREFIX_FILE, "{}");
    }

    return JSON.parse(
        fs.readFileSync(PREFIX_FILE, "utf8")
    );

}

function savePrefixes(prefixes) {

    fs.writeFileSync(
        PREFIX_FILE,
        JSON.stringify(prefixes, null, 4)
    );

}

function getPrefix(guildId) {

    const prefixes = loadPrefixes();

    return (
        prefixes[guildId] ||
        DEFAULT_PREFIX
    );

}

function setPrefix(guildId, prefix) {

    const prefixes = loadPrefixes();

    prefixes[guildId] = prefix;

    savePrefixes(prefixes);

}

module.exports = {
    DEFAULT_PREFIX,
    getPrefix,
    setPrefix
};