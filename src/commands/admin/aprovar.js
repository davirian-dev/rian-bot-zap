import { OWNER_LID, PREFIX } from "../../config.js";
import { isAdmin } from "../../middlewares/index.js";
import { obterLeadPorTelefone, atualizarStatusLead } from "../../services/leadCaptor.js";
import { recordMessage } from "../../services/aiChatbot.js";
import { infoLog } from "../../utils/logger.js";

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
  description: "Aprova o membro (Casal, Solteira ou Pagante), salva no histórico/memória e envia mensagem oficial com instruções",
  commands: ["aprovar", "liberar", "aprovado", "liberado", "aprovador"],
  usage: `${PREFIX}aprovar @membro ou no PV direto`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, isReply, replyLid, userLid, remoteJid, socket, webMessage, sendReply, sendReact }) => {
    // 1. Verificação de Segurança: Apenas Davi & Mari ou Casalzaum podem aprovar
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
      await sendReply("⛔ *Acesso Restrito:* Apenas os administradores (Davi & Mari / Casalzaum) podem aprovar membros.");
      return;
    }

    await sendReact("👑");

    // Identifica o destinatário (no PV é o próprio remoteJid, em grupo é a pessoa marcada ou respondida)
    const isGroup = Boolean(remoteJid?.endsWith("@g.us"));
    let targetJid = remoteJid;
    if (isGroup) {
      targetJid = isReply ? replyLid : (args[0] && args[0].includes("@") ? args[0] : "");
    }

    const lead = obterLeadPorTelefone(targetJid) || obterLeadPorTelefone(remoteJid);
    const nomeLead = lead?.nome || "Membro";
    const argsStr = (args || []).join(" ").toLowerCase();

    // Determina se é Casal, Mulher Solteira ou Homem Solteiro Pagante
    const isCasal = 
      argsStr.includes("casal") || 
      lead?.perfil?.toLowerCase().includes("casal") ||
      (!argsStr.includes("solteiro") && !lead?.perfil?.toLowerCase().includes("homem"));

    const isMulher = !isCasal && (argsStr.includes("mulher") || lead?.perfil?.toLowerCase().includes("mulher"));
    const isPagante = !isCasal && !isMulher && (argsStr.includes("solteiro") || lead?.perfil?.toLowerCase().includes("homem"));

    const linkPortariaTelegram = "https://t.me/+1bPY_rOD7n85YjZh";
    const linkPortariaWhatsApp = "https://chat.whatsapp.com/CuqFrtYkz2B9KWlPhTcAcI";

    let mensagem = "";

    if (isCasal) {
      // Mensagem para Casal (100% Gratuito - Sem falar de pagamento!)
      mensagem = 
`👑 *VERIFICAÇÃO CONCLUÍDA & ACESSO LIBERADO!* 🎉

Parabéns, ${nomeLead}! A verificação de vocês como *Casal* foi aprovada com sucesso e agora vocês fazem parte oficialmente do círculo exclusivo do *Club Casalzaum*! 🥂✨

📲 *SEUS ACESSOS OFICIAIS:*
🚪 *Portaria de Entrada no WhatsApp:*
👉 ${linkPortariaWhatsApp}

✈️ *Portaria no Telegram VIP:*
👉 ${linkPortariaTelegram}

📌 *COMO FUNCIONA O ACESSO:*
O link acima é da nossa *Portaria de Espera* (grupo seguro de recepção). Assim que vocês entrarem lá, o Davi e a moderação colocam vocês MANUALMENTE nos grupos principais temáticos do Clube!

⚠️ *REGRAS DE CONVIVÊNCIA:*
• Sigilo absoluto e respeito mútuo.
• Proibido salvar, vazar fotos ou gravar tela.
• Proibido chamar membros no privado sem autorização mútua.

Sejam muito bem-vindos e curtam bastante! Qualquer dúvida, é só nos chamar por aqui. 😉🔥`;
    } else if (isMulher) {
      // Mensagem para Mulher Solteira (100% Gratuito)
      mensagem = 
`👑 *VERIFICAÇÃO CONCLUÍDA & ACESSO LIBERADO!* 🎉

Parabéns, ${nomeLead}! Sua verificação foi aprovada com sucesso e você já faz parte do *Club Casalzaum*! 🌸✨

📲 *SEUS ACESSOS OFICIAIS:*
🚪 *Portaria no WhatsApp:*
👉 ${linkPortariaWhatsApp}

✈️ *Portaria no Telegram VIP:*
👉 ${linkPortariaTelegram}

📌 *COMO FUNCIONA O ACESSO:*
Entre na Portaria de Espera acima! Lá a nossa moderação vai te direcionar manualmente para o grupo de Casadas & Solteiras e os demais grupos temáticos.

Aproveite com total respeito e privacidade! Abraços, Davi & Mari. 💕`;
    } else {
      // Mensagem para Homem Solteiro (Pagamento Confirmado)
      mensagem = 
`👑 *PAGAMENTO CONFIRMADO & ACESSO LIBERADO!* 🎉

Parabéns, ${nomeLead}! Seu pagamento foi autenticado com sucesso e agora você faz parte do círculo exclusivo do *Club Casalzaum*. 🔞✨

📲 *SEUS ACESSOS OFICIAIS:*
🚪 *Portaria Oficial no WhatsApp:*
👉 ${linkPortariaWhatsApp}

✈️ *Portaria Oficial no Telegram:*
👉 ${linkPortariaTelegram}

💎 *Painel & Plataforma Web:*
👉 https://clubcasalzaum.vercel.app/vip/

📌 *COMO FUNCIONA O ACESSO:*
Entre na nossa Portaria de Espera pelos links acima. Assim que entrar, a moderação vai direcionar você manualmente para os grupos liberados do seu passe!

⚠️ *REGRAS DE CONVIVÊNCIA:*
• Sigilo absoluto e respeito mútuo.
• Proibido salvar, vazar fotos ou gravar tela (o material possui rastreador).
• Proibido chamar membros no privado sem autorização prévia.

Qualquer dúvida, responda aqui diretamente aos administradores. Aproveite os conteúdos sem moderação! 😉🔥`;
    }

    // 2. Atualiza o banco de dados e marca o lead como APROVADO com link já enviado
    try {
      atualizarStatusLead(targetJid, "Acesso Liberado / Link Enviado", {
        linkEnviado: true,
        aprovadoManual: true,
        aprovadoEm: new Date().toISOString()
      });
      infoLog(`[Aprovar] Lead ${targetJid} marcado como Aprovado no banco.`);
    } catch (e) {
      infoLog(`[Aprovar] Aviso ao atualizar lead: ${e.message}`);
    }

    // 3. Registra na memória da IA que esse cliente foi aprovado e o link já foi entregue
    try {
      recordMessage(targetJid, "assistant", mensagem);
      recordMessage(targetJid, "system", "O usuário já foi aprovado e recebeu os links da Portaria. Se ele perguntar de novo, informe que o link já foi enviado acima e que agora é só aguardar que ele será colocado manualmente no grupo principal pelo Davi e moderação.");
    } catch (_) {}

    const mentions = isGroup && targetJid ? [targetJid] : [];
    await sendReply(mensagem, mentions);
  },
};
