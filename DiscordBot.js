import { Client, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import LeagueSnitch from './LeagueSnitch.js';

const clientToken = process.env.DISCORD_CLIENT_TOKEN;
const serverId = process.env.DISCORD_JPS_SERVER_ID;
const textChannelId = process.env.DISCORD_JPS_SERVER_GENERAL_CHANNEL_ID;

const client = new Client({
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	],
});

client.on(Events.ClientReady, async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	console.log();
	//change time interval to 300000 (5 min)

	const ls = new LeagueSnitch(client, serverId, textChannelId);
	// setInterval(ls.accusePlayers(), 300000);
	ls.accusePlayers();
});

client.login(clientToken);
