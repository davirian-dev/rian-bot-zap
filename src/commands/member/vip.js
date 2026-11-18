import { PREFIX } from "../../config.js";

export default {
  name: "vip",
  description: "Informações sobre o Grupo VIP Sem Censura do Casalzaum e Conteúdos",
  commands: ["vip", "acessovip", "privacy", "telegramvip", "telegram", "conteudos"],
  usage: `${PREFIX}vip`,

  handle: async ({ sendReply, sendReact }) => {
    await sendReact("👑");

    const msg = 
`👑 *CASALZAUM VIP — CATÁLOGO OFICIAL DE CONTEÚDOS* 🔞

Quer ver todos os conteúdos íntimos, vídeos completos em alta definição e cenas sem cortes de Davi & Mari?

💎 *OPÇÕES DISPONÍVEIS:*
1️⃣ *Vídeo Avulso (Degustação):* R$ 10,00 no Pix ➔ Digite \`/pix10\`
2️⃣ *Pack 7 Vídeos + 6 Fotos Nudes:* R$ 29,90 no Pix (Oral, masturbação e penetração) ➔ Digite \`/pack\`
3️⃣ *VIP Telegram Sem Censura (Acesso Vitalício):* De R$ 97 por R$ 69,90 no Pix (Vídeos longos, anal e cenas que você não encontra no Privacy) ➔ Digite \`/pix69\`
4️⃣ *Sexting Hot no WhatsApp (30 min):* R$ 49,90 no Pix
5️⃣ *Vídeo Sob Encomenda (com seu nome e fetiche):* R$ 97,00 no Pix

🚪 *Portaria Telegram Grátis:*
👉 https://t.me/+1bPY_rOD7n85YjZh

🔞 *Privacy Oficial:*
• Pago: https://privacy.com.br/checkout/Casalzaumofc
• Degustação Grátis: https://privacy.com.br/checkout/casalzaumofcgratis

🌐 *Vitrine VIP Completa:*
👉 https://casalzaumofcvip.vercel.app

💳 *Pagamentos:* Pix na chave \`munizmarina149@gmail.com\` ou cartão no Mercado Pago:
👉 https://link.mercadopago.com.br/casalzaumofc`;

    await sendReply(msg);
  }
};
