const fs = require('fs');
const path = require('path');
const roleMembers = path.join(__dirname, '../../data/members.json');

module.exports = async (client, oldMember, newMember) => {
  if (!oldMember.roles.equals(newMember.roles) && fs.existsSync(roleMembers)) {
    const memberFile = JSON.parse(fs.readFileSync(roleMembers).toString());
    memberFile[newMember.id] = newMember.roles.cache.map((role) => role.id);
    fs.writeFileSync(roleMembers, JSON.stringify(memberFile, null, 2));
  }
};
