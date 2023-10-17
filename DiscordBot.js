import { Client, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import LeagueSnitch from './LeagueSnitch.js';

const clientToken = process.env.DISCORD_CLIENT_TOKEN;

//testing
// const serverId = process.env.DISCORD_JPS_SERVER_ID;
// const textChannelId = process.env.DISCORD_JPS_SERVER_GENERAL_CHANNEL_ID;

//prod
const serverId = process.env.DISCORD_HIDEAWAY_SERVER_ID;
const textChannelId = process.env.DISCORD_HIDEAWAY_SERVER_LEAGUE_CHANNEL_ID;

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

	const leagueSnitch = new LeagueSnitch(client, serverId, textChannelId);
	setInterval(await leagueSnitch.accusePlayers(), 300000);
});

client.login(clientToken);
