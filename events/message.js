// The MESSAGE event runs anytime a message is received
// Note that due to the binding of client to every event, every event
// goes `client, other, args` when this function is run.

module.exports = async (client, message) => {
  if (message.author.bot) return;
  // Checks if the bot was mentioned, with no message after it, returns the prefix.
  /* const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
  if (message.content.match(prefixMention)) {
    return message.reply(`현재 이 봇의 접두사는 \`${client.config.prefix}\` 입니다.`);
  } */

  if (!message.content.startsWith(client.config.prefix)) return;
  const prefix = message.prefix = client.config.prefix;

  // Here we separate our "command" name, and our "arguments" for the command.
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // If the member on a guild is invisible or not cached, fetch them.
  if (message.guild && !message.member) await message.guild.members.cache.fetch(message.author);

  // Get the user or member's permission level from the elevation
  const level = client.permlevel(message);

  // Check whether the command, or alias, exist in the collections defined
  // in app.js.
  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
  // using this const varName = thing OR other thing; is a pretty efficient
  // and clean way to grab one of 2 values!
  if (!cmd) return;

  // Return if bot doesn't has very essential permissions
  if (message.guild && !message.channel.permissionsFor(message.guild.me).has(['SEND_MESSAGES'])) return;

  if (level < client.levelCache[cmd.conf.permLevel]) {
    return client.logger.warn(`Unauthorized command access from ${message.author.tag} (${message.author.id})`);
  }

  // To simplify message arguments, the author's level is now put on level (not member so it is supported in DMs)
  // The "level" command module argument will be deprecated in the future.
  message.author.permLevel = level;

  // If the command exists, **AND** the user has permission, run it.
  const cmdFormat = `${client.config.permLevels.find((l) => l.level === level).name} ${message.author.tag} (${message.author.id}) ran command ${cmd.help.name}`;
  client.logger.cmd(cmdFormat);

  cmd.run(client, message, args, level);
};
