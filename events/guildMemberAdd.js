const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const roleMembers = path.join(__dirname, '../../data/members.json');

module.exports = async (client, member) => {
  if (member.user.bot) return;
  const channel = member.guild.channels.cache.get('719089452802244659');
  if (!channel) return;
  const welcomeEmbed = new Discord.MessageEmbed()
      .setAuthor(`${Discord.escapeMarkdown(member.user.tag)}님, 환영합니다!`)
      .setColor('ORANGE')
      .addField('서버 안내', [
        `안녕하세요, ${Discord.escapeMarkdown(member.user.tag)}님! 다시 한 번 환영합니다.`,
        `활동 전 <#719086019558899745>, <#719086600260419625> 채널을 꼭 읽어주세요.`,
        `**이곳이 스터디 카페라는 것을 기억해주세요!**`,
      ].join('\n'))
      .addField('역할 안내', [
        '나이에 따라 다양한 역할을 지급받을 수 있습니다.',
        '**`!역할 목록`** 명령어를 입력해 역할을 확인할 수 있습니다.',
        '확인하셨다면 **`!역할 받기 역할명`**을 입력해  알맞은 역할을 받아보세요.',
      ].join('\n'))
      .setFooter(`계정 생성 일시: ${client.getDate(member.user.createdAt, 'YYYY년 MM월 DD일 HH:mm:ss')}`);
  await channel.send(member.toString(), welcomeEmbed).catch(() => {});

  if (!fs.existsSync(roleMembers)) return;
  const memberFile = JSON.parse(fs.readFileSync(roleMembers).toString());
  if (memberFile.hasOwnProperty(member.id)) {
    await Promise.all(memberFile[member.id].map(async (role) => {
      if (!member.guild.roles.has(role)) return;
      await member.roles.add(role).catch(() => {});
    }));
  }
};
