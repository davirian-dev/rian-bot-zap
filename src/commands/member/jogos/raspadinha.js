import { PREFIX } from "../../../config.js";

const ITENS_RASPADINHA = [
  { item: "💎 1.000 Pontos VIP", peso: 5, bonus: 1000 },
  { item: "👑 500 Pontos de Reputação", peso: 15, bonus: 500 },
  { item: "🔥 200 Fichas de Cassino", peso: 30, bonus: 200 },
  { item: "🥂 1 Taça de Champagne Virtual", peso: 20, bonus: 50 },
  { item: "🎁 100 Fichas de Bônus", peso: 40, bonus: 100 },
  { item: "💣 Raspou e explodiu! Perdeu 50 fichas", peso: 20, bonus: -50 },
  { item: "💨 Não foi dessa vez! Tente novamente", peso: 35, bonus: 0 }
];

export default {
  name: "raspadinha",
  description: "Raspe a cartela digital da sorte e ganhe prêmios instantâneos",
  commands: ["raspadinha", "raspar", "loteria"],
  usage: `${PREFIX}raspadinha`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact, pushName }) => {
    await sendReact("🎟️");

    // Sorteia 3 posições
    const sortear = () => {
      const idx = Math.floor(Math.random() * ITENS_RASPADINHA.length);
      return ITENS_RASPADINHA[idx];
    };

    const c1 = sortear();
    const c2 = sortear();
    const c3 = sortear();

    const acertouTudo = (c1.item === c2.item && c2.item === c3.item);

    let resultado = "";
    if (acertouTudo) {
      resultado = `🎉🎉 *JACKPOT! TRÊS IGUAIS!* 🎉🎉\nVocê ganhou o prêmio máximo:\n🏆 *${c1.item}*! Parabéns, sorte pura! 🥂`;
    } else {
      resultado = `🍀 *Prêmio revelado na cartela:* ${c1.item}\n\n_Raspou a cartela e sentiu a adrenalina! Tente de novo quando quiser._`;
    }

    return sendReply(
      `🎰 *RASPADINHA DA SORTE* 🎟️\n` +
      `👤 *Apostador:* ${pushName || "Jogador"}\n\n` +
      `┌──────────────┐\n` +
      `│ [ 🔒 ] [ 🔒 ] [ 🔒 ] │ ➔ _Raspando..._\n` +
      `└──────────────┘\n\n` +
      `*CARTELA REVELADA:*\n` +
      `✨ [ ${c1.item.slice(0, 10)}... ]\n` +
      `✨ [ ${c2.item.slice(0, 10)}... ]\n` +
      `✨ [ ${c3.item.slice(0, 10)}... ]\n\n` +
      `${resultado}`
    );
  }
};
