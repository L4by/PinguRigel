const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const roleMembers = './data/members.json';

module.exports = async (client, member) => {
  if (member.user.bot) return;
  const welcomeChannel = member.guild.channels.cache.get(client.config.channels.welcome);
  const extraChannel = member.guild.channels.cache.get(client.config.channels.extraVerification);
  if (!welcomeChannel || !extraChannel) return;
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
  await welcomeChannel.send(member.toString(), welcomeEmbed).catch(() => {});
  if (moment().diff(member.user.createdAt, 'days') < 180) {
    await member.roles.add(client.config.roles.extraVerification).catch(() => {});
    const extraVerification = new Discord.MessageEmbed()
        .setAuthor('계정 생성일이 6개월 이내입니다!')
        .setColor('RED')
        .addField('추가 인증 안내', [
          '최근 사회화에 필요한 기초적인 교육조차 이수하지 않은 특정 사용자의 지속적인 분탕 행위로 인해, 계정 생성 후 6개월이 지나지 않은 경우 추가적인 인증 절차를 진행하여야 합니다.',
        ].join('\n'))
        .addField('인증 페이지', [
          '해당 인증 절차는 아래의 링크를 클릭하여 완료할 수 있습니다. 인증을 진행하지 않는 경우 서버 활동이 불가능하니 이 점 유의 부탁드립니다. 이용에 불편을 끼쳐 죄송합니다.',
          '**[추가 인증 페이지 바로 가기](https://esauth.xyz/rigel)**',
        ].join('\n'));
    await extraChannel.send(member.toString(), extraVerification).catch(() => {});
  }

  if (!fs.existsSync(roleMembers)) return;
  const memberFile = JSON.parse(fs.readFileSync(roleMembers).toString());
  if (memberFile.hasOwnProperty(member.id)) {
    await Promise.all(memberFile[member.id].map(async (role) => {
      if (!member.guild.roles.cache.has(role) || !member.guild.roles.cache.get(role)?.editable || role === member.guild.roles.everyone.id) return;
      await client.waitFor(2000);
      await member.roles.add(role).catch(() => {});
    }));
  }
};
