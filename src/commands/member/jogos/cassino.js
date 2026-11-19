import { PREFIX } from "../../../config.js";

const SIMBOLOS = ["🍒", "🍋", "🍇", "🔔", "⭐", "💎", "7️⃣"];

export default {
  name: "cassino",
  description: "Aposte no caça-níqueis do Cassino e veja se a sorte está do seu lado",
  commands: ["cassino", "roleta-cassino", "slot", "slots", "cacaniqueis"],
  usage: `${PREFIX}cassino [valor da aposta opcional]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, pushName }) => {
    await sendReact("🎰");

    const aposta = parseInt(args[0]) || 50;

    const r1 = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
    const r2 = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
    const r3 = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];

    let resultado = "";
    let multiplicador = 0;

    if (r1 === r2 && r2 === r3) {
      if (r1 === "7️⃣" || r1 === "💎") {
        multiplicador = 10;
        resultado = `👑 *JACKPOT LENDÁRIO! (${multiplicador}x)* 💎\nVocê faturou incríveis *${aposta * multiplicador} fichas*!`;
      } else {
        multiplicador = 5;
        resultado = `🎉 *GRANDE VITÓRIA! (${multiplicador}x)* 🥂\nVocê faturou *${aposta * multiplicador} fichas*!`;
      }
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      multiplicador = 2;
      resultado = `✨ *PAR DUPLO! (${multiplicador}x)*\nVocê recuperou e lucrou *${aposta * multiplicador} fichas*!`;
    } else {
      resultado = `💨 *A casa venceu desta vez!*\nVocê perdeu ${aposta} fichas. Tente novamente!`;
    }

    return sendReply(
      `🎰 *CASSINO ROYALE* 🎰\n` +
      `👤 *Apostador:* ${pushName || "Jogador"}\n` +
      `💰 *Aposta:* ${aposta} fichas\n\n` +
      `╔═════════════╗\n` +
      `║  [ ${r1} | ${r2} | ${r3} ]  ║\n` +
      `╚═════════════╝\n\n` +
      `${resultado}`
    );
  }
};
