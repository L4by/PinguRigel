const fs = require('fs');
const Discord = require('discord.js');
const path = require('path');
const rolePath = path.join(__dirname, '../../data/roles.json');

exports.run = async (client, message, [action, ...val], level) => { // eslint-disable-line no-unused-vars
  if (!['목록'].includes(action) && val?.length < 1) {
    return message.reply([
      '사용 방법이 잘못되었습니다.',
      `사용 방법: \`${message.prefix}${this.help.usage}\``,
    ].join('\n'));
  }

  if (!fs.existsSync(rolePath)) {
    return message.reply([
      '시스템 오류가 발생했습니다.',
      '개발자에게 문의해주세요.',
    ].join('\n'));
  }

  const roleList = require(rolePath);
  const value = val.join(' ');

  switch (action) {
    case '받기':
      const addRole = message.guild.roles.cache.find((role) => role.id === value || role.name === value);
      if (!roleList.includes(addRole.id)) {
        message.reply([
          '받을 수 있는 역할이 아닙니다.',
          `**\`${this.help.name} 목록\`** 명령어로 받을 수 있는 역할을 확인해보세요.`,
        ].join('\n'));
      } else {
        try {
          await message.member.roles.set([addRole.id]);
          await message.reply(`**\`${addRole.name}\`** 역할을 받았습니다!`);
        } catch (err) {
          console.error(err);
          await message.reply([
            '역할을 추가할 수 없습니다.',
            '봇에 권한이 없어 발생한 오류일 가능성이 높습니다.',
          ]);
        }
      }
      break;
    case '추가':
      if (level < 3) return message.reply('해당 동작을 실행하기 위한 권한이 없습니다.');
      const role = message.guild.roles.cache.find((role) => role.id === value || role.name === value);
      const dangerousPerms = [
        'MANAGE_GUILD',
        'KICK_MEMBERS',
        'BAN_MEMBERS',
        'MANAGE_MESSAGES',
      ];
      if (!role) {
        message.reply('해당 역할이 서버에 존재하지 않습니다.');
      } else if (roleList.includes(role.id)) {
        message.reply('이미 목록에 추가된 역할입니다.');
      } else if (!role.editable || role.managed) {
        message.reply('봇이 추가, 또는 제거할 수 없는 역할입니다.');
      } else if (role.permissions.any(dangerousPerms)) {
        message.reply([
          '추가하려는 역할이 특수 권한을 가지고 있습니다.',
          '다음 권한을 모두 해제한 후 다시 추가해주세요:',
          '**`서버 관리하기`**, **`멤버 추방하기`**, **`멤버 차단하기`**, **`메시지 관리하기`**',
        ]);
      } else {
        roleList.push(role.id);
        fs.writeFileSync(rolePath, JSON.stringify(roleList, null, 2));
        message.reply(`**\`${role.name} (${role.id})\`** 역할을 목록에 추가했습니다.`);
      }
      break;
    case '제거':
      if (level < 3) return message.reply('해당 동작을 실행하기 위한 권한이 없습니다.');
      const roleRemoval = message.guild.roles.cache.find((role) => role.id === value || role.name === value);
      if (roleList.length < 1) {
        message.reply('제거할 역할이 없습니다.');
      } else if (!roleList.includes(roleRemoval.id)) {
        message.reply('추가되어 있지 않은 역할을 제거할 수 없습니다.');
      } else {
        const removalIndex = roleList.findIndex((role) => role === roleRemoval.id);
        roleList.splice(removalIndex, 1);
        fs.writeFileSync(rolePath, JSON.stringify(roleList, null, 2));
        message.reply(`**\`${roleRemoval.name} (${roleRemoval.id})\`** 역할을 목록에서 제거했습니다.`);
      }
      break;
    case '목록':
      const viewableRole = roleList.map((roles, index) => `[${index + 1}] ${Discord.escapeMarkdown(message.guild.roles.cache.get(roles).name)}`);
      const viewEmbed = new Discord.MessageEmbed()
          .setColor('GREEN')
          .setAuthor('부여 가능한 역할 목록')
          .setDescription(viewableRole.length > 0 ? viewableRole : '**부여 가능한 역할이 없습니다.**')
          .setFooter('부여 가능한 역할 백제 가능한 역할 엌ㅋㅋㅋ')
          .setTimestamp();
      await message.channel.send(viewEmbed);
      break;
  }
};

exports.conf = {
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: '역할',
  category: 'Study',
  description: '본인의 현재 상태에 맞는 역할을 부여받습니다.',
  usage: '역할 <받기/추가/제거/목록> <역할명 또는 ID>',
};
