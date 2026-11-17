import { PREFIX } from "../../config.js";

export default {
  name: "aprovar",
  description: "Aprova o membro pagante e envia mensagem oficial de liberação com os links oficiais",
  commands: ["aprovar", "liberar", "aprovado", "liberado"],
  usage: `${PREFIX}aprovar @membro ou respondendo à mensagem do comprovante`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, isReply, replyLid, userLid, sendReply, sendReact }) => {
    await sendReact("👑");

    const target = isReply ? replyLid : (args[0] && args[0].includes("@") ? args[0] : "");
    const targetMention = target ? (target.includes("@") ? `@${target.split("@")[0].replace("@", "")}` : `@${target}`) : "Membro VIP";
    const mentions = target ? [target.includes("@") ? target : `${target}@lid`] : [];

    const linkPortariaTelegram = "https://t.me/+1bPY_rOD7n85YjZh";

    const mensagem = 
`👑 *PAGAMENTO CONFIRMADO & ACESSO LIBERADO!* 🎉

Parabéns, ${targetMention}! Seu pagamento foi autenticado com sucesso e agora você faz parte do círculo exclusivo do *Club Casalzaum*. 🔞✨

📲 *SEUS ACESSOS OFICIAIS:*
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
