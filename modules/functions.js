const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

/* eslint-disable */

module.exports = (client) => {
  /*
    PERMISSION LEVEL FUNCTION

    This is a very basic permission system for commands which uses "levels"
    "spaces" are intentionally left black so you can add them if you want.
    NEVER GIVE ANYONE BUT OWNER THE LEVEL 7! By default this can run any
    command including the VERY DANGEROUS `eval` and `exec` commands!

    */
  client.permlevel = (message) => {
    let permlvl = 0;
    const permOrder = client.config.permLevels.slice(0).sort((p, c) => (p.level < c.level ? 1 : -1));

    while (permOrder.length) {
      const currentLevel = permOrder.shift();
      if (message.guild && currentLevel.guildOnly) continue;
      if (currentLevel.check(message)) {
        permlvl = currentLevel.level;
        break;
      }
    }
    return permlvl;
  };

  /*
    SINGLE-LINE AWAITMESSAGE

    A simple way to grab a single reply, from the user that initiated
    the command. Useful to get "precisions" on certain things...

    USAGE

    const response = await client.awaitReply(msg, "Favourite Color?");
    msg.reply(`Oh, I really love ${response} too!`);

    */
  client.awaitReply = async (msg, question) => {
    if (!question) return undefined;
    const filter = (m) => m.author.id === msg.author.id;
    await msg.reply(question);
    try {
      const collected = await msg.channel.awaitMessages(filter, { max: 1, errors: ['time'] });
      return collected.first().content;
    } catch (e) {
      return false;
    }
  };

  client.awaitReaction = async (message, question) => {
    if (!question) return undefined;
    const filter = (reaction, user) => (['✅', '❌'].includes(reaction.emoji.name)) && user.id === message.author.id;
    const awaiter = await message.reply(question);
    await awaiter.react('✅');
    await awaiter.react('❌');
    let result = await awaiter.awaitReactions(filter, { max: 1 });
    result = result.first().emoji.name;
    await awaiter.delete();
    return (result === '✅');
  };

  /*
    MESSAGE CLEAN FUNCTION

    "Clean" removes @everyone pings, as well as tokens, and makes code blocks
    escaped so they're shown more easily. As a bonus it resolves promises
    and stringifies objects!
    This is mostly only used by the Eval and Exec commands.
    */
  client.clean = async (client, text) => {
    if (text && text.constructor.name === 'Promise') { text = await text; }
    if (typeof text !== 'string') { text = require('util').inspect(text, { depth: 1 }); }

    text = text
      .replace(/@/g, `@${String.fromCharCode(8203)}`)
      .replace(/\|/g, '\\|')
      .replace(/_/g, '\\_')
      .replace(/\*/g, '\\*')
      .replace(/~/g, '\\~')
      .replace(/`/g, '\\`')
      .replace(/>/g, '``>')
      .replace(client.token, '`TOKEN REDACTED`');

    return text;
  };

  /*
    GET DATE, UNIX DATE FUNCTION

    Get and format to human string current, or specified date.
    */
  client.getDate = (date, format) => {
    const formatDate = format || 'YYYY/MM/DD HH:mm:ss';
    return require('moment')(date).format(formatDate);
  };

  client.loadCommand = (commandName) => {
    try {
      client.logger.log(`Loading Command: ${commandName}`);
      fs.readdirSync('./commands/').forEach((dirs) => {
        const f = fs.readdirSync(`./commands/${dirs}/`);
        if (f.includes(`${commandName}.js`)) {
          const file = `../commands/${dirs}/${commandName}.js`;
          const props = require(file);
          if (props.init) props.init(client);
          client.commands.set(props.help.name, props);
          props.conf.aliases.forEach((alias) => {
            client.aliases.set(alias, props.help.name);
          });
          return false;
        }
      });
    } catch (e) {
      return `Unable to load command ${commandName}: ${e.stack}`;
    }
  };

  client.unloadCommand = async (commandName) => {
    let command;
    if (client.commands.has(commandName)) {
      command = client.commands.get(commandName);
    } else if (client.aliases.has(commandName)) {
      command = client.commands.get(client.aliases.get(commandName));
      commandName = command.help.name;
    }
    if (!command) return `The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`;

    if (command.shutdown) await command.shutdown(client);
    fs.readdirSync('./commands/').forEach((files) => {
      const f = fs.readdirSync(path.join('./commands/', files));
      if (f.includes(`${commandName}.js`)) {
        const file = `../commands/${files}/${commandName}.js`;
        try {
          client.commands.delete(commandName);
          const mod = require.cache[require.resolve(file)];
          delete require.cache[require.resolve(file)];
          for (let i = 0; i < mod.parent.children.length; i++) {
            if (mod.parent.children[i] === mod) {
              mod.parent.children.splice(i, 1);
              break;
            }
          }
          client.logger.log(`Unloaded command ${commandName}`);
          return false;
        } catch (e) {
          return console.error(`Unable to unload command ${commandName}: ${e.stack}`);
        }
      }
    });
  };

  client.loadInteraction = (name) => {
    let interaction;
    try {
      interaction = require(`../interactions/${name}.js`);
      client.logger.log(`Loading Interaction: ${name}`);
      client.interactions.set(name, interaction);
      return false;
    } catch (e) {
      return `Unable to load Interaction ${name}: ${e.stack}`;
    }
  };

  client.unloadInteraction = (name) => {
    const file = `../interactions/${name}.js`;
    if (!client.interactions.has(name)) return `\`${name}\` 슬래시 커맨드가 존재하지 않습니다.`;

    try {
      client.interactions.delete(name);
      const remain = require.cache[require.resolve(file)];
      delete require.cache[require.resolve(file)];
      for (let i = 0; i < remain.parent.children.length; i++) {
        if (remain.parent.children[i] === remain) {
          remain.parent.children.splice(i, 1);
          break;
        }
      }
      client.logger.log(`Unloaded Interaction: ${name}`);
    } catch (e) {
      return `Failed to unload Interaction ${name}: ${e.stack}`;
    }
  }

  client.waitFor = async (ms) => new Promise((r) => setTimeout(r, ms));

  /* MISCELLANEOUS NON-CRITICAL FUNCTIONS */

  // EXTENDING NATIVE TYPES IS BAD PRACTICE. Why? Because if JavaScript adds this
  // later, this conflicts with native code. Also, if some other lib you use does
  // this, a conflict also occurs. KNOWING THIS however, the following 2 methods
  // are, we feel, very useful in code.

  // <String>.toPropercase() returns a proper-cased string such as:
  // "Mary had a little lamb".toProperCase() returns "Mary Had A Little Lamb"
  Object.defineProperty(String.prototype, 'toProperCase', {
    value() {
      return this.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    },
    enumerable: true,
    configurable: true,
    writable: true,
  });

  // <Array>.random() returns a single random element from an array
  // [1, 2, 3, 4, 5].random() can return 1, 2, 3, 4 or 5.
  Object.defineProperty(Array.prototype, 'random', {
    value() {
      return this[Math.floor(Math.random() * this.length)];
    },
    enumerable: true,
    configurable: true,
    writable: true,
  });

  // These 2 process methods will catch exceptions and give *more details* about the error and stack trace.
  process.on('uncaughtException', (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    client.logger.error(`Uncaught Exception: ${errorMsg}`);
    console.error(err);
    // Always best practice to let the code crash on uncaught exceptions.
    // Because you should be catching them anyway.
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    client.logger.error(`Unhandled rejection: ${err}`);
    console.error(err);
  });
};
