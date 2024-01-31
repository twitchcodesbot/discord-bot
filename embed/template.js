const { EmbedBuilder } = require('discord.js');

const templateEmbed = () => {
	const embed = new EmbedBuilder().setTimestamp().setFooter({
		text: 'Made by Joelute',
		iconURL:
      'https://cdn.discordapp.com/avatars/797960026860814368/d80f8c5233cbd645d0ca8f3d18b8333b',
	});
	return embed;
};

module.exports = {
	templateEmbed,
};
