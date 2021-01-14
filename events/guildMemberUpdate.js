const fs = require('fs');
const roleMembers = './data/members.json';

module.exports = async (client, oldMember, newMember) => {
  if (oldMember.user.bot || newMember.user.bot) return;
  if (!oldMember.roles.cache.equals(newMember.roles) && fs.existsSync(roleMembers)) {
    const memberFile = JSON.parse(fs.readFileSync(roleMembers).toString());
    memberFile[newMember.id] = newMember.roles.cache.map((role) => role.id).filter((id) => id !== newMember.guild.roles.everyone.id);
    fs.writeFileSync(roleMembers, JSON.stringify(memberFile, null, 2));
  }
};
