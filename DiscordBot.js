import { Client, Events, GatewayIntentBits } from 'discord.js';
import getPlayersInGame from './PlayerIdFetcher.js';
import 'dotenv/config';

const clientToken = process.env.DISCORD_CLIENT_TOKEN;
const serverId = process.env.DISCORD_JPS_SERVER_ID; // server id
const generalChannelId = process.env.DISCORD_JPS_SERVER_GENERAL_CHANNEL_ID; // text channel id

const client = new Client({
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	],
});

async function isUserStreaming(userId) {
	const server = await client.guilds.fetch(serverId);
	const user = await server.members.fetch(userId);
	return user.voice.streaming;
}

async function accusePlayers() {
	const playersInGame = await getPlayersInGame();

	const channel = await client.channels.fetch(generalChannelId);

	for (let player of playersInGame) {
		if (!isUserStreaming(player.discordId)) {
			channel.send({
				content: `<@${player.discordId}> ${player.name} is in game and is not streaming...gay af`,
			});
		}
	}
}

client.on(Events.ClientReady, async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	//change time interval to 300000
	setInterval(accusePlayers, 5000);
});

client.login(clientToken);
