import { PREFIX } from "../../config.js";

export default {
  name: "pack3",
  description: "Dados do Pix de R$ 29,90 para o Pack de 7 Vídeos Sem Censura + 6 Fotos Nudes",
  commands: ["pack", "pack7", "pack3", "pack30", "pix30", "pix29"],
  usage: `${PREFIX}pack`,

  handle: async ({ sendReply, sendReact }) => {
    await sendReact("📦");

    const chavePix = "munizmarina149@gmail.com";
    const titular = "Marina Muniz";

    const msg = 
`📦 *PACK 7 VÍDEOS + 6 FOTOS NUDES SEM CENSURA — CASALZAUM* 🔞

Mini-acervo exclusivo liberado direto no seu chat ou Telegram:
• 7 Vídeos curtos sem censura (oral, masturbação e penetração)
• 6 Fotos nudes explícitas de Davi & Mari

💰 *Valor:* R$ 29,90 no PIX (Taxa Única)
🔑 *Chave PIX (E-mail):* \`${chavePix}\`
👤 *Titular:* ${titular}
🔒 *Sigilo:* 100% Discreto na fatura ou extrato

👉 *Faça o Pix de R$ 29,90 e mande o comprovante aqui!* Liberamos o acervo na mesma hora! 🔥`;

    await sendReply(msg);
  }
};
