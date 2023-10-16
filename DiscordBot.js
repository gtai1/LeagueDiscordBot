import { Client, Events, GatewayIntentBits } from 'discord.js';
import getPlayersInGame from './getPlayersInGame.js';
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

async function isPlayerStreaming(player) {
	const server = await client.guilds.fetch(serverId);
	const user = await server.members.fetch(player.discordId);
	return user.voice.streaming == true ? true : false;
}

async function canPingUser(player) {
	const server = await client.guilds.fetch(serverId);
	const user = await server.members.fetch(player.discordId);
	const isInVoiceChannel = user.voice.channelId != null ? true : false;

	// only ping players who are
	// IN a voice channel WHILE pingIfInVoiceChannel is true
	// NOT in a voice channel WHILE pingIfInVoiceChannel is false
	if (isInVoiceChannel && player.pingIfInVoiceChannel == true) {
		return true;
	} else if (player.pingIfInVoiceChannel == false) {
		return true;
	} else {
		return false;
	}
}

//https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
function groupBy(objectArray, property) {
	return objectArray.reduce(function (acc, obj) {
		var key = obj[property];
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(obj);
		return acc;
	}, {});
}

async function getPlayersNotStreaming(games) {
	const playersNotStreaming = [];
	// console.log('getPlayersNotStreaming');
	for (let game in games) {
		let gameBeingStream = false;
		// console.log('games[game] =', games[game]);
		for (let player of games[game]) {
			// console.log('player =', player);
			// console.log('player.discordId =', player.discordId);
			const streaming = await isPlayerStreaming(player);
			// console.log(`${player.discordId} streaming = `, streaming);
			if (streaming) {
				gameBeingStream = true;
			}
		}
		if (!gameBeingStream) {
			// console.log(`game ${game} is not being streamed`);
			// console.log('games[game] =', games[game]);
			// playersNotStreaming.concat(games[game]);
			games[game].forEach((playerI) => {
				playersNotStreaming.push(playerI);
			});
		}
	}
	// console.log('playersNotStreaming =', playersNotStreaming);
	return playersNotStreaming;
}

async function getPingablePlayers(players) {
	const pingablePlayers = [];

	console.log('canPlayersBePinged');

	for (let player of players) {
		// console.log('player =', player);
		const canPing = await canPingUser(player);
		// console.log('canPingDiscId =', canPing);
		if (canPing == true) {
			pingablePlayers.push(player);
		}
	}

	return pingablePlayers;
}

async function messagePlayers(players) {
	const channel = await client.channels.fetch(textChannelId);
	for (let player of players) {
		//ping this list of players
		// channel.send({
		// 	content: `<@${player.discordId}> is being a snake. ${player.name} is in game and is not streaming their league game`,
		// });
		console.log(
			`<@${player.discordId}> is being a snake. ${player.name} is in game and is not streaming their league game`
		);
	}
}

async function accusePlayers() {
	const playersInGame = await getPlayersInGame(); // {discordId: string, name: string, leagueNames: string[], pingIfInVoiceChannel: bool}[]
	console.log('playersInGame =', playersInGame);

	console.log();
	const games = groupBy(playersInGame, 'gameId');
	console.log('groupBy =', games);

	//check if players in game are streaming
	console.log();
	const playersNotStreaming = await getPlayersNotStreaming(games);
	console.log('playersNotStreaming =', playersNotStreaming);

	//check which players can be pinged
	console.log();
	const pingablePlayers = await getPingablePlayers(playersNotStreaming);
	console.log('pingablePlayers =', pingablePlayers);

	console.log();
	messagePlayers(pingablePlayers);
}

client.on(Events.ClientReady, async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	console.log();
	//change time interval to 300000 (5 min)
	// setInterval(accusePlayers, 300000);
	accusePlayers();
});

client.login(clientToken);
