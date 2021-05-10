const fs = require('fs');

exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  await interaction.defer();
  const role = interaction.options[0].role;
  const member = interaction.member;
  const roleList = JSON.parse(fs.readFileSync('./data/roles.json').toString());

  if (!role) return;

  if (member.roles.cache.has(role.id)) {
    await interaction.editReply([
      'ERROR! You already have this role.',
    ]);
  } else if (!roleList.includes(role.id)) {
    await interaction.editReply([
      'ERROR! This role is unobtainable.',
      'If you believe this is in error, please contact to administrator.',
    ]);
  } else {
    await member.roles.add(role.id);
    await interaction.editReply([
      `:white_check_mark: Done! Now you have **\`${role.name}\`** role. GG!`,
    ]);
  }
};

exports.conf = {
  name: 'getrole',
};
