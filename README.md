# LeagueDiscordBot

aka The League Snitch

This discord bot checks to see if players are streaming their League of Legends gameplay, if they are not... then they will be ROASTED!

## File Structure Setup

We use [LeagueDiscordBotFiles](https://github.com/gtai1/LeagueDiscordBotFiles) repository to store environment variables, custom roasts, and account associations.

    ── LeagueDiscordSnitch
     ├── LeagueDiscordBot
     ├── LeagueDiscordBotFiles

## Setup Windows Task Scheduler

![Windows Task Scheduler General Tab](WindowsTaskScheduler/general.PNG)
![Windows Task Scheduler Triggers Tab](WindowsTaskScheduler/triggers.PNG)
![Windows Task Scheduler Actions Tab](WindowsTaskScheduler/actions.PNG)
![Windows Task Scheduler Conditions Tab](WindowsTaskScheduler/conditions.PNG)
![Windows Task Scheduler Settings Tab](WindowsTaskScheduler/settings.PNG)

~~## Setup: Run on Start Up in Windows 10~~

~~<ol>~~
~~<li>Make sure run-discord-bot.bat is in main project directory.</li>~~
~~<li>Create a shortcut to run-discord-bot.bat file.</li>~~
~~<li>Press Start, type Run, and press Enter.</li>~~
~~<li>In the Run window, type <code>shell:startup</code> to open the Startup folder.</li>~~
~~<li>Once the Startup folder is open, cut and paste the .bat shortcut file into the Startup folder.</li>~~
~~</ol>~~

## Future Features To Look Out For

<ul>
<li>League leaderboard (slash command)</li>
<li>thank you message if user starts streaming before next check</li>
<li>add basic unit testing</li>
<li>possibly start using github secrets</li>
<li>need more custom roasts</li>
<li>handling of edge cases in LeageuSnitch.js</li>
<li>convert to typescript?</li>
<li>create a riot api class and add throttling</li>
</ul>

## Authors (alphabetical)

<ul>
<li>Ryan Lubin</li>
<li>Gavin Tai</li>
</ul>
