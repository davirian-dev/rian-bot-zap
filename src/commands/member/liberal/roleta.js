import { PREFIX } from "../../../config.js";

const prendas = [
  "Mandar um elogio sincero e provocativo para um administrador do grupo.",
  "Mandar um áudio imitando um gemido de brincadeira de 2 segundos.",
  "Contar qual a sua posição favorita na cama e por quê.",
  "Fazer um Pix de R$ 10 para o Casalzaum com /pix10 e receber um vídeo na hora!",
  "Mandar uma foto do seu copo, cerveja ou drink favorito agora.",
  "Fazer uma pergunta íntima para qualquer membro do grupo responder.",
  "Você teve sorte! Ganhou o direito de desafiar qualquer pessoa do grupo.",
  "Confessar qual é o seu maior ponto fraco quando o clima esquenta."
];

export default {
  name: "roleta",
  description: "Gira a roleta do Casalzaum com prendas e dinâmicas",
  commands: ["roleta", "girar", "sorteiohot"],
  usage: `${PREFIX}roleta`,

  handle: async ({ sendReply, sendReact, userLid }) => {
    await sendReact("🎰");

    const userNum = userLid ? userLid.split("@")[0] : "membro";
    const prenda = prendas[Math.floor(Math.random() * prendas.length)];

    const msg = 
`🎰 *ROLETA DO CASALZAUM GIROU!* 🔞

A roleta parou em você, @${userNum}! 

🎯 *Sua prenda/missão é:*
👉 _"${prenda}"_

*Tem 2 minutos para cumprir aqui no grupo ou vai pagar prenda em dobro!* 😈🔥`;

    await sendReply(msg, userLid ? [userLid] : []);
  }
};
