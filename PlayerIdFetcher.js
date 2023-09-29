import fetch from 'node-fetch';
// import keys from './keys.json' assert { type: "json" };
import lolPlayers from './playerList.json' assert { type: 'json' };
import 'dotenv/config';

export default async function playerFetcher() {
	//list of summoner names you want to track (riot limits 20 calls per second, 100 per 2 minutes)
	const players = lolPlayers.lolPlayerList;
	const APIKey = process.env.RIOT_API_KEY;
	const playersInGame = [];

	for (let player of players) {
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

		//in game
		if (statusCode == 200) {
			playersInGame.push(player);
		}
	}

	return playersInGame;
}
