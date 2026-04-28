const { prefix, botName, ownerName, ownerJid, ownerLid, ownerLink } = require("../owner/config.json");
const emoji = "🌑";

module.exports = {
nome: "menu",
descricao: "Command menu",
comandos: ["menu", "help"],
uso: `${prefix}menu`,
handle: async ({ morveth, from, files, enviarAd2, selo, reagir, fotomenu, data, hora, pushname, sender, isdono }) => {
 await reagir("🕷️");
 await morveth.sendMessage(from, {image: {url: fotomenu}, caption: `╭═══════════════════⪩
╰╮⟪ *${botName}* ⟫
╭┤➤ ⋟ Nick: ${pushname}
┃│➤ ⋟ Date: ${data}
┃│➤ ⋟ Time: ${hora}
┃│➤ ⋟ Position: ${isdono ? "Owner" : "Member"}
┃╰══════════════════⪨
╰╦══════════════════⪨
╭┤⟪ *MENUS* ⟫
┃│${emoji} ⋟ ${prefix}Menu
┃│${emoji} ⋟ ${prefix}COMMAND
┃╰══════════════════⪨
╰╦══════════════════⪨
╭┤⟪ *NAME* ⟫
┃│${emoji} ⋟ ${prefix}COMMAND
┃╰══════════════════⪨
╰═══════════════════⪨`}, {quoted: selo});
},
};