const fs = require("fs");
const path = require("path");
const axios = require("axios");
const chalk = require("chalk");
const baileys = require("baileys");

//=========== CORES ===========\\
const cor = {
titulo: chalk.hex("#c77dff").bold,
roxo: chalk.hex("#9d4edd"),
roxoClaro: chalk.hex("#e0aaff"),
roxoEscuro: chalk.hex("#7b2cbf"),
sucesso: chalk.hex("#b517ff").bold,
aviso: chalk.hex("#c77dff").bold,
erro: chalk.hex("#ff4d6d").bold,
cinza: chalk.hex("#b8b8b8"),
branco: chalk.white.bold
};

function logBox(titulo, texto) {
  console.log(`${cor.titulo(titulo)} - ${cor.roxoClaro(texto)}`);
}

//=========== DATA / HORA ===========\\
function getDataHora() {
const date = new Date();

return {
data: new Intl.DateTimeFormat("pt-BR").format(date),
hora: date.toLocaleTimeString("pt-BR", { hour12: false })
};
}

function formatTime(seconds) {
const h = Math.floor(seconds / 3600);
const m = Math.floor((seconds % 3600) / 60);
const s = Math.floor(seconds % 60);

return `${h}h ${m}m ${s}s`;
}

//=========== FUNÇÕES ÚTEIS ===========\\
function limparNumero(numero) {
return String(numero || "").replace(/[^0-9]/g, "");
}

async function fetchJson(url, options = {}) {
try {
const res = await axios({
method: "GET",
url,
headers: {
"User-Agent":
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
},
...options
});

return res.data;
} catch (err) {
return err;
}
}

async function getBuffer(url, options = {}) {
const res = await axios({
method: "GET",
url,
headers: {
DNT: 1,
"Upgrade-Insecure-Request": 1
},
responseType: "arraybuffer",
...options
});

return res.data;
}

async function getFileBuffer(mediakey, mediaType) {
const stream = await baileys.downloadContentFromMessage(mediakey, mediaType);
let buffer = Buffer.from([]);

for await (const chunk of stream) {
buffer = Buffer.concat([buffer, chunk]);
}

return buffer;
}

//=========== CACHE DE METADATA ===========\\
const metaCache = new Map();
async function getMetaCached(client, jid) {
const now = Date.now();
const cached = metaCache.get(jid);

if (cached && now - cached.time < 5 * 60 * 1000) {
return cached.data;
}

const data = await client.groupMetadata(jid);
metaCache.set(jid, { time: now, data });

return data;
}

setInterval(() => { metaCache.clear(); }, 5 * 60 * 1000);

//=========== PEGAR TEXTO ===========\\
function getBody(info) {
const msg = info.message || {};

return (msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || msg.documentMessage?.caption || "" );
}

function getTipoMensagem(type) {
const tipos = {
conversation: "Texto",
extendedTextMessage: "Texto",
audioMessage: "Áudio",
stickerMessage: "Figurinha",
imageMessage: "Imagem",
videoMessage: "Vídeo",
documentMessage: "Documento",
contactMessage: "Contato",
locationMessage: "Localização"
};
return tipos[type] || "Desconhecido";
}

//=========== MENSAGENS RÁPIDAS ===========\\
const msg = {
espera: "- *No me apresures.*\n> Mi poder no se inclina ante tu ansiedad... espera.",
owner: "- *Te atreves a tocar lo que no te pertenece...*\n> Este comando responde solo a mi maestro — y tú no lo eres.",
query: "- *He escarbado en el vacío por ti...*\n> Pero no había nada digno de ser encontrado.",
adm: "- *Aún no posees la autoridad suficiente...*\n> Solo mis generales pueden usar este comando.",
admBot: "- *Quieres que actúe... pero me mantienes encadenada.*\n> Concédeme poder como administradora — o no me pidas nada.",
vip: "- *Este poder no es para cualquiera...*\n> Solo los elegidos caminan por este camino — y tú aún no has sido llamado."
};
//=>Export
module.exports = { cor, logBox, getDataHora, formatTime, limparNumero, fetchJson, getBuffer, getFileBuffer, getMetaCached, getBody, getTipoMensagem, msg }