import fetch from 'node-fetch';
import accountsList from './accountsList.json' assert { type: 'json' };
import customRoasts from './customRoasts.json' assert { type: 'json' };
import 'dotenv/config';

export default class LeagueSnitch {
	constructor(discordClient, discordServerId, discordTextChannelId) {
		this.client = discordClient;
		this.serverId = discordServerId;
		this.textChannelId = discordTextChannelId;
	}

	async isPlayerStreaming(player) {
		const server = await this.client.guilds.fetch(this.serverId);
		const user = await server.members.fetch(player.discordId);
		return user.voice.streaming == true ? true : false;
	}

	async canPingUser(player) {
		const server = await this.client.guilds.fetch(this.serverId);
		const user = await server.members.fetch(player.discordId);
		const isInVoiceChannel = user.voice.channelId != null ? true : false;

		if (isInVoiceChannel && player.pingIfInVoiceChannel == true) {
			return true;
		} else if (player.pingIfInVoiceChannel == false) {
			return true;
		} else {
			return false;
		}
	}

	//https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
	groupBy(objectArray, property) {
		return objectArray.reduce(function (acc, obj) {
			var key = obj[property];
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(obj);
			return acc;
		}, {});
	}

	async getPlayersNotStreaming(games) {
		const playersNotStreaming = [];
		// console.log('getPlayersNotStreaming');
		for (let game in games) {
			let gameBeingStream = false;
			// console.log('games[game] =', games[game]);
			for (let player of games[game]) {
				// console.log('player =', player);
				// console.log('player.discordId =', player.discordId);
				const streaming = await this.isPlayerStreaming(player);
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

	async getPingablePlayers(players) {
		const pingablePlayers = [];

		// console.log('canPlayersBePinged');

		for (let player of players) {
			// console.log('player =', player);
			const canPing = await this.canPingUser(player);
			// console.log('canPingDiscId =', canPing);
			if (canPing == true) {
				pingablePlayers.push(player);
			}
		}

		return pingablePlayers;
	}

	getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	customizedRoast(player) {
		for (let discordId in customRoasts) {
			if (player.discordId == discordId) {
				// console.log('roasts =', customRoasts[discordId]);
				// console.log('roasts.length =', customRoasts[discordId].length);
				// get random number between 0 and length-1 inclusive
				const i = this.getRandomInt(customRoasts[discordId].length);
				return `<@${player.discordId}> ${player.name} is in game and is not streaming their league game...${customRoasts[discordId][i]}`;
			}
		}
	}

	async getPlayersInGame() {
		//list of summoner names you want to track (riot limits 20 calls per second, 100 per 2 minutes)
		const playerAccountInfo = accountsList.accounts;
		const APIKey = process.env.RIOT_API_KEY;
		const leagueNameList = [];
		const playersInGame = [];

		//put all the league names in a list
		for (let account of playerAccountInfo) {
			for (let leagueName of account.leagueName) {
				leagueNameList.push(leagueName);
			}
		}

		for (let player of leagueNameList) {
			//fetch the playerId's
			const playerIdResponse = await fetch(
				`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${player}?api_key=${APIKey}`
			);
			const summonerInfo = await playerIdResponse.text();
			const playerId = JSON.parse(summonerInfo).id;

			//fetch response code of player fetch to see if in game or not (200 in game)
			const playerStatusResponse = await fetch(
				`https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${playerId}?api_key=${APIKey}`
			);
			const statusCode = playerStatusResponse.status;
			let t = await playerStatusResponse.json();
			const gameMode = t.gameMode;
			const gameType = t.gameType;
			const gameId = t.gameId;
			const gameQueueConfigId = t.gameQueueConfigId;
			console.log(
				player,
				statusCode,
				gameMode,
				gameType,
				gameQueueConfigId,
				gameId
			);

			//in ranked flex or solo game
			if (
				statusCode == 200 &&
				gameMode == 'CLASSIC' &&
				gameType == 'MATCHED_GAME' &&
				(gameQueueConfigId == 420 || gameQueueConfigId == 440)
			) {
				let playerPLUS = playerAccountInfo.filter((x) =>
					x.leagueName.includes(player)
				)[0];
				playerPLUS['gameId'] = gameId;
				playersInGame.push(playerPLUS);
			}
		}

		// console.log(playersInGame);
		console.log();
		return playersInGame;
	}

	async messagePlayers(players) {
		const channel = await this.client.channels.fetch(this.textChannelId);
		for (let player of players) {
			//ping this list of players
			// channel.send({
			// 	content: this.customizedRoast(player),
			// });
			console.log(this.customizedRoast(player));
		}
	}

	async accusePlayers() {
		const playersInGame = await this.getPlayersInGame(); // {discordId: string, name: string, leagueNames: string[], pingIfInVoiceChannel: bool}[]
		console.log('playersInGame =', playersInGame);

		console.log();
		const games = this.groupBy(playersInGame, 'gameId');
		console.log('groupBy =', games);

		//check if players in game are streaming
		console.log();
		const playersNotStreaming = await this.getPlayersNotStreaming(games);
		console.log('playersNotStreaming =', playersNotStreaming);

		//check which players can be pinged
		console.log();
		const pingablePlayers = await this.getPingablePlayers(playersNotStreaming);
		console.log('pingablePlayers =', pingablePlayers);

		console.log();
		this.messagePlayers(pingablePlayers);
	}
}
