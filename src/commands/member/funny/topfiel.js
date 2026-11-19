import { PREFIX } from "../../../config.js";

export default {
  name: "topfiel",
  description: "Mede o nível de fidelidade seu ou de alguém marcado no grupo",
  commands: ["topfiel", "fiel", "fidelidade", "golpista"],
  usage: `${PREFIX}topfiel [@menção opcional]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, isReply, replyJid, mentions, pushName }) => {
    await sendReact("🔍");

    let alvoNome = pushName || "Você";
    if (mentions && mentions.length > 0) {
      alvoNome = `@${mentions[0].split("@")[0]}`;
    } else if (isReply && replyJid) {
      alvoNome = `@${replyJid.split("@")[0]}`;
    }

    const porcentagem = Math.floor(Math.random() * 101);

    let veredicto = "";
    let medalha = "";

    if (porcentagem >= 90) {
      medalha = "😇 💎";
      veredicto = "Fiel raiz! Exemplo de lealdade e compromisso, pode confiar de olhos vendados!";
    } else if (porcentagem >= 70) {
      medalha = "🥰 ✨";
      veredicto = "Muito confiável! Só dá uma olhadinha de canto quando o crush passa, mas o coração é de um só.";
    } else if (porcentagem >= 45) {
      medalha = "🧐 ⚖️";
      veredicto = "Neutro! Fiel até a segunda taça de vinho ou até alguém interessante mandar um 'oi sumido(a)'.";
    } else if (porcentagem >= 20) {
      medalha = "👀 🔥";
      veredicto = "Alerta amarelo! O perigo anda de mãos dadas com a tentação. Cuidado com o Direct!";
    } else {
      medalha = "😈 🚨";
      veredicto = "Golpista profissional! O FBI já tá monitorando as conversas no modo temporário! Corre que é laço!";
    }

    return sendReply(
      `📊 *TERMÔMETRO DA FIDELIDADE* ${medalha}\n\n` +
      `👤 *Avaliado:* ${alvoNome}\n` +
      `📈 *Nível de Fidelidade:* *${porcentagem}%*\n\n` +
      `📝 *Diagnóstico:*\n_${veredicto}_`
    );
  }
};
