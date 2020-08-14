# Developer Environments

Due to the nature of developing a Discord bot it can be helpful to have your own versions of certain systems used by the bot, in order to manually verify your changes.

## Discord Test Bot

Creation your own Bot will be critical to test any new changes made to how the bot is interacted with and indeed testing that most things work.

### Creation a Bot

- Visit the [Discord developer page](https://discord.com/developers/applications)
- Click "New Application" in the top right
- Name your Application, we like to use the format `VenomBotTest[Your name or initials]`, this helps identify the bot easily.
- Once you hit create you will be presented with your application page. Take a note of the `CLIENT ID` that is found just next to your Applications Icon.
- Setting an Icon isn't necessary but can be helpful to identify it.
- In the left navigation select the "Bot" tab and then select "Add Bot" on the right of the new content.
- Confirm you wish to add a bot.
- Disable the "Public Bot" flag, given this is a test bot you don't want others finding it.
- Copy the Bot token that can be found next to the Bots icon (This will be used in the environment variables ). You can just click the "Copy" button.
- Scroll to the bottom of this page and enable "Permissions" for your bot, at this time only Text Permissions are needed and these are;
  - Send Messages
  - [You can add additional permissions if the feature you are development would require this]

### Adding your bot to a server

The best way to test new work is to add the test bot you created above to a different Discord server, possibly even a private server just for this purpose. Once you have a server that you are able to invite bots to then [follow this guide](https://discordjs.guide/preparations/adding-your-bot-to-servers.html) to add your bot. You will need the `CLIENT ID` from before.

## MongoDB Instance

The bot uses MongoDB to store it's data, as a consequence of this you will need to have your own instance of MongoDB if you wish to run the bot yourself. If you don't want to install an instance on your own machine then we can recommend [mLab](https://mlab.com/), as this will be as close to the production version as possible and is free.

## Postgres Instance

The bot uses Postgres to store more structured data, as a consequence of this you will need to have your own instance of Postgres if you wish to run the bot yourself. If you don't want to install an instance on your own machine then we can recommend [ElephantSQL](elephantsql.com), as this will be as close to the production version as possible and is free.

## Final thoughts

Once the above has been completed you can then run your bot locally, ensuring you set the values in `src/.env` to match those provided throughtout the steps above. You may also wish to set the following values.

- Set `BOT_TRIGGER` to `venom test` or something similarly unique. Ensuring you don't confuse your bot with another.
- Set `LOG_LEVEL` to `verbose` to see all possible log information.
- Set `ENVIRONMENT` to `development`.
- As mentioned above, set `DISCORD_BOT_TOKEN` to the value taken from the "Bot" tab of the Discord developer Application.
- Set `MONGODB_URI` to the value of either your local Mongo instance or mLab. The format looks like; `mongodb://[username]:[password]@[host]:[port]/[db_name]`
- Set `MONGODB_DB_NAME` to the database name you are using locally, matching the same value in the previous environment variable.
