import { PREFIX } from "../../config.js";

export default {
  name: "regras",
  description: "Exibe as regras do grupo Club Casalzaum",
  commands: ["regras", "rules", "regulamento"],
  usage: `${PREFIX}regras`,

  handle: async ({ sendReply, sendReact }) => {
    await sendReact("📋");

    const msg = 
`📋 *DIRETRIZES & REGRAS — CLUB CASALZAUM* 🔞

Para manter nosso grupo seguro, agradável e organizado para todos:

🚫 *1. PROIBIDO SPAM & LINKS:* Não poste links de outros grupos, produtos ou divulgação sem autorização.
🚫 *2. RESPEITO ABSOLUTO:* Sem ofensas, assédio ou desrespeito aos membros e ao casal.
🚫 *3. PROIBIDO INVASÃO DE PRIVADO:* Não chame membros no privado sem consentimento prévio.
✅ *4. PARTICIPAÇÃO:* Interaja, curta as prévias e divirta-se!

⚠️ *O descumprimento das regras resultará em banimento imediato sem aviso prévio.*

👑 Dúvidas ou suporte? Chame um dos administradores!`;

    await sendReply(msg);
  }
};
