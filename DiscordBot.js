import { Client, GatewayIntentBits } from 'discord.js';
import keys from './keys.json' assert { type: "json" };
import playerFetcher from './PlayerIdFetcher.js';

const clientToken = keys.clientToken;
const client = new Client({ intents: [ 
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,] });

async function getPlayersInGame() {
  const playersInGame = playerFetcher();


}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  //change time interval to 300000
  setInterval(async () => {
    const players = await getPlayersInGame()
    console.log(players);
  }, 1000);

  //someone is in game

    //someone in game and not streaming

    //else someone in game and is already streaming

  //else no one is currently in game
});



client.on("messageCreate", (message) => {
if (message.content === "ping") {
  message.reply("Hey!")
} 
});

client.login(clientToken);