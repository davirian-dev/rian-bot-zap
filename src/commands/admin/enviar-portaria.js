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
  name: "enviar-portaria",
  description: "Envia o link da Portaria (Grupo de Espera) para o cliente após receber o comprovante com a instrução de foto anti-fake",
  commands: ["portaria", "enviar-portaria", "espera", "comprovante-ok"],
  usage: `${PREFIX}portaria (ou respondendo à mensagem do cliente)`,

  handle: async ({ args, isReply, replyLid, userLid, remoteJid, socket, webMessage, sendReply, sendReact }) => {
    // 1. Verificação de Segurança Rigorosa: Apenas Davi & Mari ou Casalzaum podem enviar o link da portaria
    const isFromMe = Boolean(webMessage?.key?.fromMe);
    const isMasterAdmin = Boolean(
      (userLid && ADMIN_IDS.some((id) => userLid.includes(id))) ||
      (remoteJid && ADMIN_IDS.some((id) => remoteJid.includes(id)))
    );

    let isAuthorized = isFromMe || isMasterAdmin;

    // Se estiver em grupo, permite se for admin do grupo
    if (!isAuthorized && remoteJid?.endsWith("@g.us")) {
      try {
        isAuthorized = await isAdmin({ remoteJid, userLid, socket });
      } catch (_) {}
    }

    if (!isAuthorized) {
      await sendReact("⛔");
      await sendReply("⛔ *Acesso Restrito:* Apenas os administradores (Davi & Mari / Casalzaum) podem enviar o link oficial da Portaria.");
      return;
    }

    await sendReact("🔑");

    const linkPortaria = "https://chat.whatsapp.com/CuqFrtYkz2B9KWlPhTcAcI";
    const target = isReply ? replyLid : (args[0] && args[0].includes("@") ? args[0] : "");
    const targetMention = target ? (target.includes("@") ? `@${target.split("@")[0].replace("@", "")}` : `@${target}`) : "Membro";
    const mentions = target ? [target.includes("@") ? target : `${target}@lid`] : [];

    const msg = 
`✅ *COMPROVANTE RECEBIDO COM SUCESSO!* 🔞✨

Perfeito, ${targetMention}! Identificamos o seu comprovante.

Agora o seu próximo passo é entrar na nossa **Portaria Oficial (Grupo de Espera)**:
👉 ${linkPortaria}

📸 *VERIFICAÇÃO DE SEGURANÇA (OBRIGATÓRIA):*
Para mantermos o grupo principal 100% blindado contra perfis falsos e fakes:
• Ao entrar na Portaria, envie uma foto simples **fazendo o gesto de legal (👍)** OU segurando uma **plaquinha/papel com a data de hoje**.
• *Importante:* Essa foto serve estritamente para a moderação aprovar você. Ninguém além dos administradores terá acesso!

⚠️ *COMO FUNCIONA O ACESSO:*
1. Este é o nosso **Grupo de Espera** onde a moderação faz a recepção segura.
2. Assim que conferirmos sua foto anti-fake, liberamos o convite direto para o **Grupo Principal do Club Casalzaum**.
3. Na fatura do seu cartão ou extrato bancário, a cobrança constará de forma 100% discreta como *LOJACZ*.

Te esperamos lá dentro da Portaria para liberar seu acesso VIP! 😉🔥`;

    await sendReply(msg, mentions);
  }
};
