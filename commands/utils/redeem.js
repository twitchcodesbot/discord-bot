const { SlashCommandBuilder } = require('discord.js');
const { templateEmbed } = require('../../embed/template.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('redeem')
		.setDescription('Deliver all your codes to your DMs!'),
	async execute(interaction) {
		await interaction.deferReply();
		user = interaction.user;

		// Attempt to send DM to user and catch error if DMs are disabled
		try {
			await user.send('Here are your codes! Enjoy!');
		}
		catch (error) {
			const errorEmbed = templateEmbed().setTitle(
				'Error: Cannot send messages to DM!',
			);
			if (error.code === 50007) {
				errorEmbed.setDescription(
					'Please enable DMs in the server\'s privacy settings to receive your code!',
				);
				await interaction.editReply({
					embeds: [errorEmbed],
				});
				return;
			}

			errorEmbed.setDescription(
				'There was an error while executing this command!',
			);
			await interaction.editReply({
				embeds: [errorEmbed],
			});
		}

		// Get codes from database
		try {
			const codes = await axios({
				method: 'get',
				url: `${process.env.WEB_SERVER}/api/code/?discordId=${user.id}`,
			});

			const codeList = codes.data.code.map((code) => code.code);

			// Send codes to user
			await user.send(codeList.join('\n'));
			if (codes.data.outOfCodes === true) {
				const errorEmbed = templateEmbed()
					.setTitle('Error: Out of codes!')
					.setDescription(
						'We are out of codes! Please contact support for help.',
					);
				await interaction.editReply({
					embeds: [errorEmbed],
				});
				return;
			}
			const successEmbed = templateEmbed()
				.setTitle('Success!')
				.setDescription('Codes sent! Please check your DMs!');
			await interaction.editReply({
				embeds: [successEmbed],
			});
		}
		catch (error) {
			if (
				error.response.status !== undefined &&
        error.response.status === 404
			) {
				error = error.response;
				const errorEmbed = templateEmbed()
					.setTitle(error.data.content)
					.setDescription(error.data.message);
				await interaction.editReply({
					embeds: [errorEmbed],
				});
				return;
			}

			const errorEmbed = templateEmbed()
				.setTitle('Error: Failed to retrive the codes.')
				.setDescription('There was an error while executing this command!');
			await interaction.editReply({
				embeds: [errorEmbed],
			});
		}
	},
};
