import fetch from 'node-fetch';
import keys from './keys.json' assert { type: "json" };
import lolPlayers from './playerList.json' assert { type: "json" };

export default async function playerFetcher() {
    //list of summoner names you want to track (riot limits 20 calls per second, 100 per 2 minutes)
    const players = lolPlayers.lolPlayerList;
    const APIKey = keys.apiKey;
    const playersInGame = [];

    for (let player in players) {
        //fetch the playerId's
        const playerIdResponse = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${players[player]}?api_key=${APIKey}`);
        const summonerInfo = await playerIdResponse.text();
        const playerId = JSON.parse(summonerInfo).id;

        //console.log(`[${players[player]}] playerId = [${playerId}]`);

        //fetch response code of player fetch to see if in game or not (404 not in game, 200 in game)
        const playerStatusResponse = await fetch(`https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${playerId}?api_key=${APIKey}`);
        const statusCode = playerStatusResponse.status;

        if(statusCode == 400) { //bad request
            //console.log(`Status code for ${players[player]} is ${statusCode}. Bad Request.`)
        }
        else if(statusCode == 200) { //in game
            //console.log(`Status code for ${players[player]} is ${statusCode}. They are currently in game!`)
            playersInGame.push(players[player]);
        }
        else { //not in game
            //console.log(`Status code for ${players[player]} is ${statusCode}. They are currently not in game.`)
        }
    }

    return playersInGame;
}