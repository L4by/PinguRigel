const Discord = require('discord.js');

module.exports = async (client, member) => {
  const channel = member.guild.channels.cache.get('719089452802244659');
  if (!channel) return;
  const welcomeEmbed = new Discord.MessageEmbed()
      .setAuthor(`${Discord.escapeMarkdown(member.user.tag)}님, 환영합니다!`)
      .setColor('ORANGE')
      .addField('안녕하세요!', [
        `안녕하세요, ${Discord.escapeMarkdown(member.user.tag)}님! 다시 한 번 환영합니다.`,
        `활동 전 <#719086019558899745>, <#719086600260419625> 채널을 꼭 읽어주세요.`,
        `**이곳은 스터디 카페입니다. 게임 등 공부와 매우 동떨어진 주제의 대화는 삼가해주세요!**`,
      ].join('\n'))
      .addField('역할 안내', [
        '나이에 따라 다양한 역할을 지급받을 수 있습니다.',
        '!역할 받기 명령어를 입력해 알맞은 역할을 받아보세요.',
      ].join('\n'));
  await channel.send(member.toString(), welcomeEmbed).catch(() => {});
};
