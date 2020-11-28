exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  if (!args || args.length < 1) return message.reply('다시 불러올 명령어를 입력해주세요.');
  const rldcommand = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
  let response = await client.unloadCommand(args[0]);
  if (response) return message.reply(`오류가 발생했습니다: ${response}`);

  response = client.loadCommand(rldcommand.help.name);
  if (response) return message.reply(`오류가 발생했습니다: ${response}`);

  message.reply(`\`${rldcommand.help.name}\` 명령어를 다시 불러왔습니다.`);
};

exports.conf = {
  aliases: [],
  permLevel: 'Bot Owner',
};

exports.help = {
  name: '리로드',
  category: 'Dev',
  description: '명령어를 다시 불러옵니다.',
  usage: '리로드 [명령어]',
};
