import { PREFIX } from "../../../config.js";

const statusQuimica = [
  { min: 0, max: 20, desc: "🧊 Clima de geladeira... Melhor ficarem só na amizade mesmo!", emoji: "❄️" },
  { min: 21, max: 40, desc: "👀 Rola um flerte discreto, mas falta coragem de dar o primeiro passo.", emoji: "😏" },
  { min: 41, max: 60, desc: "✨ Tem faísca no ar! Com duas doses de drink e uma boa conversa, tudo acontece.", emoji: "🍸" },
  { min: 61, max: 80, desc: "🔥 Tensão sexual altíssima! O quarto do Casalzaum aprova esse match.", emoji: "🌶️" },
  { min: 81, max: 100, desc: "💥 EXPLOSÃO DE QUÍMICA! Se vocês dois ficarem sozinhos 5 minutos, a laje pega fogo!", emoji: "🔞" }
];

export default {
  name: "shippar",
  description: "Calcula a química sensual entre dois membros do grupo",
  commands: ["shippar", "quimica", "match", "casal"],
  usage: `${PREFIX}shippar @membro1 @membro2`,

  handle: async ({ args, sendReply, sendReact, userLid }) => {
    await sendReact("💘");

    let p1 = "";
    let p2 = "";
    const mentions = [];

    if (args.length >= 2 && args[0].includes("@") && args[1].includes("@")) {
      p1 = args[0];
      p2 = args[1];
    } else if (args.length >= 1 && args[0].includes("@") && userLid) {
      p1 = `@${userLid.split("@")[0]}`;
      p2 = args[0];
    } else {
      p1 = `@${userLid ? userLid.split("@")[0] : "Você"}`;
      p2 = "alguém misterioso do grupo";
    }

    const pct = Math.floor(Math.random() * 101);
    const resultado = statusQuimica.find(s => pct >= s.min && pct <= s.max) || statusQuimica[statusQuimica.length - 1];

    const barra = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));

    const msg = 
`💘 *TERMÔMETRO DA QUÍMICA — CLUB CASALZAUM* 🔞

👥 *Candidatos:* ${p1} & ${p2}
📊 *Nível de Atração:* ${pct}%
[${barra}] ${resultado.emoji}

💬 *Veredito do Takeshi:*
_${resultado.desc}_

👉 *Se curtiram, mandem logo um direct ou convidem pro VIP!* 🔥`;

    await sendReply(msg);
  }
};
