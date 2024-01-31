const { AppTokenAuthProvider } = require('@twurple/auth');
const { ApiClient } = require('@twurple/api');

const authProvider = new AppTokenAuthProvider(
	process.env.TWITCH_CLIENT_ID,
	process.env.TWITCH_CLIENT_SECRET,
);

const apiClient = new ApiClient({ authProvider });

// Get Twitch user by username
async function getTwitchUser(username) {
	const user = await apiClient.users.getUserByName(username);
	return user;
}

module.exports = {
	getTwitchUser,
};
