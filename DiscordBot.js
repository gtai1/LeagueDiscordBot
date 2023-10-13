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

// async function isUserStreaming(player) {
// 	const server = await client.guilds.fetch(serverId);
// 	const user = await server.members.fetch(player.discordId);
// 	return user.voice.streaming;
// }

async function isDiscidStreaming(discordId) {
	const server = await client.guilds.fetch(serverId);
	const user = await server.members.fetch(discordId);
	return user.voice.streaming;
}

// async function canPingUser(player) {
// 	const server = await client.guilds.fetch(serverId);
// 	const user = await server.members.fetch(player.discordId);
// 	const isInVoiceChannel = user.voice.channelId != null ? true : false;

// 	// only ping players who are
// 	// IN a voice channel WHILE pingIfInVoiceChannel is true
// 	// NOT in a voice channel WHILE pingIfInVoiceChannel is false
// 	// if (isInVoiceChannel && player.pingIfInVoiceChannel == true) {
// 	// 	return true;
// 	// } else if (!isInVoiceChannel && player.pingIfInVoiceChannel == false) {
// 	// 	return true;
// 	// } else {
// 	// 	return false;
// 	// }
// 	if (isInVoiceChannel == player.pingIfInVoiceChannel) {
// 		return true;
// 	}
// 	return false;
// }

async function canPingDiscId(discordId) {
	console.log('canPingDiscId');
	const server = await client.guilds.fetch(serverId);
	const user = await server.members.fetch(discordId);
	const isInVoiceChannel = user.voice.channelId != null ? true : false;

	// only ping players who are
	// IN a voice channel WHILE pingIfInVoiceChannel is true
	// NOT in a voice channel WHILE pingIfInVoiceChannel is false
	if (isInVoiceChannel && player.pingIfInVoiceChannel == true) {
		return true;
	} else if (!isInVoiceChannel && player.pingIfInVoiceChannel == false) {
		return true;
	} else {
		return false;
	}
	// if (isInVoiceChannel == player.pingIfInVoiceChannel) {
	// 	return true;
	// }
	// return false;
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

function getArraysDiscIds(games) {
	const gamesDiscIds = [];

	for (let game in games) {
		const playersInGame = games[game];
		const discIds = playersInGame.map(x => x.discordId);
		gamesDiscIds.push(discIds);
	}

	return gamesDiscIds;
}

async function getPlayersNotStreaming(gamesDiscIds) {
	const notStreaming = [];
	// console.log('\ngetPlayersNotStreaming');
	for (let game of gamesDiscIds) {
		let gameBeingStream = false;
		// console.log('game', game);
		for (let discId of game) {
			// console.log('discId', discId);
			const streaming = await isDiscidStreaming(discId);
			// console.log(`\n ${discId} streaming`, streaming);
			if (streaming == true) {
				gameBeingStream = true;
			}
		}
		if (!gameBeingStream) {
			notStreaming.push(game);
		}
	}
	return notStreaming;
}

async function canPlayersBePinged(gamesDiscIds) {
	const pingablePlayers = [];

	console.log('\ncanPlayersBePinged');

	for (let gameDiscId of gamesDiscIds) {
		console.log('gameDiscId', gameDiscId);
		
		for (let discId of gameDiscId) {
			console.log('discId', discId);
			const canPing = await canPingDiscId(discId);
			console.log('canPingDiscId', canPing);
		}

		if (canPing == true) {
			pingablePlayers.push(discId);
		}

	}

	return pingablePlayers;
}

async function accusePlayers() {
	const playersInGame = await getPlayersInGame(); // {discordId: string, name: string, leagueNames: string[], pingIfInVoiceChannel: bool}[]
	console.log('\nplayersInGame', playersInGame);

	const games = groupBy(playersInGame, 'gameId');
	console.log('\ngroupBy', games);


	// need to persist a list of players NOT DISC IDS!!!! DUH


	//create arrays of disc ids based on game
	const gamesDiscIds = getArraysDiscIds(games);
	console.log('\ngamesDiscIds', gamesDiscIds);

	//check if players in game are streaming
	//return games of players that arent streaming
	const notStreamingPlayers = await getPlayersNotStreaming(gamesDiscIds);
	console.log('\nnotStreamingPlayers', notStreamingPlayers);

	//check which players are pingable
	const pingablePlayers = await canPlayersBePinged(notStreamingPlayers);
	console.log('\npingablePlayers', pingablePlayers);

	const channel = await client.channels.fetch(textChannelId);
	for (let player of pingablePlayers) {
		//ping this list of players
		channel.send({
			content: `<@${player.discordId}> is being a snake. ${player.name} is in game and is not streaming their league game`,
		});
	}
}

client.on(Events.ClientReady, async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	//change time interval to 300000 (5 min)
	// setInterval(accusePlayers, 300000);
	accusePlayers();
});

client.login(clientToken);
