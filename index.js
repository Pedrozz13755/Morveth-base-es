//========= CRÉDITOS =============\\
/*
CRÉDITOS: PEDROZZ MODS

Base creada por Pedrozz Mods.
Si compartes, republicas o difundes la información, por favor, mantén los créditos.
Base de datos gratuita. Si alguien la vende, algo anda mal.
*/

//=========== MÓDULOS ===========\\
const {
default: makeWASocket,
useMultiFileAuthState,
makeCacheableSignalKeyStore,
fetchLatestBaileysVersion,
DisconnectReason,
downloadContentFromMessage
} = require("baileys");

const baileys = require("baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const chalk = require("chalk");
const NodeCache = require("node-cache");
const readline = require("readline");

//=========== CONFIG ===========\\
const { prefix, botName, ownerName, ownerJid, ownerLid, ownerLink } = require("./owner/config.json");
const { cor, logBox, getDataHora, formatTime, limparNumero, fetchJson, getBuffer, getFileBuffer, getMetaCached, getBody, getTipoMensagem, msg } = require("./files/utils/func");

const fotomenu = "./files/images/menu.png";
const files = "./files/";
const pastaAuth = "./owner/Morveth-QR";
const pastaComandos = path.join(__dirname, "commands");
const pastaVerif = path.join(__dirname, "files", "utils", "checks");
const comandos = new Map();

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));
//=========== PROTEÇÃO ANTI-CRASH ===========\\
process.on("uncaughtException", (err) => {
console.log(cor.erro("[ERROR NO CONTROLADO]"), err);
});

process.on("unhandledRejection", (err) => {
console.log(cor.erro("[PROMESA RECHAZADA]"), err);
});

//=========== VERIFICAÇÕES ===========\\
let verificacoes = {};

function loadVerificacoes() {
verificacoes = {};

if (!fs.existsSync(pastaVerif)) {
fs.mkdirSync(pastaVerif, { recursive: true });
return;
}

for (const file of fs.readdirSync(pastaVerif)) {
if (!file.endsWith(".js")) continue;

const fullPath = path.join(pastaVerif, file);

try {
delete require.cache[require.resolve(fullPath)];
const nome = file.replace(".js", "");
verificacoes[nome] = require(fullPath);
console.log(cor.roxoClaro(`[VERIFICACIÓN] ${file} cargado.`));
} catch (err) {
console.log(cor.erro(`[ERROR] Error al cargar ${file}:`), err);
}
}
}

function watchVerificacoes() {
if (!fs.existsSync(pastaVerif)) return;

for (const file of fs.readdirSync(pastaVerif)) {
if (!file.endsWith(".js")) continue;

const fullPath = path.join(pastaVerif, file);

fs.watchFile(fullPath, { interval: 1000 }, () => {
console.log(cor.aviso(`[RELOAD] Verificación actualizada: ${file}`));
loadVerificacoes();
});
}
}

//=========== PLUGINS / COMANDOS ===========\\
function loadComandos() {
comandos.clear();

if (!fs.existsSync(pastaComandos)) {
fs.mkdirSync(pastaComandos, { recursive: true });
console.log(cor.aviso("[ÓRDENES] Carpeta creada: comandos"));
return;
}

function percorrer(dir) {
for (const file of fs.readdirSync(dir)) {
const fullPath = path.join(dir, file);
const stat = fs.lstatSync(fullPath);

if (stat.isDirectory()) {
percorrer(fullPath);
continue;
}

if (!file.endsWith(".js")) continue;

try {
delete require.cache[require.resolve(fullPath)];

const comando = require(fullPath);

if (!comando || !Array.isArray(comando.comandos) || typeof comando.handle !== "function") {
console.log(cor.aviso(`[IGNORADO] ${file} No cumple con el estándar de complementos.`));
continue;
}

const relative = path.relative(pastaComandos, fullPath);
const parts = relative.split(path.sep);

let permissao = "geral";

if (parts.length > 1) {
const pasta = parts[0].toLowerCase();

if (pasta === "owner") permissao = "owner";
else if (pasta === "adm") permissao = "adm";
else if (pasta === "vip") permissao = "vip";
}

comando.permissao = comando.permissao || permissao;

for (const cmd of comando.comandos) {
comandos.set(String(cmd).toLowerCase(), comando);
}
} catch (err) {
console.log(cor.erro(`[ERROR] Error al cargar el comando. ${file}:`), err);
}
}
}

percorrer(pastaComandos);
}

function watchComandos() {
if (!fs.existsSync(pastaComandos)) return;

function percorrer(dir) {
for (const file of fs.readdirSync(dir)) {
const fullPath = path.join(dir, file);
const stat = fs.lstatSync(fullPath);

if (stat.isDirectory()) {
percorrer(fullPath);
continue;
}

if (!file.endsWith(".js")) continue;

fs.watchFile(fullPath, { interval: 1000 }, () => {
console.log(cor.aviso(`[RELOAD] Plugin actualizado: ${file}`));
loadComandos();
});
}
}

percorrer(pastaComandos);
}

//=========== INÍCIO DO BOT ===========\\
async function ligarbot() {
const { state, saveCreds } = await useMultiFileAuthState(pastaAuth);
const { version } = await fetchLatestBaileysVersion();

const msgRetryCounterCache = new NodeCache();

const morveth = makeWASocket({
version,
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(
state.keys,
pino({ level: "silent" })
)
},
logger: pino({ level: "silent" }),
printQRInTerminal: false,
browser: ["Ubuntu", "Chrome", "120.0.0.0"],
mobile: false,
generateHighQualityLinkPreview: true,
msgRetryCounterCache,
connectTimeoutMs: 60_000,
defaultQueryTimeoutMs: 0,
keepAliveIntervalMs: 20_000,

patchMessageBeforeSending: (message) => {
const requiresPatch = !!(
message.buttonsMessage ||
message.templateMessage ||
message.listMessage
);

if (requiresPatch) {
message = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadataVersion: 2,
deviceListMetadata: {}
},
...message
}
}
};
}

return message;
}
});

//=========== CONEXÃO POR CÓDIGO ===========\\
if (!morveth.authState.creds.registered) {
logBox("CONEXIÓN DE CÓDIGO", "Por favor, proporcione el número del bot incluyendo el código de país. Ej.: +5511999999999");

const phoneNumber = await question(cor.roxoClaro("Número: "));

if (!phoneNumber) {
console.log(cor.erro("Error: Por favor, proporcione un número de teléfono válido con el código de marcación internacional (DDI)."));
process.exit(1);
}

const numeroLimpo = limparNumero(phoneNumber);
let code = await morveth.requestPairingCode(numeroLimpo);

code = code?.match(/.{1,4}/g)?.join("-") || code;

logBox("CÓDIGO DE EMPAREJAMIENTO", `Código: ${code}`);
}

//=========== ALIASES ===========\\
const client = morveth;
const sock = morveth;
const owner = [...ownerJid, ...ownerLid];
//=========== EVENTOS ===========\\
morveth.ev.on("creds.update", saveCreds);

morveth.ev.on("chats.set", () => {
console.log(cor.roxo("[CHATS] Conversaciones profundas."));
});

morveth.ev.on("contacts.set", () => {
console.log(cor.roxo("[CONTACTOS] Contactos cargados."));
});

//=========== MENSAGENS ===========\\
morveth.ev.on("messages.upsert", async ({ messages }) => {
try {
const info = messages?.[0];
if (!info || !info.message) return;
if (info.key?.remoteJid === "status@broadcast") return;

const from = info.key.remoteJid;
if (!from) return;

const type = baileys.getContentType(info.message);
const body = getBody(info);

const isGroup = from.endsWith("@g.us");
const isCmd = body.startsWith(prefix);

const semPrefixo = isCmd ? body.slice(prefix.length).trim() : "";
const partes = semPrefixo.split(/ +/).filter(Boolean);
const comanownerme = partes.shift()?.toLowerCase() || "";
const args = partes;
const q = partes.join(" ");
const text = q;

const content = JSON.stringify(info.message);

const sendere2 = info.key.participant?.includes("@lid")
? info.key.participant
: info.key.participantAlt;

const sendere = info.key.participantAlt?.includes("@s.whatsapp.net")
? info.key.participantAlt
: info.key.participant;

const sender2 = sendere2 || from;
const sender = sendere || from;

const pushname = info.pushName || "Sem nome";
const isdono = owner.includes(sender) || owner.includes(sender2);
let metadata = null;
let groupMembers = [];
let participante = null;
let nomeChat = "[Privado]";

if (isGroup) {
try {
metadata = await getMetaCached(morveth, from);
groupMembers = metadata.participants || [];
participante = groupMembers.find((p) => p.id === sender);
nomeChat = `[Grupo: ${metadata.subject}]`;
} catch {
nomeChat = "[Grupo: Desconhecido]";
}
}

const numeroBot = morveth.user?.id?.split(":")[0] + "@s.whatsapp.net";
const isAdm = participante?.admin !== undefined || isdono;

const Dispositivo = info.key.id?.length > 21 ? "Android" : info.key.id?.substring(0, 2) === "3A" ? "iPhone" : "WhatsApp Web";

const isQuotedImage = type === "extendedTextMessage" && content.includes("imageMessage");

const menc = q.replace("@", "") + "@s.whatsapp.net";

const { data, hora } = getDataHora();

const tipoMensagem = getTipoMensagem(type);

//=========== LOGS ===========\\
if (isCmd) {
console.log(
cor.roxoEscuro("\n--------------------------------------------") +
"\n" +
cor.roxoClaro(`Usuario: ${pushname}`) +
"\n" +
cor.titulo(`Dominio: ${prefix}${comanownerme}`) +
"\n" +
cor.cinza(`Chat: ${nomeChat}`) +
"\n" +
cor.roxoEscuro("--------------------------------------------\n")
);
} else {
console.log(
cor.roxo(`${pushname}`) +
cor.cinza(` lo envió ${tipoMensagem} em ${nomeChat} `) +
cor.roxoClaro(`"${body?.slice(0, 60) || "..."}"`)
);
}

//=========== SELOS ===========\\
const selo = { key: { fromMe: false, participant: "0@s.whatsapp.net"}, message: { extendedTextMessage: { text: `👑🖤 𝑴𝒐𝒓𝒗𝒆𝒕𝒉 — Soberano del Silencio
> “Usted ingresó… Ahora, afronta las consecuencias.”`, title: null, thumbnailUrl: null } } };

//=========== ENVIAR ===========\\
const esperar = async (tempo) =>
new Promise((resolve) => setTimeout(resolve, tempo));

const safeSend = async (jid, msg, options = {}) => {
try {
return await morveth.sendMessage(jid, msg, options);
} catch (err) {
console.log(cor.erro("[ERROR DE ENVÍO]"), err);
}
};

async function escrever(texto) {
await morveth.sendPresenceUpdate("composing", from);
await esperar(1000);
return safeSend(from, { text: texto }, { quoted: info });
}

//TEXT
const enviar = async (texto) => safeSend(from, { text: texto }, { quoted: info });
const reply = async (texto) => safeSend(from, { text: texto }, { quoted: info });

//IMAGE
const enviarImg = async (link) => safeSend(from, { image: { url: link } }, { quoted: info });
const enviarImg2 = async (link, texto) => safeSend(from, { image: { url: link }, caption: texto }, { quoted: info });

//GIF
const enviarGif = async (link) => safeSend(from, { video: { url: link }, gifPlayback: true }, { quoted: info });
const enviarGif2 = async (link, texto) => safeSend(from, { video: { url: link }, caption: texto, gifPlayback: true }, { quoted: info });

//VIDEO
const enviarVd = async (link) => safeSend(from, { video: { url: link }, mimetype: "video/mp4", fileName: "video.mp4" }, { quoted: info });
const enviarVd2 = async (link, texto) => safeSend(from, { video: { url: link }, caption: texto, mimetype: "video/mp4", fileName: "video.mp4" }, { quoted: info });

//ADIO
const enviarAd = async (link) => safeSend( from,{audio: { url: link },mimetype: "audio/mpeg"},{ quoted: info });
const enviarAd2 = async (link) => safeSend( from, { audio: { url: link }, mimetype: "audio/mpeg", ptt: true }, { quoted: selo } );

//REACTION
const reagir = async (reassao) => safeSend(from, { react: { text: reassao, key: info.key }});

//=========== COMANDOS ===========\\
if (!isCmd) return;

if (!comandos.has(comanownerme)) {
return safeSend(from, { text: `- *Lo intentaste... y fracasaste. Patético.*\n> No revelo mis secretos a cualquiera.\n> Demuestra tu valía usando *${prefix}menu*.`},{ quoted: selo });
}

const comando = comandos.get(comanownerme);

if (comando.permissao === "owner" && !isdono) {
return enviar("No eres digno.")
}

if (comando.permissao === "adm" && !isAdm) {
return enviar(msg.adm);
}

if (comando.permissao === "vip" && !isPremium) {
return enviar(msg.vip);
}

 await comando.handle({ files, msg, fotomenu, morveth, client, baileys, fetchJson, getBuffer, getFileBuffer, enviar, escrever, reagir, reply, enviarImg, enviarImg2, enviarGif, enviarGif2, enviarVd, enviarVd2, enviarAd, enviarAd2, data, hora, esperar, selo, info, args, q, text, body, type, sender, sender2, from, groupMembers, metadata, numeroBot, owner, menc, pushname, isdono, isAdm, isGroup, Dispositivo, isQuotedImage, uptimeBot: formatTime(process.uptime()) });
 
} catch (err) {
console.log(cor.erro("[ERROR EN MESSAGES.UPSERT]"), err);
}
});

//=========== CONEXÃO ===========\\
morveth.ev.on("connection.update", (update) => {
const { connection, lastDisconnect } = update;

if (connection === "connecting") {
logBox("Conectando", "Iniciando conexión...");
return;
}

if (connection === "open") {
logBox("Conectado", "Sesión activa.");
logBox("Status", "Morveth online.");

console.log(cor.roxoEscuro("--------------------------------------------"));
console.log(cor.titulo(" Registros de mensajes"));
console.log(cor.roxoEscuro("--------------------------------------------\n"));
return;
}

if (connection === "close") {
const reason = lastDisconnect?.error?.output?.statusCode;

console.log(cor.aviso(`[Conexión cerrada] Código: ${reason || "desconhecido"}`));

if (reason !== DisconnectReason.loggedOut) {
console.log(cor.aviso("[Reconectando] Intentando restablecer la conexión..."));

setTimeout(() => {
ligarbot().catch((err) => {
console.log(cor.erro("[Error al reconectar]"), err);
});
}, 3000);

return;
}

console.log(cor.erro("[Desconectado] La sesión ha finalizado. Elimine la carpeta de autenticación y vuelva a conectarse."));
}
});
}

//=========== START ===========\\
loadVerificacoes();
watchVerificacoes();

loadComandos();
watchComandos();

ligarbot().catch((err) => {
console.log(cor.erro("[Error al conectar el bot]"), err);
});

//=========== AUTO RESTART DO INDEX ===========\\
fs.watchFile(__filename, { interval: 1000 }, (curr, prev) => {
if (curr.mtime.getTime() !== prev.mtime.getTime()) {
console.log(cor.aviso("[LOG] El archivo principal ha cambiado. Reiniciando..."));
process.exit();
}
});

//=========== FIM ===========\\
