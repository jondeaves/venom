# Team Codemonkey Discord Bot

This is the Discord bot for Team Codemonkey.

Nothing major in this repo, mostly for testing at this time.

## Development

- Requires [NodeJS](https://nodejs.org/), recommend at least the latest LTS version.
- Run `yarn` or `npm install` to install dependencies

### Environment Variables

At a minimum you need to provide the Discord bots Token, which can be found on the Bot tab of a Discord application. See table below for possible values.

| key | description | example |
|-------------------|-------------|---------|
| BOT_TRIGGER       | Prefix of message to let bot know you are speaking to it
| DISCORD_BOT_TOKEN | Discord bots Token
| ENVIRONMENT       | What environment the bot is running in | `production`, `development` or `test` |
| LOG_LEVEL         | What level of logs should be displayed in console | `error`, `warn`, `info`, `verbose`, `debug` or `silly` |

### Bot commands

To add a command you create a Typescript file in `src/bot/commands/[filename].ts` and ensure it implements the \src/bot/commands/ICommand.ts` interface. You can see the other files in this directory for implementation examples. Also ensure you export this file in `src/bot/commands/index.ts`.
