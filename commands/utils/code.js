const { SlashCommandBuilder } = require('discord.js');
const { templateEmbed } = require('../../embed/template.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('code')
		.setDescription('Check the amount of codes you have.'),
	async execute(interaction) {
		await interaction.deferReply();
		user = interaction.user;

		// Get codeCount from database
		try {
			data = await axios({
				method: 'get',
				url: `${process.env.WEB_SERVER}/api/count/?discordId=${user.id}`,
			});
			codeCount = data.data.codeCount;
			const embed = templateEmbed()
				.setTitle('Code Count')
				.setDescription(`You have ${codeCount} code(s)!`);
			await interaction.editReply({
				embeds: [embed],
			});
		}
		catch (error) {
			const errorEmbed = templateEmbed()
				.setTitle('Error: Cannot get code count!')
				.setDescription('There was an error while executing this command!');
			await interaction.editReply({
				embeds: [errorEmbed],
			});
			return;
		}
	},
};
