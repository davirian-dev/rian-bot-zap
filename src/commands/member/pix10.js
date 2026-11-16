import { PREFIX } from "../../config.js";

export default {
  name: "pix10",
  description: "Dados do Pix de R$ 10 para degustação de 1 vídeo avulso",
  commands: ["pix10", "video10", "degustacao", "amostra"],
  usage: `${PREFIX}pix10`,

  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🎬");

    const chavePix = "71936181632";

    const msg = 
`🎬 *DEGUSTAÇÃO RÁPIDA: 1 VÍDEO AVULSO DO CASALZAUM* 🔞

Para receber 1 vídeo exclusivo sem censura de Davi & Mari diretamente aqui no seu chat:

💰 *Valor:* R$ 10,00
🔑 *Chave PIX (Telefone):* \`${chavePix}\`
🔒 *Identificação:* 100% Discreta

👉 *Faça o Pix de R$ 10 e envie o comprovante aqui!* Assim que enviar, eu já libero o seu vídeo na hora! 😉`;

    await sendReply(msg);
  }
};
