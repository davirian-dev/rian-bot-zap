import { PREFIX } from "../../../config.js";

export default {
  name: "ngl",
  description: "Link para envio de confissões e perguntas anônimas para o Casalzaum",
  commands: ["ngl", "anonimo", "confissao", "perguntaanonima", "segredo"],
  usage: `${PREFIX}ngl`,

  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🤫");

    const msg = 
`🤫 *CAIXINHA DE CONFISSÕES ANÔNIMAS — CASALZAUM* 🔞

Tem alguma fantasia que você nunca contou pra ninguém? Uma dúvida íntima ou um recado secreto para Davi & Mari?

👉 *Envie sem ninguém saber quem você é pelo link abaixo:*
https://ngl.link/casalzaumofc2

🔒 *100% Anônimo & Seguro.* As melhores confissões nós respondemos em vídeo nas redes e no grupo! 😈✨`;

    await sendReply(msg);
  }
};
