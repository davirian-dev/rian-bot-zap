import { PREFIX } from "../../../config.js";

const OPCOES = ["pedra", "papel", "tesoura"];
const EMOJIS = {
  pedra: "🪨",
  papel: "📄",
  tesoura: "✂️"
};

export default {
  name: "ppt",
  description: "Jogue Pedra, Papel ou Tesoura contra o bot ou teste a sorte",
  commands: ["ppt", "jokenpo", "pedrapapeltesoura"],
  usage: `${PREFIX}ppt [pedra/papel/tesoura]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, pushName }) => {
    const escolhaUsuario = args[0]?.toLowerCase()?.trim();

    if (!escolhaUsuario || !OPCOES.includes(escolhaUsuario)) {
      return sendReply(
        `✂️ *PEDRA, PAPEL OU TESOURA* 📄🪨\n\n` +
        `Para jogar, escolha uma opção:\n` +
        `👉 *${PREFIX}ppt pedra*\n` +
        `👉 *${PREFIX}ppt papel*\n` +
        `👉 *${PREFIX}ppt tesoura*`
      );
    }

    const escolhaBot = OPCOES[Math.floor(Math.random() * OPCOES.length)];

    let resultado = "";
    if (escolhaUsuario === escolhaBot) {
      await sendReact("🤝");
      resultado = "⚖️ *EMPATE!* Nós dois pensamos na mesma jogada!";
    } else if (
      (escolhaUsuario === "pedra" && escolhaBot === "tesoura") ||
      (escolhaUsuario === "papel" && escolhaBot === "pedra") ||
      (escolhaUsuario === "tesoura" && escolhaBot === "papel")
    ) {
      await sendReact("🏆");
      resultado = `🎉 *VOCÊ VENCEU, ${pushName || "Membro"}!* Mandou muito bem! 👏`;
    } else {
      await sendReact("🤖");
      resultado = `🤖 *EU VENCI!* A inteligência do bot levou essa rodada! 😎`;
    }

    return sendReply(
      `🎮 *RODADA DE JOKENPÔ* 🎮\n\n` +
      `👤 *Você:* ${EMOJIS[escolhaUsuario]} ${escolhaUsuario.toUpperCase()}\n` +
      `🤖 *Bot:* ${EMOJIS[escolhaBot]} ${escolhaBot.toUpperCase()}\n\n` +
      `${resultado}`
    );
  }
};
