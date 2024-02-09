@REM set PWD=%~dp0
@REM echo %PWD%
cd %PWD%
cd ../LeagueDiscordBotFiles
git pull
copy /y ".env" "..\\LeagueDiscordBot\\\.env"
copy /y accountsList.json ..\\LeagueDiscordBot\\accountsList.json
copy /y customRoasts.json ..\\LeagueDiscordBot\\customRoasts.json
cd ../LeagueDiscordBot
call npm start