const {MessageEmbed} = require('discord.js');
const fs = require('fs');

exports.run = async (client, message, args, level) => {
  const embed = new MessageEmbed()
      .setAuthor('명령어 도움말', client.user.displayAvatarURL({size: 256}))
      .setColor('#FFD700')
      .setTimestamp();
  if (!args[0]) {
    embed.setDescription([
      `**\`${message.prefix}${this.help.name} <명령어>\`** 를 입력해 상세 도움말을 확인할 수 있습니다.`,
      '**`<>`** 는 필수 매개변수이며 반드시 입력해야 합니다.',
      '**`[]`** 는 선택 매개변수이며 입력하지 않아도 됩니다.',
    ].join('\n'));
    const categories = fs.readdirSync('./commands/');
    categories.forEach((category) => {
      const dir = client.commands.filter((c) => c.help.category.toLowerCase() === category.toLowerCase() && client.levelCache[c.conf.permLevel] <= level && c.conf.reachable !== false);
      const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1);
      try {
        if (dir.size < 1) return;
        embed.addField(`❯ ${capitalise}`, dir.map((c) => `**\`${c.help.name}\`**`).join(', '));
      } catch (e) {
        console.log(e);
      }
    });
    await message.channel.send(embed);
  } else {
    const command = client.commands.get(client.aliases.get(args[0]) || args[0]);
    if (level < client.levelCache?.[command?.conf?.permLevel] || !command) {
      return message.reply('해당 명령어가 존재하지 않습니다.');
    }

    embed.setDescription([
      `❯ **명령어:** ${command.help.name}`,
      `❯ **설명:** ${command.help.description || '설명이 없습니다.'}`,
      `❯ **카테고리:** ${command.help.category}`,
      `❯ **사용법:** **\`${command.help.usage ? `${message.prefix}${command.help.usage}` : '사용법이 없습니다.'}\`**`,
      `❯ **별칭:** **\`${command.conf.aliases.join(', ') || '별칭이 없습니다.'}\`**`,
    ].join('\n'));

    await message.channel.send(embed);
  }
};

exports.conf = {
  aliases: ['help', '도움'],
  permLevel: 'User',
};

exports.help = {
  name: '도움말',
  category: 'System',
  description: '현재 권한으로 사용 가능한 명령어를 표시합니다.',
  usage: '도움말 [명령어]',
};
