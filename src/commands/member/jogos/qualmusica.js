import { PREFIX } from "../../../config.js";

const BANCO_MUSICAS_EMOJI = [
  {
    emojis: "🤠 🐎 👢 🍺",
    resposta: "EVIDENCIAS",
    tituloOriginal: "Evidências",
    artista: "Chitãozinho & Xororó",
    dica: "O hino nacional brasileiro dos karaokês e resenhas!"
  },
  {
    emojis: "🚗 💨 🟡",
    resposta: "CAMARO AMARELO",
    tituloOriginal: "Camaro Amarelo",
    artista: "Munhoz & Mariano",
    dica: "Sertanejo universitário que estourou com o doce doce amor."
  },
  {
    emojis: "❤️ 🔒 🗝️",
    resposta: "CADEADO",
    tituloOriginal: "Cadeado",
    artista: "Lauana Prado",
    dica: "Quem tem o coração trancado mas quer liberar a chave."
  },
  {
    emojis: "🔥 👄 🛏️ 😈",
    resposta: "LEPO LEPO",
    tituloOriginal: "Lepo Lepo",
    artista: "Psirico",
    dica: "Pagodão baiano clássico de Salvador!"
  },
  {
    emojis: "✈️ 🏖️ ☀️ 🌴",
    resposta: "POSTURADO E CALMO",
    tituloOriginal: "Posturado e Calmo",
    artista: "Léo Santana",
    dica: "Hit gigante do GG da Bahia nas academias e festas."
  },
  {
    emojis: "🌊 🧜‍♀️ 🐚 💎",
    resposta: "COMO UMA ONDA",
    tituloOriginal: "Como Uma Onda",
    artista: "Lulu Santos",
    dica: "Nada do que foi será de novo do jeito que já foi um dia..."
  },
  {
    emojis: "🌧️ ⛈️ ☔ 💔",
    resposta: "TEMPO PERDIDO",
    tituloOriginal: "Tempo Perdido",
    artista: "Legião Urbana",
    dica: "Todos os dias antes de dormir, lembro e esqueço como foi o dia..."
  },
  {
    emojis: "💄 👠 💃 🪩",
    resposta: "SHOW DAS PODEROSAS",
    tituloOriginal: "Show das Poderosas",
    artista: "Anitta",
    dica: "Prepara que agora é a hora do show das poderosas!"
  },
  {
    emojis: "🍺 🥩 🪕 🍗",
    resposta: "DEIXA ACONTECER",
    tituloOriginal: "Deixa Acontecer",
    artista: "Grupo Revelação",
    dica: "Deixa o coração se acalmar... Pagode clássico de churrasco!"
  },
  {
    emojis: "📱 🚫 💔 🥃",
    resposta: "BLOQUEADO",
    tituloOriginal: "Bloqueado",
    artista: "Gusttavo Lima",
    dica: "Eu tô bloqueado e se você me desbloquear eu ligo..."
  },
  {
    emojis: "🍌 🍓 🍇 🥝",
    resposta: "ACAI",
    tituloOriginal: "Açaí",
    artista: "Djavan",
    dica: "Açaí, guardiã, voz de tocar num violão..."
  },
  {
    emojis: "👑 🥂 🍾 🔞",
    resposta: "CASALZAUM",
    tituloOriginal: "Casalzaum",
    artista: "Davi & Mari",
    dica: "A comunidade mais exclusiva, liberal e charmosa do Brasil!"
  }
];

// Partidas ativas de Qual é a Música por grupo/chat: Map<remoteJid, { emojis, resposta, tituloOriginal, artista, dica, tentativas }>
const partidasMusica = new Map();

function normalizar(texto) {
  return (texto || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

export default {
  name: "qualmusica",
  description: "Adivinhe qual é a música pelos emojis com pistas e dicas",
  commands: ["qualmusica", "musicaemoji", "emojimusica", "adivinhemusica", "qmusica"],
  usage: `${PREFIX}qualmusica [seu palpite / novo / dica / parar]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, remoteJid, pushName }) => {
    const palpite = args.join(" ").trim();
    const comandoSub = palpite.toLowerCase();

    // 1. Iniciar ou Sortear Nova Música
    if (!palpite || comandoSub === "novo" || comandoSub === "iniciar" || comandoSub === "start") {
      const item = BANCO_MUSICAS_EMOJI[Math.floor(Math.random() * BANCO_MUSICAS_EMOJI.length)];

      partidasMusica.set(remoteJid, {
        ...item,
        tentativas: 0,
        iniciadoPor: pushName || "Membro"
      });

      await sendReact("🎵");

      return sendReply(
        `🎧 *QUAL É A MÚSICA?* 🎶✨\n` +
        `_Descubra o nome da música decifrando os emojis!_\n\n` +
        `┌────────────────────────┐\n` +
        `   ${item.emojis}\n` +
        `└────────────────────────┘\n\n` +
        `💡 *Dica:* ${item.dica}\n\n` +
        `👉 Para chutar, digite: *${PREFIX}qualmusica [nome da música]*\n` +
        `Exemplo: *${PREFIX}qualmusica Evidencias*\n` +
        `❌ Para encerrar: *${PREFIX}qualmusica parar*`
      );
    }

    // 2. Parar partida
    if (comandoSub === "parar" || comandoSub === "cancelar" || comandoSub === "desistir") {
      if (!partidasMusica.has(remoteJid)) {
        return sendReply(`⚠️ Não há nenhum desafio de música ativo no momento. Digite *${PREFIX}qualmusica* para começar!`);
      }
      const jogo = partidasMusica.get(remoteJid);
      partidasMusica.delete(remoteJid);
      await sendReact("⏹️");
      return sendReply(
        `🏳️ *Desafio encerrado!*\n` +
        `🎵 A música era: *"${jogo.tituloOriginal}"* de *${jogo.artista}*!\n` +
        `Emojis: ${jogo.emojis}`
      );
    }

    // 3. Pedir Dica Extra
    if (comandoSub === "dica") {
      const jogo = partidasMusica.get(remoteJid);
      if (!jogo) {
        return sendReply(`⚠️ Nenhuma partida ativa. Digite *${PREFIX}qualmusica* para começar!`);
      }
      await sendReact("💡");
      const letras = jogo.resposta.length;
      const primeiraLetra = jogo.tituloOriginal.charAt(0);
      return sendReply(
        `💡 *PISTA EXTRA:*\n` +
        `• Artista/Banda: *${jogo.artista}*\n` +
        `• Começa com a letra: *${primeiraLetra}*\n` +
        `• Quantidade de letras: *${letras} letras*`
      );
    }

    // 4. Verificar se há jogo ativo
    const jogo = partidasMusica.get(remoteJid);
    if (!jogo) {
      return sendReply(
        `⚠️ Nenhum desafio de música rolando agora!\n\n` +
        `👉 Digite *${PREFIX}qualmusica* para iniciar um novo desafio com emojis!`
      );
    }

    jogo.tentativas += 1;

    // Normaliza palpite e resposta correta para não quebrar com acento ou espaço
    const palpiteNorm = normalizar(palpite);
    const respostaNorm = normalizar(jogo.resposta);

    if (palpiteNorm === respostaNorm || palpiteNorm.includes(respostaNorm) || respostaNorm.includes(palpiteNorm) && palpiteNorm.length >= 4) {
      partidasMusica.delete(remoteJid);
      await sendReact("🏆");
      return sendReply(
        `🎉🎉 *ACERTOU EM CHEIO, ${pushName || "Membro"}!* 🏆🎤\n\n` +
        `🎵 *Música:* *${jogo.tituloOriginal}*\n` +
        `👤 *Artista:* *${jogo.artista}*\n` +
        `🎭 *Emojis decifrados:* ${jogo.emojis}\n` +
        `🔢 *Total de chutes no grupo:* ${jogo.tentativas}\n\n` +
        `Mandou muito bem no ouvido musical! 👏🥂\n` +
        `Para jogar a próxima: *${PREFIX}qualmusica*`
      );
    } else {
      await sendReact("❌");
      return sendReply(
        `❌ *Errou!* "${palpite}" não é a música certa!\n\n` +
        `┌────────────────────────┐\n` +
        `   ${jogo.emojis}\n` +
        `└────────────────────────┘\n\n` +
        `💡 *Dica:* ${jogo.dica}\n` +
        `👉 Chute de novo: *${PREFIX}qualmusica [nome]*\n` +
        `🔍 Ou peça mais pista: *${PREFIX}qualmusica dica*`
      );
    }
  }
};
