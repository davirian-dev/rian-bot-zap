import { OWNER_LID, PREFIX } from "../../config.js";
import { isAdmin } from "../../middlewares/index.js";

// Lista de identificadores oficiais de Davi & Mari e Casalzaum
const ADMIN_IDS = [
  OWNER_LID,
  "160602467102822",
  "69128186527844",
  "5571936181632",
  "557181349593",
  "557199295905"
];

export default {
  name: "aprovar",
  description: "Aprova o membro pagante e envia mensagem oficial de liberação com os links oficiais",
  commands: ["aprovar", "liberar", "aprovado", "liberado"],
  usage: `${PREFIX}aprovar @membro ou respondendo à mensagem do comprovante`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, isReply, replyLid, userLid, remoteJid, socket, webMessage, sendReply, sendReact }) => {
    // 1. Verificação de Segurança Rigorosa: Apenas Davi & Mari ou Casalzaum podem aprovar
    const isFromMe = Boolean(webMessage?.key?.fromMe);
    const isMasterAdmin = Boolean(
      (userLid && ADMIN_IDS.some((id) => userLid.includes(id))) ||
      (remoteJid && ADMIN_IDS.some((id) => remoteJid.includes(id)))
    );

    let isAuthorized = isFromMe || isMasterAdmin;

    // Se estiver em grupo, permite também se for admin do grupo
    if (!isAuthorized && remoteJid?.endsWith("@g.us")) {
      try {
        isAuthorized = await isAdmin({ remoteJid, userLid, socket });
      } catch (_) {}
    }

    if (!isAuthorized) {
      await sendReact("⛔");
      await sendReply("⛔ *Acesso Restrito:* Apenas os administradores (Davi & Mari / Casalzaum) podem aprovar membros e liberar o link das Portarias.");
      return;
    }

    await sendReact("👑");

    const target = isReply ? replyLid : (args[0] && args[0].includes("@") ? args[0] : "");
    const targetMention = target ? (target.includes("@") ? `@${target.split("@")[0].replace("@", "")}` : `@${target}`) : "Membro VIP";
    const mentions = target ? [target.includes("@") ? target : `${target}@lid`] : [];

    const linkPortariaTelegram = "https://t.me/+1bPY_rOD7n85YjZh";
    const linkPortariaWhatsApp = "https://chat.whatsapp.com/CuqFrtYkz2B9KWlPhTcAcI";

    const mensagem = 
`👑 *PAGAMENTO CONFIRMADO & ACESSO LIBERADO!* 🎉

Parabéns, ${targetMention}! Seu pagamento foi autenticado com sucesso e agora você faz parte do círculo exclusivo do *Club Casalzaum*. 🔞✨

📲 *SEUS ACESSOS OFICIAIS:*
🚪 *Portaria Oficial no WhatsApp:*
👉 ${linkPortariaWhatsApp}

🚪 *Portaria Oficial no Telegram:*
👉 ${linkPortariaTelegram}

💎 *Painel & Plataforma Web:*
👉 https://clubcasalzaum.vercel.app/vip/

⚠️ *REGRAS DE CONVIVÊNCIA:*
• Sigilo absoluto e respeito mútuo.
• Proibido salvar, vazar fotos ou gravar tela (o material possui rastreador).
• Proibido chamar membros no privado sem autorização prévia.

Qualquer dúvida, responda aqui diretamente aos administradores. Aproveite os conteúdos sem moderação! 😉🔥`;

    await sendReply(mensagem, mentions);
  },
};
