import fetch from 'node-fetch';
import keys from './keys.json' assert { type: "json" };

const playerIds = ["Jam", "tinysprite"];
const APIKey = keys.API_Key;

for (let player in playerIds)
{
    const response = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${playerIds[player]}?api_key=${APIKey}`);
    const body = await response.text();

    console.log(JSON.parse(body).id);
    const id = JSON.parse(body).id;

    const response2 = await fetch(`https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${id}?api_key=${APIKey}`);
    const body2 = await response2.text();

    console.log(response2.status);
}