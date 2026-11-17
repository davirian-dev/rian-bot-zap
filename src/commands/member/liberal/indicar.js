import { PREFIX } from "../../../config.js";

export default {
  name: "indicar",
  description: "Programa de indicação: compartilhe e ganhe vídeos exclusivos do Casalzaum",
  commands: ["indicar", "indicacao", "compartilhar", "amigo"],
  usage: `${PREFIX}indicar`,

  handle: async ({ sendReply, sendReact, userLid }) => {
    await sendReact("🎁");

    const userNum = userLid ? userLid.split("@")[0] : "membro";

    const msg = 
`🎁 *PROGRAMA DE INDICAÇÃO — CLUB CASALZAUM* 🔥

E aí @${userNum}! Quer ganhar um **vídeo exclusivo e inédito de Davi & Mari** sem pagar nada a mais?

📲 *COMO PARTICIPAR:*
1. Copie o texto de divulgação abaixo com nosso link oficial de prévias gratuitas.
2. Compartilhe com amigos, contatos ou grupos liberais.
3. Cada amigo que entrar no canal grátis ou assinar o VIP através de você te dá pontos!

👉 *TEXTO PRONTO PARA VOCÊ COPIAR E ENVIAR:*
━━━━━━━━━━━━━━━━━━━━
🔥 *VOCÊ PRECISA CONHECER O CLUB CASALZAUM!* 😈
As melhores prévias e bastidores quentes de Davi & Mari sem enrolação!
Acesse a portaria oficial do Telegram agora:
👉 https://t.me/+1bPY_rOD7n85YjZh
━━━━━━━━━━━━━━━━━━━━

📸 *Para resgatar sua recompensa:*
Tire um print de onde divulgou ou peça pro seu amigo falar que veio por você, e envie para os administradores. Liberamos seu bônus na hora! 😉✨`;

    await sendReply(msg, userLid ? [userLid] : []);
  }
};
