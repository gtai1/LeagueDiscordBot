import fetch from 'node-fetch';
import keys from './keys.json' assert { type: "json" };

//list of summoner names you want to track (riot limits 20 calls per second)
const playerList = ["Blowskie", "Who Fed Zed", "Cros92", "Bill Tompkins", "Asmustwar", "H4zed", "H4Z3D"];
const APIKey = keys.API_Key;

for (let player in playerList) {
    //fetch the playerId's
    const playerIdResponse = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${playerList[player]}?api_key=${APIKey}`);
    const summonerInfo = await playerIdResponse.text();
    const playerId = JSON.parse(summonerInfo).id;

    console.log("[" + playerList[player] + "] playerId = [" + playerId + "]");

    //fetch response code of player fetch to see if in game or not (404 not in game, 200 in game)
    const playerStatusResponse = await fetch(`https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${playerId}?api_key=${APIKey}`);
    const statusCode = playerStatusResponse.status;

    if(statusCode == 400) { //bad request
        console.log("Status code for " + playerList[player] + " is " + statusCode + ". Bad Request.");
    }
    else if(statusCode == 200) { //in game
        console.log("Status code for " + playerList[player] + " is " + statusCode + ". They are currently in game!");
    }
    else { //not in game
        console.log("Status code for " + playerList[player] + " is " + statusCode + ". They are currently not in game.");
    }
}