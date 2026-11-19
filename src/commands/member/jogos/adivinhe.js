import { PREFIX } from "../../../config.js";

// Armazena partidas de adivinhação: Map<remoteJid, { numero, tentativas, iniciadoPor }>
const partidas = new Map();

export default {
  name: "adivinhe",
  description: "Tente adivinhar o número secreto de 1 a 100 com dicas de maior/menor",
  commands: ["adivinhe", "adivinhar", "advine", "guess"],
  usage: `${PREFIX}adivinhe [seu palpite]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, remoteJid, pushName }) => {
    const palpiteStr = args[0]?.trim();

    // Se não informou número ou digitou 'novo'
    if (!palpiteStr || palpiteStr.toLowerCase() === "novo" || palpiteStr.toLowerCase() === "iniciar") {
      const numeroSecreto = Math.floor(Math.random() * 100) + 1;
      partidas.set(remoteJid, {
        numero: numeroSecreto,
        tentativas: 0,
        iniciadoPor: pushName || "Jogador"
      });
      await sendReact("🎯");
      return sendReply(
        `🎯 *JOGO DO ADIVINHE INICIADO!* 🎯\n\n` +
        `Pensei em um número secreto entre *1 e 100*!\n` +
        `Quem será o mais rápido em adivinhar?\n\n` +
        `👉 Mande seu palpite com: *${PREFIX}adivinhe [NÚMERO]*\n` +
        `Exemplo: *${PREFIX}adivinhe 50*`
      );
    }

    if (palpiteStr.toLowerCase() === "parar" || palpiteStr.toLowerCase() === "cancelar") {
      if (!partidas.has(remoteJid)) {
        return sendReply(`⚠️ Não há nenhum jogo de adivinhar em andamento no momento.`);
      }
      const p = partidas.get(remoteJid);
      partidas.delete(remoteJid);
      await sendReact("⏹️");
      return sendReply(`🏳️ Partida encerrada! O número secreto era: *${p.numero}*.`);
    }

    const jogo = partidas.get(remoteJid);
    if (!jogo) {
      return sendReply(
        `⚠️ Nenhuma partida ativa no momento!\n\n` +
        `👉 Digite *${PREFIX}adivinhe* para sortear um novo número!`
      );
    }

    const palpite = parseInt(palpiteStr);
    if (isNaN(palpite) || palpite < 1 || palpite > 100) {
      return sendReply(`⚠️ Por favor, chute um número válido entre 1 e 100!`);
    }

    jogo.tentativas += 1;

    if (palpite === jogo.numero) {
      partidas.delete(remoteJid);
      await sendReact("🏆");
      return sendReply(
        `🎉🎉 *NA MOSCA! VOCÊ ACERTOU!* 🏆✨\n\n` +
        `👤 *Vencedor:* ${pushName || "Jogador"}\n` +
        `🎯 *Número Secreto:* *${jogo.numero}*\n` +
        `🔢 *Total de Tentativas:* ${jogo.tentativas}\n\n` +
        `Parabéns pela intuição afiada! 👏\n` +
        `Para jogar de novo: *${PREFIX}adivinhe*`
      );
    } else if (palpite < jogo.numero) {
      await sendReact("⬆️");
      return sendReply(`📈 *MAIOR!* O número secreto é *MAIOR* que ${palpite}.\n_Tentativa #${jogo.tentativas}_`);
    } else {
      await sendReact("⬇️");
      return sendReply(`📉 *MENOR!* O número secreto é *MENOR* que ${palpite}.\n_Tentativa #${jogo.tentativas}_`);
    }
  }
};
