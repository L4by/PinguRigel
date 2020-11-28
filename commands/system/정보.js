const Discord = require('discord.js');
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const embed = new Discord.MessageEmbed()
      .setColor('#FFD700')
      .setAuthor(`서버 인원 현황 (전체 ${message.guild.memberCount}명)`)
      .addField('학생', [
        message.guild.roles.cache.filter((role) => role.name.endsWith('학생') || role.name === 'N수생')
            .map((role) =>
              `${Discord.escapeMarkdown(role.name)}: ${role.members.size}명`,
            ).sort().join('\n'),
      ].join('\n'), true)
      .addField('선생님', [
        message.guild.roles.cache.filter((role) => role.name.endsWith('쌤'))
            .map((role) =>
              `${Discord.escapeMarkdown(role.name)}: ${role.members.size}명`,
            ).sort().join('\n'),
      ].join('\n'), true)
      .setFooter('For BlueRigel\'s Study Cafe | with <3');
  await message.channel.send(embed);
};

exports.conf = {
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: '정보',
  category: 'System',
  description: '서버에 대한 간단한 정보를 열람합니다.',
  usage: '정보',
};
