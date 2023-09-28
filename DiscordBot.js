import { Client, GatewayIntentBits } from 'discord.js';
import keys from './keys.json' assert { type: "json" };

const clientToken = keys.CLIENT_Token;
const client = new Client({ intents: [ 
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (message) => {
if (message.content === "ping") {
  message.reply("Hey!")
} 
});

client.login(clientToken);