import fetch from 'node-fetch';
import accountsList from './accountsList.json' assert { type: 'json' };
import customRoasts from './customRoasts.json' assert { type: 'json' };
import 'dotenv/config';
import logger from './Logger.js';
import Database from './Database.js';

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

	async canPingPlayer(player) {
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

		for (let game in games) {
			let gameBeingStream = false;
			for (let player of games[game]) {
				const streaming = await this.isPlayerStreaming(player);
				if (streaming) {
					gameBeingStream = true;
				}
			}
			if (!gameBeingStream) {
				games[game].forEach((playerI) => {
					playersNotStreaming.push(playerI);
				});
			}
		}

		return playersNotStreaming;
	}

	async getPingablePlayers(players) {
		const pingablePlayers = [];

		for (let player of players) {
			const canPing = await this.canPingPlayer(player);
			if (canPing == true) {
				pingablePlayers.push(player);
			}
		}

		return pingablePlayers;
	}

	getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	getCustomizedPlayerRoast(player) {
		for (let discordId in customRoasts) {
			if (player.discordId == discordId) {
				const i = this.getRandomInt(customRoasts[discordId].length);
				return `<@${player.discordId}> ${player.name} is not streaming their league game...${customRoasts[discordId][i]}`;
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
			logger.info(
				`${player} ${statusCode} ${gameMode} ${gameType} ${gameQueueConfigId} ${gameId}`
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

		return playersInGame;
	}

	async messagePlayers(players) {
		const channel = await this.client.channels.fetch(this.textChannelId);

		for (let player of players) {
			const roastMessage = this.getCustomizedPlayerRoast(player);
			channel.send({
				content: roastMessage,
			});
			logger.info(roastMessage);
		}
	}

	async accusePlayers() {
		let playersInGame = [];
		try {
			playersInGame = await this.getPlayersInGame();
		} catch (error) {
			logger.info(error);
		}

		logger.info('playersInGame:');
		logger.info(playersInGame);

		const games = this.groupBy(playersInGame, 'gameId');
		logger.info('groupBy:');
		logger.info(games);

		const playersNotStreaming = await this.getPlayersNotStreaming(games);
		logger.info('playersNotStreaming:');
		logger.info(playersNotStreaming);

		const pingablePlayers = await this.getPingablePlayers(playersNotStreaming);
		logger.info('pingablePlayers:');
		logger.info(pingablePlayers);

		const db = new Database();
		const alreadyPingedGameIds = await db.getPingedGameIds();
		logger.info('alreadyPingedGameIds:');
		logger.info(alreadyPingedGameIds);

		const playersInGamesNotPinged = pingablePlayers.filter(
			(x) => !alreadyPingedGameIds.includes(x.gameId)
		);
		logger.info('playersInGamesNotPinged:');
		logger.info(playersInGamesNotPinged);

		this.messagePlayers(playersInGamesNotPinged);

		const pingedGameIds = playersInGamesNotPinged.map((x) => x.gameId);
		await db.addPingedGameIds(pingedGameIds);
		logger.info('pingedGameIds:');
		logger.info(pingedGameIds);
	}
}
