module.exports = async (client) => {
  // Log that the bot is online.
  client.logger.log(`Logged in as ${client.user.tag}!`, 'ready');

  // Make the bot "play the game" which is the help command with default prefix.
  while (true) {
    await client.user.setActivity(client.config.status.random() || `${client.config.prefix} 도움말`, {type: 'WATCHING'});
    await client.waitFor(getRandomIntInclusive(60 * 1000, 70 * 1000));
  }

  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; // 최댓값도 포함, 최솟값도 포함
  }
};
