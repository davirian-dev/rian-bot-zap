import { PREFIX } from "../../config.js";

export default {
  name: "aprovar",
  description: "Aprova o membro após triagem e envia os links oficiais de acesso",
  commands: ["aprovar", "liberar"],
  usage: `${PREFIX}aprovar`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🎉");

    const linkComunidade = "https://chat.whatsapp.com/SEU_LINK_DA_PORTARIA";
    const linkTelegram = "https://t.me/casalzaumofc";

    const mensagem = 
`🎉 *PARABÉNS! SEU ACESSO FOI APROVADO!* 👑

Você concluiu a triagem de segurança do *Club Casalzaum* com sucesso. Seja muito bem-vindo(a)!

🔗 *Link da Comunidade no WhatsApp:*
${linkComunidade}

🔥 *Link do Telegram (+18 & Prévias das Criadoras):*
${linkTelegram}

⚠️ *Lembrete Importante:* É estritamente proibido invadir o privado (PV) de qualquer participante sem permissão prévia no grupo. Divirta-se com responsabilidade!`;

    await sendReply(mensagem);
  },
};
