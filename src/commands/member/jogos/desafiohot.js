import { PREFIX } from "../../../config.js";

const DESAFIOS_QUENTES = [
  "Mande um áudio de 5 segundos imitando um gemido bem baixinho e sensual no grupo! 🔥",
  "Tire uma foto só da sua boca mordendo o lábio inferior e mande aqui!",
  "Revele o fetiche mais ousado que você tem e nunca realizou.",
  "Diga o nome de quem você achou mais charmoso(a) ou atraente aqui no grupo.",
  "Mande uma foto mostrando apenas a nuca ou ombro com olhar misterioso.",
  "Conte como foi a sua primeira experiência liberal ou quando despertou o interesse pelo meio.",
  "Grave um áudio dizendo no ouvido do grupo o que você faria se estivesse sozinho(a) com a pessoa que te atrai.",
  "Mande a música mais sexy da sua playlist que você gosta de ouvir na hora H."
];

export default {
  name: "desafiohot",
  description: "Desafio liberal e interativo para apimentar a conversa no grupo",
  commands: ["desafiohot", "desafio", "hotdesafio", "provocacao"],
  usage: `${PREFIX}desafiohot [@membro opcional]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, isReply, replyJid, mentions, pushName }) => {
    await sendReact("🔥");

    const desafio = DESAFIOS_QUENTES[Math.floor(Math.random() * DESAFIOS_QUENTES.length)];

    let alvo = "";
    if (mentions && mentions.length > 0) {
      alvo = `@${mentions[0].split("@")[0]}`;
    } else if (isReply && replyJid) {
      alvo = `@${replyJid.split("@")[0]}`;
    }

    if (alvo) {
      return sendReply(
        `🌶️ *DESAFIO LIBERAL LANÇADO!* 🔥\n\n` +
        `👤 *Desafiador(a):* ${pushName || "Alguém ousado"}\n` +
        `🎯 *Para cumprir:* ${alvo}\n\n` +
        `😈 *Seu desafio:*\n_"${desafio}"_\n\n` +
        `_E aí, vai encarar ou vai arregar?_ 😏🥂`
      );
    }

    return sendReply(
      `🌶️ *DESAFIO LIBERAL CASALZAUM* 🔥\n\n` +
      `😈 *Desafio da rodada:*\n_"${desafio}"_\n\n` +
      `_Quem tiver coragem de cumprir primeiro manda aqui no grupo!_\n` +
      `_Para desafiar alguém específico: ${PREFIX}desafiohot @usuario_`
    );
  }
};
