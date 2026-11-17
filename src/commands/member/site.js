import { PREFIX } from "../../config.js";

export default {
  name: "site",
  description: "Links oficiais do Club Casalzaum e redes sociais",
  commands: ["site", "link", "links", "oficial", "portal"],
  usage: `${PREFIX}site`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🌐");

    const mensagem = 
`👑 *CLUB CASALZAUM • CANAIS & LINKS OFICIAIS* 🔞

Acesse nossos portais oficiais com segurança e certificado SSL:

🌐 *Site Oficial do Club:*
https://clubcasalzaum.vercel.app

📸 *Instagram Oficial do Club:*
https://www.instagram.com/clubcasalzaum
_(@clubcasalzaum - Novidades da comunidade)_

👩‍❤️‍👨 *Instagram Oficial dos Fundadores:*
https://www.instagram.com/casalzaumofc
_(@casalzaumofc - Lifestyle e bastidores)_

🔞 *Portaria Club Casal no Telegram (+18):*
https://t.me/+1bPY_rOD7n85YjZh

🎵 *TikTok Oficial:*
https://www.tiktok.com/@casalzauum

🔗 *Central Linktree:*
https://linktr.ee/casalzaumofc

---
🛡️ *Aviso de Segurança:* Nunca confie em contas secundárias ou pessoas cobrando valores em chave PIX diferente de *munizmarina149@gmail.com (Marina Muniz)*. Nosso ambiente é blindado e monitorado!`;

    await sendReply(mensagem);
  },
};
