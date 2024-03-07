const { SlashCommandBuilder } = require("discord.js");
const { templateEmbed } = require("../../embed/template.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("ADMIN ONLY: Add codes to a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to add codes to.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of codes to add.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const ADMIN_ID = ["127548771490988033", "231586823384596480", "354522985643900928", "439219610978615317"];
    await interaction.deferReply();
    user = interaction.user;
    const targetUser = interaction.options.getUser("user");
    const codeCount = interaction.options.getInteger("amount");

    if (!ADMIN_ID.includes(user.id)) {
      const errorEmbed = templateEmbed()
        .setTitle("Error: Not an admin")
        .setDescription("You do not have permission to run this command!");
      await interaction.editReply({
        embeds: [errorEmbed],
      });
      return;
    }
    // Get codeCount from database
    try {
      data = await axios({
        method: "post",
        url: `${process.env.WEB_SERVER}/api/code/`,
        data: {
          discordId: targetUser.id,
          codeCount: codeCount,
        },
      });
      const updatedCodeCount = data.data.user.codeCount;
      const embed = templateEmbed()
        .setTitle("Success: Code Added")
        .setDescription(`<@${targetUser.id}> now has ${updatedCodeCount} code(s)!`);
      await interaction.editReply({
        embeds: [embed],
      });
    } catch (error) {
      const errorEmbed = templateEmbed()
        .setTitle("Error: Failed to add codes!")
        .setDescription("There was an error while executing this command!");
      await interaction.editReply({
        embeds: [errorEmbed],
      });
      return;
    }
  },
};
