const { Events } = require('discord.js');
const { templateEmbed } = require('../embed/template.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`,
			);
			return;
		}

		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			const errorEmbed = templateEmbed()
				.setTitle('Error')
				.setDescription('There was an error while executing this command!');
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					embeds: [errorEmbed],
					ephemeral: true,
				});
			}
			await interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true,
			});
		}
	},
};
