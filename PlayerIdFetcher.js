import fetch from 'node-fetch';
import accountsList from './accountsList.json' assert { type: 'json' };
import 'dotenv/config';

export default async function getPlayersInGame() {
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
		// console.log(t);
		// console.log('gameMode', gameMode);
		// console.log('gameType', gameType);
		// console.log('gameQueueConfigId', t.gameQueueConfigId);

		//in game
		if (statusCode == 200) {
			//check for ranked game
			if (gameMode == 'CLASSIC' && gameType == 'MATCHED_GAME') {
				for (let x of playerAccountInfo) {
					for (let y of x.leagueName) {
						if (player === y) {
							x['gameId'] = gameId;
							playersInGame.push(x);
						}
					}
				}
			}
		}
	}

	return playersInGame;
}
