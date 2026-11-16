import { PREFIX } from "../../config.js";

export default {
  name: "planos",
  description: "Valores e chave PIX para entrada de homens solteiros",
  commands: ["planos", "pix", "solteiro", "taxa", "pagar"],
  usage: `${PREFIX}planos`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("💎");

    const chavePix = "71936181632"; // Chave PIX oficial

    const mensagem = 
`👑 *CLUB CASALZAUM - TAXA DE ENTRADA SOLTEIRO* 🔞

Para mantermos o equilíbrio de gênero, segurança e um ambiente com casais e mulheres reais, a entrada de homens solteiros exige taxa única de adesão (sem cobranças mensais automáticas):

💎 *1. Passe Semestral (6 Meses de Acesso):* R$ 97,00 à vista
💎 *2. Membro VIP Black (12 Meses de Acesso):* R$ 167,00 à vista

---
🔒 *DADOS PARA PAGAMENTO VIA PIX:*
• *Tipo de Chave:* Telefone
• *Chave PIX:* \`${chavePix}\`
• *Identificação na Fatura:* 100% Discreta (Sem menção a clube ou conteúdo adulto)

---
⚠️ *O QUE FAZER APÓS O PIX:*
1. Envie o *comprovante do PIX* aqui neste chat.
2. Envie uma *foto segurando um papel com a data de hoje* e o nome *Club Casalzaum* (regra anti-fake inegociável).

Assim que enviado, a administração aprovará seu perfil e liberará seu acesso imediato à Comunidade no WhatsApp (12 subgrupos) e ao canal de Prévias +18 no Telegram!`;

    await sendReply(mensagem);
  },
};
