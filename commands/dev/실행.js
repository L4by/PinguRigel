// The EVAL command will execute **ANY** arbitrary javascript code given to it.
// THIS IS PERMISSION LEVEL 10 FOR A REASON! It's perm level 10 because eval
// can be used to do **anything** on your machine, from stealing information to
// purging the hard drive. DO NOT LET ANYONE ELSE USE THIS

// However it's, like, super ultra useful for troubleshooting and doing stuff
// you don't want to put in a command.
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let response;
  if (!args || args.length < 1) {
    response = await client.awaitReply(message, '실행할 코드를 입력해주세요.');
    if (response === '취소') return message.reply('명령이 취소되었습니다.');
  }
  const code = response || args.join(' ');
  try { // eslint-disable-next-line no-eval
    const evaled = eval(`(async () => {${code}})()`);
    const clean = await client.clean(client, evaled);
    console.log(clean);
  } catch (err) {
    message.channel.send(`\`ERROR\` \`\`\`xl\n${await client.clean(client, err)}\n\`\`\``);
  }
};

exports.conf = {
  aliases: [],
  permLevel: 'Bot Owner',
};

exports.help = {
  name: '실행',
  category: 'Dev',
  description: '사용자 지정 Javascript 코드를 실행합니다.',
  usage: '실행 [...code]',
};
