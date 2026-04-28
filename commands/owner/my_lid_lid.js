const { prefix, botName, ownerName, ownerJid, ownerLid, ownerLink } = require("../../owner/config.json")

module.exports = {
  nome: "my_jid_lid",
  descricao: "Sla",
  comandos: ["lid", "jid"],
  uso: `${prefix}lid`,

  handle: async ({ enviar, sender, sender2 }) => {
   enviar(`Lid: ${sender2}\nJid: ${sender}`)
  },
};