const Discord = require('discord.js');
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const teacherRoles = message.guild.roles.cache.filter((role) => role.name.endsWith('쌤'));
  const classList = teacherRoles.map((role) => role.name.slice(0, role.name.length - 1));
  if (!args || args.length < 1 || !classList.includes(args?.[0])) {
    await message.reply([
      '사용 방법이 잘못되었습니다.',
      '선생님 목록을 조회 가능한 과목으로 다시 시도해주세요:',
      `\`${classList.join(', ')}\``,
    ].join('\n'));
  } else {
    const chosenClass = `${args[0]}쌤`;
    const classTeacher = message.guild.roles.cache.find((role) => role.name === chosenClass);
    if (!classTeacher) {
      await message.reply([
        '뭔가 잘못되었습니다.',
        '서버 관리자 또는 개발자에게 문의해주세요.',
      ].join('\n'));
    } else {
      const embed = new Discord.MessageEmbed()
          .setColor('#FFD700')
          .setAuthor(`선생님 목록 (전체 ${classTeacher.members.size}명)`)
          .setDescription([
            '온라인 중인 선생님은 [O]가, 자리 비움, 다른 용무 중, 오프라인인 선생님은 각각 [I], [N], [A]가 이름 앞에 붙습니다.',
            '일과 시간에는 이 상태, 특히 다른 용무 중인 선생님들을 호출하는 것이 권장되지 않습니다.',
          ].join('\n'))
          .setFooter('For BlueRigel\'s Study Cafe | with <3');
      classTeacher.map((role) => {
        const status = role.members.map((teacher) => {
          const status = teacher.presence.status;
          let display;
          if (status === 'offline') display = `[A] ${teacher}`;
          else if (status === 'idle') display = `[I] ${teacher}`;
          else if (status === 'dnd') display = `[N] ${teacher}`;
          else if (status === 'online') display = `[O] ${teacher}`;
          return display;
        }).join('\n');
        embed.addField(role.name, role.members.size ? status : '(선생님 없음)', true);
      });
      await message.channel.send(embed);
    }
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
  usage: '선생님 <과목>',
};
