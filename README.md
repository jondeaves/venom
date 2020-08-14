# Venom Discord Bot

This is the Discord bot for Creation Asylum.

## Development

- Requires [NodeJS](https://nodejs.org/), recommend at least the latest LTS version.
- Requires [Yarn](https://classic.yarnpkg.com/lang/en/), recommend latest stable 1.x
- Run `yarn` to install dependencies

### Environment Variables

At a minimum you need to provide the Discord bots Token (which can be found on the Bot tab of a Discord application), MONGODB_URI and MONGODB_DB_NAME values. See table below for possible values.

| key | description | example |
|-------------------|-------------|---------|
| BOT_TRIGGER       | Prefix of message to let bot know you are speaking to it
| DISCORD_BOT_TOKEN | Discord bots Token
| NODE_ENV          | What environment the bot is running in | `production`, `development` or `test` |
| LOG_LEVEL         | What level of logs should be displayed in console | `error`, `warn`, `info`, `verbose`, `debug` or `silly` |
| MONGODB_URI | Full connection string for MongoDB database, include db_name if user is scoped to single database | mongodb://user:password@localhost:27017/venom_db |
| MONGODB_DB_NAME | The name of the database to use for this project | venom_db |

### Bot commands

To add a command you create a Typescript file in `src/bot/commands/[filename].ts` and ensure it implements the `src/bot/commands/ICommand.ts` interface. You can see the other files in this directory for implementation examples. Also ensure you export this file in `src/bot/commands/index.ts`.
