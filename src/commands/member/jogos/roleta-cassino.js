import { PREFIX } from "../../../config.js";

const CORES = ["vermelho", "preto"];
const MULTIPLICADORES = {
  vermelho: 2,
  preto: 2,
  verde: 14 // Zero / Verde paga 14x
};

export default {
  name: "roleta-cassino",
  description: "Aposte fichas na clássica Roleta (Vermelho, Preto ou Verde/Zero)",
  commands: ["roleta-cassino", "roletar", "apostar", "aposta"],
  usage: `${PREFIX}roleta-cassino [vermelho/preto/verde] [fichas]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, pushName }) => {
    const escolha = args[0]?.toLowerCase()?.trim();
    const fichas = parseInt(args[1]) || 50;

    if (!escolha || !["vermelho", "preto", "verde"].includes(escolha)) {
      return sendReply(
        `🎡 *ROLETA DE CASSINO CASALZAUM* 🎲\n\n` +
        `Como apostar:\n` +
        `👉 *${PREFIX}roleta-cassino vermelho 50* (Paga 2x)\n` +
        `👉 *${PREFIX}roleta-cassino preto 50* (Paga 2x)\n` +
        `👉 *${PREFIX}roleta-cassino verde 50* (Número 0 - Paga incríveis 14x!)\n\n` +
        `_Escolha sua cor da sorte e boa sorte!_`
      );
    }

    await sendReact("🎡");

    // Sorteio: 0 a 36 (0 é verde; 1-18 vermelho; 19-36 preto)
    const numeroSorteado = Math.floor(Math.random() * 37);
    let corSorteada = "";

    if (numeroSorteado === 0) {
      corSorteada = "verde";
    } else if (numeroSorteado % 2 === 0) {
      corSorteada = "preto";
    } else {
      corSorteada = "vermelho";
    }

    const emojiCor = {
      vermelho: "🔴 Vermelho",
      preto: "⚫ Preto",
      verde: "🟢 Verde (Zero!)"
    };

    if (escolha === corSorteada) {
      const ganho = fichas * MULTIPLICADORES[escolha];
      await sendReact("🏆");
      return sendReply(
        `🎉🎉 *A ROLETA PAROU NA SUA COR!* 🏆✨\n\n` +
        `👤 *Apostador:* ${pushName || "Jogador"}\n` +
        `🎡 *Resultado:* ${emojiCor[corSorteada]} (Número ${numeroSorteado})\n` +
        `💰 *Prêmio Faturado:* *${ganho} fichas virtuais*! (${MULTIPLICADORES[escolha]}x)\n\n` +
        `Parabéns, a sorte sorriu pra você hoje! 🥂`
      );
    } else {
      await sendReact("💨");
      return sendReply(
        `💨 *NÃO FOI DESSA VEZ!* 🎡\n\n` +
        `👤 *Apostador:* ${pushName || "Jogador"}\n` +
        `🎯 *Sua aposta:* ${emojiCor[escolha]}\n` +
        `🎡 *Resultado da Mesa:* ${emojiCor[corSorteada]} (Número ${numeroSorteado})\n\n` +
        `Você perdeu ${fichas} fichas. Gire novamente quando quiser!`
      );
    }
  }
};
