const {
	ButtonBuilder,
	ButtonStyle,
	SlashCommandBuilder,
	ActionRowBuilder,
} = require('discord.js');
const axios = require('axios');
const dotenv = require('dotenv');
const { getTwitchUser } = require('../../twitch/action.js');
const { templateEmbed } = require('../../embed/template.js');
dotenv.config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Connect your Discord account to your Twitch account!')
		.addStringOption((option) =>
			option
				.setName('twitch_username')
				.setDescription('Your Twitch username.')
				.setRequired(true)
				.setMaxLength(25),
		),
	async execute(interaction) {
		await interaction.deferReply();
		const user = interaction.user;

		// Search for Twitch user
		const twitchUsername = interaction.options
			.getString('twitch_username', true)
			.toLowerCase();
		const twitchUser = await getTwitchUser(twitchUsername);
		if (twitchUser == null) {
			errorEmbed = templateEmbed()
				.setTitle('Error: Twitch user not found!')
				.setDescription(
					`There is no Twitch user with name \`${twitchUsername}\`! Please check your twitch username and try again.`,
				);
			await interaction.editReply(
				{
					embeds: [errorEmbed],
				},
				1,
			);
			return;
		}

		// Check if user is already connected
		let userData = await axios({
			method: 'get',
			url: `${process.env.WEB_SERVER}/api/link/?discordId=${user.id}&twitchId=${twitchUser.id}`,
		});

		userData = userData.data;
		if (userData.linked === true) {
			const embed = templateEmbed()
				.setTitle('Error: Cannot connect with Twitch account')
				.setDescription(userData.content);
			await interaction.editReply({
				embeds: [embed],
			});
			return;
		}

		// Create embed
		const profileEmbed = templateEmbed()
			.setTitle('Account Connecting')
			.setDescription('Please confirm if this is the correct Twitch account')
			.addFields({
				name: !twitchUser.display_name
					? twitchUser.name
					: twitchUser.display_name,
				value: !twitchUser.description
					? 'No bio available.'
					: twitchUser.description,
			});

		if (twitchUser.profilePictureUrl) {
			profileEmbed.setThumbnail(twitchUser.profilePictureUrl);
		}
		if (twitchUser.offlinePlaceholderUrl) {
			profileEmbed.setImage(twitchUser.offlinePlaceholderUrl);
		}

		// Create buttons
		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm')
			.setStyle(ButtonStyle.Success);

		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder().addComponents(cancel, confirm);

		const response = await interaction.editReply({
			embeds: [profileEmbed],
			components: [row],
		});

		// Await confirmation
		const collectorFilter = (i) => i.user.id === interaction.user.id;

		try {
			const confirmation = await response.awaitMessageComponent({
				filter: collectorFilter,
				time: 60_000,
			});
			if (confirmation.customId === 'confirm') {
				// Link accounts
				const linkRequest = await axios({
					method: 'post',
					url: `${process.env.WEB_SERVER}/api/link/`,
					data: {
						discordId: user.id,
						twitchId: twitchUser.id,
					},
				});
				if (linkRequest.status !== 201) {
					await confirmation.update({
						content: 'An error occurred, please try again later.',
						components: [],
					});
					return;
				}

				profileEmbed
					.setTitle('Account Connection Successful')
					.setDescription('Your account has been successfully connected!')
					.setColor('#00ff00');

				await confirmation.update({
					embeds: [profileEmbed],
					components: [],
				});
			}
			else if (confirmation.customId === 'cancel') {
				profileEmbed
					.setTitle('Account Connection Cancelled')
					.setDescription('Your account has not been connected.')
					.setColor('#ff0000');
				await confirmation.update({
					embeds: [profileEmbed],
					components: [],
				});
			}
		}
		catch (e) {
			profileEmbed
				.setTitle('Account Connection Cancelled')
				.setDescription(
					'Confirmation not received within 1 minute, cancelling. Your account has not been connected.',
				)
				.setColor('#ff0000');
			await interaction.editReply({
				embeds: [profileEmbed],
				components: [],
			});
		}
	},
};
