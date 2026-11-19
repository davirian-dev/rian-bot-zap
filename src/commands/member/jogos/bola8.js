import { PREFIX } from "../../../config.js";

const RESPOSTAS_BOLA8 = [
  // Afirmativas
  "Sim, com certeza absoluta! Pode apostar nisso! ✨",
  "Sem dúvidas! Os astros e a energia do grupo dizem que sim! 🔥",
  "Tudo indica que sim, prepare-se para o melhor! 🥂",
  "Com certeza, não tenha medo de dar o primeiro passo! 😏",
  "Sim! Vai rolar uma química surpreendente! 💘",
  
  // Neutras / Misteriosas
  "O universo diz para ter paciência... a resposta se revelará em breve. 🔮",
  "Melhor não te dizer agora, o clima pode esquentar demais... 👀",
  "Concentre-se e pergunte novamente com mais sede! 🎲",
  "Depende apenas da sua pegada e da sua iniciativa. 😉",
  
  // Negativas
  "Minhas fontes dizem claramente que não. ❌",
  "Nem tente! O perigo de frustração é alto, fuja que é laço! 😅",
  "Muito duvidoso... as chances são quase nulas hoje. 💨",
  "Não conte com isso. Mude a estratégia! 🧐"
];

export default {
  name: "bola8",
  description: "A clássica Bola 8 Mágica responde qualquer pergunta com sim, não ou mistério",
  commands: ["bola8", "8ball", "oraculo", "prever"],
  usage: `${PREFIX}bola8 [sua pergunta]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, pushName }) => {
    const pergunta = args.join(" ").trim();

    if (!pergunta) {
      return sendReply(`🎱 Por favor, faça uma pergunta para a Bola 8 Mágica!\nExemplo: *${PREFIX}bola8 vou arrumar um date incrível esse fim de semana?*`);
    }

    await sendReact("🎱");

    const resposta = RESPOSTAS_BOLA8[Math.floor(Math.random() * RESPOSTAS_BOLA8.length)];

    return sendReply(
      `🎱 *ORÁCULO DA BOLA 8 MÁGICA* 🔮\n\n` +
      `👤 *Pergunta de:* ${pushName || "Alguém curioso"}\n` +
      `❓ _"${pergunta}"_\n\n` +
      `🎱 *A Bola 8 Responde:*\n` +
      `👉 *${resposta}*`
    );
  }
};
