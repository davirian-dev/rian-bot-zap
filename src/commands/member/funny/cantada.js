import { PREFIX } from "../../../config.js";

const CANTADAS = [
  "Você não é Wi-Fi, mas eu sinto uma conexão surreal entre a gente. 🔥",
  "Se beleza desse cadeia, você já pegaria prisão perpétua com direito a cela vip no meu coração. 😉",
  "Você tem um mapa? Porque me perdi no brilho desse seu olhar. ✨",
  "Você não é GPS, mas recalculou toda a rota da minha vida desde que apareceu por aqui. 😏",
  "Não sou astronauta, mas quando te vejo sinto que já tô no céu. 🚀",
  "Sua mãe por acaso é uma ostra? Porque você é uma verdadeira pérola rara! 💎",
  "Me chama de tabela periódica e vem ver se rola uma química perfeita entre nós dois. 🧪🔥",
  "Você não é café forte, mas com certeza me tirou o sono hoje. ☕",
  "Se você fosse um sanduíche, seu nome seria X-Princesa/X-Gatão com molho especial de sedução. 🍔🤤",
  "Eu não sou previsão do tempo, mas posso garantir que hoje vai rolar um clima entre nós! ⚡"
];

export default {
  name: "cantada",
  description: "Envia uma cantada infalível, engraçada ou sedutora",
  commands: ["cantada", "xaveco", "flerte", "chavecar"],
  usage: `${PREFIX}cantada [@menção opcional]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, isReply, replyJid, mentions, pushName }) => {
    await sendReact("💘");
    const cantada = CANTADAS[Math.floor(Math.random() * CANTADAS.length)];

    let alvo = "";
    if (mentions && mentions.length > 0) {
      alvo = `@${mentions[0].split("@")[0]} `;
    } else if (isReply && replyJid) {
      alvo = `@${replyJid.split("@")[0]} `;
    }

    if (alvo) {
      return sendReply(
        `💘 *LANÇOU A BRABA!* 💘\n\n` +
        `👤 *De:* ${pushName || "Alguém misterioso"}\n` +
        `🎯 *Para:* ${alvo}\n\n` +
        `"${cantada}" 😏🔥`
      );
    }

    return sendReply(`💘 *CANTADA DO DIA* 😏\n\n"${cantada}"\n\n_Marque alguém usando ${PREFIX}cantada @usuario para mandar direto!_`);
  }
};
