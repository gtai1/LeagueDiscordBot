cd C:\\Users\\Ryan\\Documents\\Software\\LeagueDiscordSnitch\\LeagueDiscordBotFiles
git pull
copy /y ".env" "C:\\Users\\Ryan\\Documents\\Software\\LeagueDiscordSnitch\\LeagueDiscordBot\\\.env"
copy /y accountsList.json C:\\Users\\Ryan\\Documents\\Software\\LeagueDiscordSnitch\\LeagueDiscordBot\\accountsList.json
copy /y customRoasts.json C:\\Users\\Ryan\\Documents\\Software\\LeagueDiscordSnitch\\LeagueDiscordBot\\customRoasts.json
cd C:\\Users\\Ryan\\Documents\\Software\\LeagueDiscordSnitch\\LeagueDiscordBot
call npm start