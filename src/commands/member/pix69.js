import { PREFIX } from "../../config.js";

export default {
  name: "pix69",
  description: "Dados do Pix de R$ 69,90 para o Combo VIP Telegram + Comunidade",
  commands: ["pix69", "vip69", "combo", "comboliberal"],
  usage: `${PREFIX}pix69`,

  handle: async ({ sendReply, sendReact }) => {
    await sendReact("👑");

    const chavePix = "71936181632";

    const msg = 
`👑 *COMBO VIP TELEGRAM + CLUB CASALZAUM* 🔞

Você escolheu nosso pacote completo mais vendido com o cofre mais pesado de Davi & Mari!

✨ *O QUE ESTÁ INCLUSO:*
• Acesso vitalício ao nosso grupo VIP no Telegram (cenas longas de anal profundo, gozadas e fetiches sem censura).
• Bônus: Entrada na nossa comunidade no WhatsApp (Club Casalzaum com 12 subgrupos).
• Sem mensalidade ou renovação automática.

💰 *Valor:* De ~R$ 97,00~ por *R$ 69,90 à vista no PIX*
🔑 *Chave PIX (Telefone):* \`${chavePix}\`
🔒 *Identificação:* 100% Discreta
💳 *Nome na Fatura:* LOJACZ (Total sigilo)

👉 *Após o PIX:* Envie o comprovante aqui para liberarmos seu link de entrada imediata! 🚀`;

    await sendReply(msg);
  }
};
