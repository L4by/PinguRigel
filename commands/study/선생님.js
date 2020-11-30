const Discord = require('discord.js');
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const teacherRoles = message.guild.roles.cache.filter((role) => role.name.endsWith('쌤'));
  if (!args[0]) {
    const embed = new Discord.MessageEmbed()
        .setColor('#FFD700')
        .setAuthor(`선생님 목록 (전체 ${teacherRoles.size}명)`)
        .setDescription([
          '온라인인 선생님은 **굵은 글씨**로 표시됩니다.',
          '자리 비움, 다른 용무 중, 오프라인인 선생님은 각각 __밑줄__, *기울인 글씨*, ~~취소선~~으로 표시됩니다.',
        ].join('\n'))
        .setFooter('For BlueRigel\'s Study Cafe | with <3');
    teacherRoles.map((role) => {
      const status = role.members.map((teacher) => {
        const status = teacher.presence.status;
        let display;
        if (status === 'offline') display = `~~${teacher}~~`;
        else if (status === 'idle') display = `__${teacher}__`;
        else if (status === 'dnd') display = `*${teacher}*`;
        else if (status === 'online') display = `**${teacher}**`;
        else display = teacher.toString();
        return display;
      }).join('\n');
      embed.addField(role.name, role.members.size ? status : '(선생님 없음)', true);
    });
    await message.channel.send(embed);
  }
};

exports.conf = {
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: '선생님',
  category: 'Study',
  description: '질문을 받을 수 있는 선생님의 목록을 열람합니다.',
  usage: '선생님',
};
