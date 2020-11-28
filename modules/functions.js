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

  /*
    RANDOM STRING FUNCTION
    ALPHA-NUMBERIC | ALPHABET | NUMBERIC
    */

  client.randomString = (len = 6, an) => {
    an = an && an.toLowerCase();
    let str = '';
    let i = 0;
    let min = an === 'a' ? 10 : 0;
    let max = an === 'n' ? 10 : 62;
    for (;i++ < len;) {
      let r = Math.random() * (max - min) + min << 0;
      str += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48);
    }
    return str;
  };

  /* CREATE ARRAY PAGE */
  client.ArrayPage = class {
    constructor(target, valueRaw) {
      if (!target || target.constructor !== Array) {
        this.array = [];
      } else {
        this.array = target;
      }

      if (!valueRaw || !Math.floor(valueRaw) || parseInt(valueRaw) < 1 || parseInt(valueRaw) > 20) {
        this.perPage = 10;
      } else {
        this.perPage = parseInt(valueRaw);
      }

      this.maxPage = Number.isInteger(this.array.length / this.perPage) ? Math.floor(this.array.length / this.perPage) : Math.floor(this.array.length / this.perPage) + 1;
    }

    page(numberRaw) {
      if (!numberRaw || !Math.floor(numberRaw)) return undefined;
      const number = parseInt(numberRaw);
      const page = this.array.slice(Math.floor(this.perPage * (number - 1)), Math.floor(this.perPage * number));
      page.pageNumber = number;
      if (!page.length) return undefined;
      return page;
    }
  };

  client.arrayPageReturn = async (restrict, message, baseMessage, list, desc, embed, option) => {
    if (!message || !baseMessage || !embed) return;
    if (!list || (list && list.constructor !== Array)) return;
    if (!desc || (desc && desc.constructor !== Function)) return;
    if (option && option.constructor !== Object) return;

    const optionResv = {
      forward: true,
      backward: true,
      last: true,
      first: true,
      moveto: true,
      select: true,
      cancel: true,
      pagecount: 5,
    };

    const optionDesc = {
      forward: '다음 페이지 : **`다음`**, **`>`** 입력',
      backward: '이전 페이지 : **`이전`**, **`<`** 입력',
      last: '마지막 페이지 : **`마지막`**, **`>>`** 입력',
      first: '처음 페이지 : **`처음`**, **`<<`** 입력',
      moveto: '페이지 이동 : **`이동 [번호]`** 입력',
      select: '대상 선택 : **`선택 [번호]`** 입력',
      cancel: '명령 취소 : **`취소`**, **`X`** 입력',
    };

    if (option) Object.keys(option).map((x) => { optionResv[x] = option[x]; });

    const resultPage = new client.ArrayPage(list, optionResv.pagecount);

    let repeat = true;
    let i = 1;

    const result = {
      value: undefined,
      index: undefined,
      status: undefined,
    };

    const cancel = () => {
      const cancelEmbed = new Discord.MessageEmbed()
        .setAuthor('검색을 종료합니다.');
      cancelEmbed.footer = embed.footer;
      baseMessage.edit('', cancelEmbed);
      baseMessage.delete({ timeout: 5000 });
      repeat = false;
      result.status = 'cancel';
    };

    do {
      embed.setDescription(resultPage.page(i) ? `${`${resultPage.page(i).map((x, index) => `[${index + 1}] ${desc(x)}`).join('\n')}`
                + `\n\n페이지 ${i}/${resultPage.maxPage} : ${list.length}개의 결과 - ${resultPage.page(i).length}개 표시중\n\n`}${
        Object.keys(optionDesc).filter((x) => optionResv[x]).map((x) => optionDesc[x]).join('\n')}` : '대상이 없습니다.');

      await baseMessage.edit('', embed);
      await baseMessage.channel.awaitMessages((m) => m.author === message.author, { time: 30000, max: 1, error: ['time'] }).then((collection) => {
        const text = collection.map((x) => x.content).join(' ').trim().split(/ +/g);
        const colClear = () => {
          collection.map((x) => {
            x.delete().catch((err) => console.error(err));
          });
        };

        const optionFuncRaw = {
          forward: {
            key: ['다음', '>'],
            com: () => {
              colClear();
              if (!resultPage.page(i + 1)) return;
              return i++;
            },
          },
          backward: {
            key: ['이전', '<'],
            com: () => {
              colClear();
              if (!resultPage.page(i - 1)) return;
              return i--;
            },
          },
          last: {
            key: ['마지막', '>>'],
            com: () => {
              colClear();
              return i = resultPage.maxPage;
            },
          },
          first: {
            key: ['처음', '<<'],
            com: () => {
              colClear();
              return i = 1;
            },
          },
          moveto: {
            key: ['이동'],
            com: () => {
              colClear();
              if (!Math.floor(text[1]) || !resultPage.page(parseInt(text[1]))) return;
              return i = parseInt(text[1]);
            },
          },
          select: {
            key: ['선택'],
            com: () => {
              if (!Math.floor(text[1]) || parseInt(text[1]) < 1 || parseInt(text[1]) > resultPage.page(i).length) return collection.map((x) => x.delete());

              result.index = Math.floor(parseInt(text[1]) + (optionResv.pagecount * (i - 1)) - 1);
              result.value = list[result.index];
              result.status = 'select';

              return repeat = false;
            },
          },
          cancel: {
            key: ['취소', 'X'],
            com: cancel,
          },
        };

        const optionFunc = Object.keys(optionFuncRaw).filter((x) => optionResv[x]).map((x) => optionFuncRaw[x]);
        const optionCom = Object.values(optionFunc).find((x) => x.key.includes(text[0].toUpperCase()));
        optionCom ? optionCom.com() : (restrict ? optionFuncRaw.cancel.com() : colClear());
      }).catch((err) => {
        console.error(err);
        return cancel();
      });
    } while (repeat);
    return result;
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

  client.cleanMessage = (msg) => {
    return msg.cleanContent.replace(/\n/g, '\n\t');
  }

  client.waitFor = async (ms) => new Promise((r) => setTimeout(r, ms));

  client.getGitVersion = () => execSync('git rev-parse HEAD')?.toString?.()?.trim?.()?.substr?.(0, 7);

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
  });

  // <Array>.random() returns a single random element from an array
  // [1, 2, 3, 4, 5].random() can return 1, 2, 3, 4 or 5.
  Object.defineProperty(Array.prototype, 'random', {
    value() {
      return this[Math.floor(Math.random() * this.length)];
    },
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
