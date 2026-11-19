import { PREFIX } from "../../../config.js";

const TABULEIROS_INICIAIS = [
  "1️⃣ | 2️⃣ | 3️⃣\n───┼───┼───\n4️⃣ | 5️⃣ | 6️⃣\n───┼───┼───\n7️⃣ | 8️⃣ | 9️⃣"
];

// Estado dos jogos da velha: Map<remoteJid, { tabuleiro, jogadorX, jogadorO, vezDe, ativo }>
const partidasVelha = new Map();

const NUM_TO_EMOJI = {
  1: "1️⃣", 2: "2️⃣", 3: "3️⃣",
  4: "4️⃣", 5: "5️⃣", 6: "6️⃣",
  7: "7️⃣", 8: "8️⃣", 9: "9️⃣"
};

function renderizarTabuleiro(grid) {
  const c = grid.map(v => (v === "X" ? "❌" : v === "O" ? "⭕" : NUM_TO_EMOJI[v]));
  return `${c[0]} | ${c[1]} | ${c[2]}\n───┼───┼───\n${c[3]} | ${c[4]} | ${c[5]}\n───┼───┼───\n${c[6]} | ${c[7]} | ${c[8]}`;
}

function checarVitoria(g) {
  const linhas = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontais
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // verticais
    [0, 4, 8], [2, 4, 6]             // diagonais
  ];
  for (const [a, b, c] of linhas) {
    if (g[a] === g[b] && g[b] === g[c]) {
      return g[a];
    }
  }
  if (g.every(celula => celula === "X" || celula === "O")) {
    return "EMPATE";
  }
  return null;
}

export default {
  name: "jogodavelha",
  description: "Jogo da Velha para 2 membros jogarem no grupo ou contra o bot",
  commands: ["jogodavelha", "velha", "tictactoe"],
  usage: `${PREFIX}velha [iniciar / posição 1-9 / parar]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, remoteJid, pushName, userJid, mentions, isReply, replyJid }) => {
    const sub = args[0]?.toLowerCase()?.trim();

    // 1. Iniciar nova partida
    if (!sub || sub === "iniciar" || sub === "novo" || sub === "start") {
      let oponenteJid = "BOT";
      let oponenteNome = "Robô DR";

      if (mentions && mentions.length > 0) {
        oponenteJid = mentions[0];
        oponenteNome = `@${mentions[0].split("@")[0]}`;
      } else if (isReply && replyJid) {
        oponenteJid = replyJid;
        oponenteNome = `@${replyJid.split("@")[0]}`;
      }

      const novaPartida = {
        grid: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        jogadorX: { jid: userJid, nome: pushName || "Jogador 1" },
        jogadorO: { jid: oponenteJid, nome: oponenteNome },
        vezDe: "X",
        contraBot: oponenteJid === "BOT"
      };

      partidasVelha.set(remoteJid, novaPartida);
      await sendReact("⚔️");

      return sendReply(
        `❌ *JOGO DA VELHA INICIADO!* ⭕\n\n` +
        `❌ *Jogador 1 (X):* ${novaPartida.jogadorX.nome}\n` +
        `⭕ *Jogador 2 (O):* ${novaPartida.jogadorO.nome}\n\n` +
        `${renderizarTabuleiro(novaPartida.grid)}\n\n` +
        `👉 Vez de *${novaPartida.jogadorX.nome} (❌)* jogar!\n` +
        `Digite: *${PREFIX}velha [1 a 9]* para marcar sua posição.`
      );
    }

    // 2. Parar partida
    if (sub === "parar" || sub === "cancelar") {
      if (!partidasVelha.has(remoteJid)) {
        return sendReply(`⚠️ Não há nenhum jogo da velha em andamento aqui.`);
      }
      partidasVelha.delete(remoteJid);
      await sendReact("⏹️");
      return sendReply(`🏳️ Partida de Jogo da Velha cancelada!`);
    }

    const jogo = partidasVelha.get(remoteJid);
    if (!jogo) {
      return sendReply(
        `⚠️ Nenhuma partida ativa no momento!\n\n` +
        `👉 Digite *${PREFIX}velha* para jogar contra o bot ou *${PREFIX}velha @amigo* para desafiar alguém!`
      );
    }

    // 3. Fazer jogada
    const pos = parseInt(sub);
    if (isNaN(pos) || pos < 1 || pos > 9) {
      return sendReply(`⚠️ Escolha uma posição livre de 1 a 9! Exemplo: *${PREFIX}velha 5*`);
    }

    const idx = pos - 1;
    if (jogo.grid[idx] === "X" || jogo.grid[idx] === "O") {
      return sendReply(`⚠️ Essa posição já está ocupada! Escolha outro número.`);
    }

    // Valida quem está jogando
    const ehVezDoX = jogo.vezDe === "X";
    const jAtual = ehVezDoX ? jogo.jogadorX : jogo.jogadorO;

    // Se for contra jogador real, verifica se é o usuário correto
    if (!jogo.contraBot && userJid !== jAtual.jid) {
      return sendReply(`⏳ Espere a sua vez! Agora é a vez de ${jAtual.nome} jogar.`);
    }

    // Marca a posição
    jogo.grid[idx] = jogo.vezDe;

    // Checa vitória do jogador
    let vencedor = checarVitoria(jogo.grid);
    if (vencedor) {
      partidasVelha.delete(remoteJid);
      await sendReact("🏆");
      if (vencedor === "EMPATE") {
        return sendReply(
          `🤝 *DEU VELHA! (EMPATE)* 🤝\n\n` +
          `${renderizarTabuleiro(jogo.grid)}\n\n` +
          `Ninguém venceu dessa vez! Para revanche: *${PREFIX}velha*`
        );
      }
      const ganhadorNome = vencedor === "X" ? jogo.jogadorX.nome : jogo.jogadorO.nome;
      return sendReply(
        `🎉🎉 *TEMOS UM VENCEDOR!* 🏆✨\n\n` +
        `👑 *Vencedor:* ${ganhadorNome} (${vencedor === "X" ? "❌" : "⭕"})\n\n` +
        `${renderizarTabuleiro(jogo.grid)}\n\n` +
        `Mandou muito bem! Para jogar de novo: *${PREFIX}velha*`
      );
    }

    // Alterna vez ou jogada do Bot
    if (jogo.contraBot) {
      // O bot joga com "O"
      const posicoesLivres = jogo.grid
        .map((val, i) => (val !== "X" && val !== "O" ? i : null))
        .filter(v => v !== null);

      if (posicoesLivres.length > 0) {
        // Escolhe posição central (4) se livre, ou aleatória
        const botIdx = posicoesLivres.includes(4) ? 4 : posicoesLivres[Math.floor(Math.random() * posicoesLivres.length)];
        jogo.grid[botIdx] = "O";

        vencedor = checarVitoria(jogo.grid);
        if (vencedor) {
          partidasVelha.delete(remoteJid);
          if (vencedor === "EMPATE") {
            return sendReply(
              `🤝 *DEU VELHA! (EMPATE)* 🤝\n\n` +
              `${renderizarTabuleiro(jogo.grid)}\n\n` +
              `O jogo terminou empatado! Revanche: *${PREFIX}velha*`
            );
          }
          await sendReact("🤖");
          return sendReply(
            `🤖 *O ROBÔ DR VENCEU!* 💻\n\n` +
            `${renderizarTabuleiro(jogo.grid)}\n\n` +
            `Tente mais uma vez digitando: *${PREFIX}velha*`
          );
        }
      }
      return sendReply(
        `🎮 *JOGO DA VELHA* 🎮\n\n` +
        `${renderizarTabuleiro(jogo.grid)}\n\n` +
        `👉 Sua vez, ${jogo.jogadorX.nome}! Digite: *${PREFIX}velha [1 a 9]*`
      );
    } else {
      // Passa a vez pro outro jogador
      jogo.vezDe = ehVezDoX ? "O" : "X";
      const proximo = jogo.vezDe === "X" ? jogo.jogadorX : jogo.jogadorO;
      return sendReply(
        `🎮 *JOGO DA VELHA* 🎮\n\n` +
        `${renderizarTabuleiro(jogo.grid)}\n\n` +
        `👉 Vez de *${proximo.nome} (${jogo.vezDe === "X" ? "❌" : "⭕"})* jogar!\n` +
        `Digite: *${PREFIX}velha [1 a 9]*`
      );
    }
  }
};
