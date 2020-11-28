const config = {
  // Bot Owner, level 3 by default.
  ownerID: '',

  // Your Bot's Token. Available on https://discordapp.com/developers/applications/me
  token: '',

  // Prefix
  prefix: '',

  // Bot status message
  status: [],

  // Permission level settings
  permLevels: [
    // This is the lowest permisison level, this is for non-roled users.
    {
      level: 1,
      name: 'User',
      // Don't bother checking, just return true which allows them to execute any command their
      // level allows them to.
      check: () => true,
    },
    {
      level: 2,
      name: 'Moderator',
      check: (message) => {
        try {
          return message.member.hasPermission(['MANAGE_GUILD']);
        } catch {
          return false;
        }
      },
    },
    {
      level: 3,
      name: 'Server Owner',
      check: (message) => {
        try {
          return message.guild.owner.id === message.author.id;
        } catch {
          return false;
        }
      },
    },
    {
      level: 4,
      name: 'Bot Owner',
      // Another simple check, compares the message author id to the one stored in the config file.
      check: (message) => message.client.config.ownerID === message.author.id,
    },
  ],
};

module.exports = config;
