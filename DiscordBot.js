import { Client, Events, GatewayIntentBits } from 'discord.js';
import getPlayersInGame from './PlayerIdFetcher.js';
import 'dotenv/config';

const clientToken = process.env.DISCORD_CLIENT_TOKEN;
const serverId = process.env.DISCORD_JPS_SERVER_ID;
const textChannelId = process.env.DISCORD_JPS_SERVER_GENERAL_CHANNEL_ID;

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

async function toPing(player) {
	const server = await client.guilds.fetch(serverId);
	const user = await server.members.fetch(player.discordId);

	// only ping players who are
	// IN a voice channel WHILE pingIfInVoiceChannel is true
	// NOT in a voice channel WHILE pingIfInVoiceChannel is false
	if (user.voice.channelId != null && player.pingIfInVoiceChannel == true) {
		return true;
	} else if (
		user.voice.channelId == null &&
		player.pingIfInVoiceChannel == false
	) {
		return true;
	} else {
		return false;
	}
}

function areInSameGame(player, playersInGame) {
	const _players = JSON.parse(JSON.stringify(playersInGame));
	const games = []; // {gameId, players}
	for (let curPlayer of _players) {
		const oneGame = playersInGame.filter(
			(x) => x['gameId'] === curPlayer.gameId
		);
		games.push(oneGame);
	}
	console.log('games', games);
}

async function accusePlayers() {
	const playersInGame = await getPlayersInGame();
	console.log('playersInGame');
	console.log(playersInGame);

	const channel = await client.channels.fetch(textChannelId);

	for (let player of playersInGame) {
		const isStreaming = await isUserStreaming(player.discordId);
		const toPingFlag = await toPing(player);
		const inSameGame = await areInSameGame(player, playersInGame);
		if (!isStreaming && toPingFlag) {
			channel.send({
				content: `<@${player.discordId}> is being a snake. ${player.name} is in game and is not streaming their league game`,
			});
		}
	}
}

client.on(Events.ClientReady, async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	//change time interval to 300000 (5 min)
	// setInterval(accusePlayers, 300000);
	accusePlayers();
});

client.login(clientToken);
