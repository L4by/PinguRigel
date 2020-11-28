#!/usr/bin/env node

// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform
// you.
if (Number(process.version.slice(1).split('.')[0]) < 14) throw new Error('Node 14.0.0 or higher is required. Update Node on your system.');

// Load up the discord.js library
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`,
// or `bot.something`, this is what we're refering to. Your client.
const client = new Discord.Client({
  fetchAllMembers: true,
  ws: {
    intents: new Discord.Intents(Discord.Intents.ALL),
  },
});

// Here we load the config file that contains our token and our prefix values.
client.config = require('./config');
// client.config.token contains the bot's token
// client.config.prefix contains the message prefix

// Require our logger
client.logger = require('./modules/Logger');

// Let's start by getting some useful functions that we'll use throughout
// the bot, like logs and elevation features.
require('./modules/functions')(client);

// Aliases and commands are put in collections where they can be read from,
// catalogued, listed, etc.
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

// We're doing real fancy node 8 async/await stuff here, and to do that
// we need to wrap stuff in an anonymous function. It's annoying but it works.
(async () => {
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  // Here we load **commands** into memory, as a collection, so they're accessible
  // here and everywhere else.
  const cmdDir = fs.readdirSync('./commands/');
  cmdDir.forEach((d) => {
    const commands = fs.readdirSync(`./commands/${d}/`).filter((f) => f.endsWith('.js'));
    if (!commands) return;
    // eslint-disable-next-line no-restricted-syntax
    for (const file of commands) {
      const response = client.loadCommand(path.parse(file).name);
      if (response) console.log(response);
    }
  });

  // Then we load events, which will include our message and ready event.
  const evtFiles = fs.readdirSync('./events/');
  client.logger.log(`Loading a total of ${evtFiles.length} events.`);
  evtFiles.forEach((file) => {
    const eventName = file.split('.')[0];
    client.logger.log(`Loading Event: ${eventName}`);
    const event = require(`./events/${file}`);
    client.on(eventName, event.bind(null, client));
  });

  // Detect KeyboardInterrupt event
  process.on('SIGINT', () => {
    client.logger.warn('KeyboardInterrupt Detected. Shutting down..');
    client.destroy();
    process.exit(0);
  });

  // Generate a cache of client permissions for pretty perm names in commands.
  client.levelCache = {};
  for (let i = 0; i < client.config.permLevels.length; i++) {
    const thisLevel = client.config.permLevels[i];
    client.levelCache[thisLevel.name] = thisLevel.level;
  }

  // Here we login the client.
  await client.login(client.config.token);

// End top-level async/await function.
})();
