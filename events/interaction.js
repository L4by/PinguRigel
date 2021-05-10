module.exports = async (client, interaction) => {
  if (!interaction.isCommand()) return;

  const interact = client.interactions.get(interaction.commandName);
  if (!interact) return;

  client.logger.cmd(`${interaction.user.tag} (${interaction.user.id}) `
   + `ran interaction ${interact.conf.name}`);
  interact.run(client, interaction);
};
