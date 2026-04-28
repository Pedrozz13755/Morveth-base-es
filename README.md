# Morveth Bot Base

![Morveth Banner](https://uploads.speedhostingg.cloud/uploads/lvcZXjY1P5.jpg)

> Una base modular para la creación de bots de WhatsApp, organizada para estudios, tutoriales y desarrollo de comandos de forma simple, limpia y escalable.

---

## 📌 Sobre el Proyecto

La **Morveth Bot Base** fue creada con enfoque en organización, aprendizaje y facilidad de mantenimiento.

La idea principal es separar los comandos por archivos y categorías, evitando ese código gigante lleno de `case` dentro de `index.js`.

---

## 📁 Estructura del Proyecto

```bash
├── commands
│   ├── adm
│   ├── owner
│   ├── vip
│   ├── menu.js
│   ├── pregunta.js
│   └── template.js
│
├── files
│   ├── audio
│   ├── database
│   ├── images
│   ├── utils
│   └── video
│
├── index.js
├── owner
│   └── config.json
├── package.json
└── start.sh
```

---

## ⚙️ Crear un Comando

```js
const {
  prefix,
  botName,
  ownerName,
  ownerJid,
  ownerLid,
  ownerLink
} = require("../owner/config.json");

module.exports = {
  nombre: "NOMBRE",
  descripcion: "DESCRIPCIÓN",
  comandos: ["comando", "comando2"],
  uso: \`${prefix}comando\`,

  handle: async ({ reply }) => {
    reply("¡Funcionando!");
  },
};
```

---

## 🧠 Funciones Disponibles

```
files, msg, fotomenu, morveth, client, baileys,
fetchJson, getBuffer, getFileBuffer,
enviar, escribir, reaccionar, reply,
enviarImg, enviarImg2,
enviarGif, enviarGif2,
enviarVd, enviarVd2,
enviarAd, enviarAd2,
data, hora, esperar,
selo, info, args, q, text, body, type,
sender, sender2, from,
groupMembers, metadata,
numeroBot, owner, menc, pushname,
isdono, isAdm, isGroup,
Dispositivo, isQuotedImage,
uptimeBot
```

---

## 🔐 Configuración

```json
{
  "prefix": "!",
  "botName": "Morveth",
  "ownerName": "Pedrozz Mods",
  "ownerJid": ["559999999999@s.whatsapp.net"],
  "ownerLid": ["559999999999@lid"],
  "ownerLink": "https://wa.me/559999999999"
}
```

---

## 📦 Instalación

```bash
npm install
```

---

## ▶️ Ejecución

```bash
node index.js
```

o

```bash
bash start.sh
```

---

## 👑 Autor

Pedrozz Mods
