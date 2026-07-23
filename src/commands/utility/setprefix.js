const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const {
    getPrefix,
    setPrefix
} = require("../../discord/prefixManager");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("setprefix")
        .setDescription("Change this server's prefix.")
        .addStringOption(option =>
            option
                .setName("prefix")
                .setDescription("New server prefix")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        const prefix =
            interaction.options
                .getString("prefix")
                .trim();

        if (prefix.length > 5) {

            return interaction.reply({
                content:
                    "❌ Prefix can't be longer than 5 characters.",
                ephemeral: true
            });

        }

        const oldPrefix =
            getPrefix(interaction.guild.id);

        setPrefix(
            interaction.guild.id,
            prefix
        );

        await interaction.reply({
            content:
                `✅ Prefix changed from \`${oldPrefix}\` to \`${prefix}\`.`
        });

    }

};