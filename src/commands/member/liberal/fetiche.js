import { PREFIX } from "../../../config.js";

const fetiches = [
  "Dominar ou ser vendado(a) com toques lentos e gelo na pele.",
  "Sex tape caseiro para guardar de recordação a dois.",
  "Massagem tântrica com óleos essenciais e beijos pelo corpo todo.",
  "Roleplay (interpretar papéis de desconhecidos em um bar ou hotel).",
  "Dirty talk sussurrado no ouvido com instruções bem claras.",
  "Fantasias com lingerie ousada ou salto alto na hora H.",
  "Espelhos grandes ao redor da cama para assistir a tudo de camarote.",
  "Troca de fotos provocantes durante a rotina do dia para atiçar a noite.",
  "Fazer carícias em lugares discretos ou semi-públicos com risco de serem vistos.",
  "Sexo matinal bem demorado e sem pressa para acordar com energia."
];

export default {
  name: "fetiche",
  description: "Sorteia uma fantasia ou fetiche picante para esquentar o chat",
  commands: ["fetiche", "fantasia", "desejo"],
  usage: `${PREFIX}fetiche`,

  handle: async ({ sendReply, sendReact, userLid }) => {
    await sendReact("🎭");

    const userNum = userLid ? userLid.split("@")[0] : "membro";
    const fetiche = fetiches[Math.floor(Math.random() * fetiches.length)];

    const msg = 
`🎭 *ROLETA DOS FETICHES — CASALZAUM* 🔞

E aí @${userNum}, essa fantasia combina com você?

💭 *A fantasia sorteada é:*
👉 _"${fetiche}"_

*Diz aí no grupo:* Você topa, já fez ou passa a vez? 😈`;

    await sendReply(msg, userLid ? [userLid] : []);
  }
};
