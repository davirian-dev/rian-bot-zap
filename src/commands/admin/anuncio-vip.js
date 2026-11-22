import { OWNER_LID, PREFIX } from "../../config.js";
import { isAdmin } from "../../middlewares/index.js";

const ADMIN_IDS = [
  OWNER_LID,
  "160602467102822",
  "69128186527844",
  "5571936181632",
  "557181349593",
  "557199295905",
];

export default {
  name: "anuncio-vip",
  description: "Dispara o comunicado oficial do Privacy / Club Casalzaum (Exclusivo Donos/Admins).",
  commands: ["anuncio-vip", "aviso-vip", "promo-vip", "comunicado-vip"],
  usage: `${PREFIX}anuncio-vip`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    userLid,
    remoteJid,
    socket,
    webMessage,
    sendReply,
    sendReact,
  }) => {
    const isFromMe = Boolean(webMessage?.key?.fromMe);
    const isMasterAdmin = Boolean(
      (userLid && ADMIN_IDS.some((id) => userLid.includes(id))) ||
      (remoteJid && ADMIN_IDS.some((id) => remoteJid.includes(id)))
    );

    let isAuthorized = isFromMe || isMasterAdmin;

    if (!isAuthorized && remoteJid?.endsWith("@g.us")) {
      try {
        isAuthorized = await isAdmin({ remoteJid, userLid, socket });
      } catch (_) {}
    }

    if (!isAuthorized) {
      await sendReact("⛔");
      await sendReply("⛔ *Acesso Restrito:* Apenas os administradores/donos podem disparar anúncios oficiais do Club Casalzaum.");
      return;
    }

    await sendReact("🔥");

    const msg =
`🔥 *CLUBE VIP CASALZAUM - CONTEÚDO SEM CENSURA* 🔞✨

Quer ver tudo o que rola nos nossos ensaios, viagens e bastidores reais sem tarja e sem cortes?

💎 *VANTAGENS EXCLUSIVAS DO VIP:*
• ✅ Acesso imediato a todos os vídeos em 4K e fotos explícitas
• ✅ Ensaios semanais com convidadas e novos fetiches
• ✅ Grupo secreto no WhatsApp para membros VIP
• ✅ Transparência e total discrição na fatura (*LOJACZ*)

🔗 *ASSINE AGORA:*
👉 https://privacy.com.br/checkout/clubecasazaum

_Atenção: Vagas limitadas para manter a interação e privacidade do grupo!_`;

    await sendReply(msg);
  },
};
