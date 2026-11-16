/**
 * Comando: !vip ou !conteudo ou !privacy ou !cardapio
 * Cardápio Oficial de Vendas de Casalzaum OFC (Davi & Mari)
 */
import { PREFIX } from "../../config.js";

export default {
  name: "vip",
  description: "Cardápio de conteúdos íntimos e VIP do Casalzaum OFC (Davi & Mari)",
  commands: ["vip", "conteudo", "conteúdo", "privacy", "cardapio", "cardápio", "pack"],
  usage: `${PREFIX}vip`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🔥");

    const chavePix = "71936181632"; // Chave PIX oficial (Telefone)

    const mensagem = 
`😈🔥 *CARDÁPIO OFICIAL CASALZAUM OFC (DAVI & MARI)* 🔞

Quer ver a gente de verdade, sem cortes e com total sigilo? Escolha sua forma favorita de curtir hoje:

👑 *1. COMBO VIP TELEGRAM + COMUNIDADE* (O Mais Vendido!)
• Cenas longas e pesadas completas sem censura (anal profundo, gozada na cara e fetiches sem cortes).
• 🎁 *BÔNUS:* Entrada inclusa no Club Casalzaum (12 subgrupos no WhatsApp com casais e solteiras!).
• *Valor:* De ~R$ 97,00~ por *R$ 69,90 no PIX* (Pagamento único, sem mensalidade).

📸 *2. NOSSO PRIVACY VIP* (Assinatura Mensal)
• Dezenas de fotos e vídeos em alta resolução no feed oficial + chat direto com a gente.
• *Valor:* R$ 29,90/mês
👉 *Assine no Cartão ou Pix:* https://privacy.com.br/checkout/Casalzaumofc

📦 *3. PACK 3 VÍDEOS SEM CENSURA + FOTOS*
• Mini-acervo exclusivo enviado diretamente aqui no chat.
• *Valor:* *R$ 29,90 no PIX*

🎬 *4. DEGUSTAÇÃO RÁPIDA: 1 VÍDEO AVULSO*
• Quer só conhecer e comprovar a qualidade agora?
• *Valor:* *Apenas R$ 10,00 no PIX*

😈 *5. EXPERIÊNCIAS NO PRIVADO (Sob Encomenda)*
• *Sexting Hot (30 min):* R$ 49,90 (troca de mensagens quentes, fotos e áudios em tempo real)
• *Vídeo com o seu Nome:* R$ 97,00 (realizando seu fetiche com exclusividade)

🎁 *DEGUSTAÇÃO GRÁTIS:*
• Prévias no Telegram: https://t.me/+QY2sd5zWIZFmZDEx
• Privacy Grátis: https://privacy.com.br/checkout/casalzaumofcgratis
• Página VIP Completa: https://clubcasalzaum.vercel.app/vip/

---
🔒 *DADOS PARA PAGAMENTO VIA PIX:*
• *Tipo de Chave:* Telefone
• *Chave PIX:* \`${chavePix}\`
• *Identificação na Fatura:* 100% Discreta

👉 *Após fazer o PIX:* Envie o comprovante aqui no chat informando qual opção você escolheu para receber seu acesso na mesma hora! 😉`;

    await sendReply(mensagem);
  },
};
