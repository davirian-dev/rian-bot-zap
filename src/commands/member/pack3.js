import { PREFIX } from "../../config.js";

export default {
  name: "pack3",
  description: "Dados do Pix de R$ 29,90 para o Pack de 3 Vídeos Sem Censura + Fotos",
  commands: ["pack3", "pack30", "pack", "pix30", "pix29"],
  usage: `${PREFIX}pack3`,

  handle: async ({ sendReply, sendReact }) => {
    await sendReact("📦");

    const chavePix = "munizmarina149@gmail.com";
    const titular = "Marina Muniz";

    const msg = 
`📦 *PACK 3 VÍDEOS SEM CENSURA + FOTOS DO CASALZAUM* 🔞

Mini-acervo exclusivo enviado direto aqui no seu chat:
• 3 Vídeos quentes sem censura
• Fotos exclusivas dos bastidores

💰 *Valor:* R$ 29,90 no PIX (Taxa Única)
🔑 *Chave PIX (E-mail):* \`${chavePix}\`
👤 *Titular:* ${titular}
🔒 *Sigilo:* 100% Discreto na fatura (LOJACZ)

👉 *Faça o Pix de R$ 29,90 e mande o comprovante aqui!* Liberamos o acervo na mesma hora! 🔥`;

    await sendReply(msg);
  }
};
