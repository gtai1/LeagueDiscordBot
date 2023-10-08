import { Client, Events, GatewayIntentBits } from 'discord.js';
import getPlayersInGame from './PlayerIdFetcher.js';
import 'dotenv/config';

const clientToken = process.env.DISCORD_CLIENT_TOKEN;
const serverId = process.env.DISCORD_JPS_SERVER_ID;
const textChannelId = process.env.DISCORD_JPS_SERVER_GENERAL_CHANNEL_ID;

const mockPlayersInGameData = [
	{
		"discordId": "122853566506336256",
		"name": "Gavin",
		"leagueName": ["AngryPickIe"],
		"pingIfInVoiceChannel": true,
		"gameId": 1
	},
	{
		"discordId": "189864164540284938",
		"name": "Ryan",
		"leagueName": ["NateHill"],
		"pingIfInVoiceChannel": true,
		"gameId": 1
	},
	{
		"discordId": "189864164540284913",
		"name": "Rando",
		"leagueName": ["Surefour"],
		"pingIfInVoiceChannel": true,
		"gameId": 2
	},
];

const mockDiscordData = [
	{
		"discordId": "122853566506336256",
		"vc": null,
		"streaming": true
	},
	{
		"discordId": "189864164540284938",
		"vc": "1",
		"streaming": false
	},
	{
		"discordId": "189864164540284913",
		"vc": "1",
		"streaming": false
	}
];

const client = new Client({
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	],
});

async function isUserStreaming(player) {
	const server = await client.guilds.fetch(serverId);
	const user = await server.members.fetch(player.discordId);
	return user.voice.streaming;
}

async function canPingUser(player) {
	const server = await client.guilds.fetch(serverId);
	const user = await server.members.fetch(player.discordId);
	const isInVoiceChannel = user.voice.channelId != null ? true : false;

	// only ping players who are
	// IN a voice channel WHILE pingIfInVoiceChannel is true
	// NOT in a voice channel WHILE pingIfInVoiceChannel is false
	// if (isInVoiceChannel && player.pingIfInVoiceChannel == true) {
	// 	return true;
	// } else if (!isInVoiceChannel && player.pingIfInVoiceChannel == false) {
	// 	return true;
	// } else {
	// 	return false;
	// }
	if (isInVoiceChannel == player.pingIfInVoiceChannel) {
		return true;
	}
	return false;
}

//return {gameId: string, playerLeagueNames: string[]}[]
function getGamesWithPlayers(playersInGame) {
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

function usersToAccuse(playersInGame) {
	const gamePlayerLists = await getGamesWithPlayers(playersInGame);

	const playerCanDM = [];

	for (let player of playersInGame) {
		//check if any player in game is streaming
		//if someone is streaming from a game the other become ineglible to be DMed
		//create a list of players to ping

		const isStreaming = await isUserStreaming(player); //return bool
		const canPing = await canPingUser(player); //return bool

		if (!isStreaming && canPing) {
			playerCanDM.push(player);
		}
	}
}

async function accusePlayers() {
	const playersInGame = await getPlayersInGame(); // {discordId: string, name: string, leagueNames: string[], pingIfInVoiceChannel: bool}[]
	console.log('playersInGame');
	console.log(playersInGame);

	const channel = await client.channels.fetch(textChannelId);

	const playersToDM = usersToAccuse(playersInGame);


	// for (let player of playersInGame) {
	// 	const gamePlayerLists = await getGamesWithPlayers(playersInGame);
	// 	//check if any player in game is streaming
	// 	//if someone is streaming from a game the other become ineglible to be DMed
	// 	//create a list of players to ping

	// 	const isStreaming = await isUserStreaming(player.discordId); //return bool
	// 	const canPing = await canPingUser(player); //return bool

	// 	if (!isStreaming && canPing) {
	// 		playersToDM.push(player);
	// 	}
	// }

	for (let player of playersToDM) {
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
