import { PREFIX } from "../../config.js";

export default {
  name: "acervo",
  description: "Acesso ao Mega Acervo Digital VIP (+68 categorias de cursos, IA, games e softwares)",
  commands: ["acervo", "megaacervo", "cursos", "vault", "drive", "ferramentas", "packs"],
  usage: `${PREFIX}acervo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("👑");

    const chavePix = "71936181632";

    const mensagem = 
`👑 *MEGA ACERVO DIGITAL VIP • O MAIOR COFRE DO TELEGRAM* 🚀
Organizado em mais de 68 categorias com tópicos e modo Fórum ativo!

Aqui você encontra tudo o que precisa sem precisar pagar cursos caros de R$ 97 ou R$ 297:

📂 *O QUE VOCÊ ENCONTRA DENTRO DO ACERVO:*
🤖 *Inteligência Artificial:* Mais de 140 cursos de IA, Prompts, Automações e GPTs.
💻 *Dev & Tecnologia:* Programação Web, APIs, Bots de WhatsApp/Telegram, SaaS e Scripts.
🎮 *Gamer & PC:* Jogos completos para PC, Emuladores, APKs modificados e Tutoriais.
📈 *Marketing & Negócios:* Tráfego Pago, Dropshipping, Afiliados, Finanças e Milhas.
🎬 *Audiovisual & Design:* Edição de vídeo (Premiere, CapCut, After), Canva Pro e Packs Virais.
🍿 *Entretenimento:* Filmes, Séries, Streaming, Mangás e Cursos Diversificados.

---
💰 *VALOR SIMBÓLICO DE ACESSO:*
• De ~R$ 97,00~ por apenas *R$ 19,90 à vista no PIX* (Taxa única vitalícia!)

🔒 *DADOS PARA PAGAMENTO VIA PIX:*
• *Tipo de Chave:* Telefone
• *Chave PIX:* \`${chavePix}\`
• *Nome do Titular:* Davi / Marina

---
⚡ *COMO LIBERAR SEU ACESSO:*
1. Faça o PIX de *R$ 19,90* na chave acima.
2. Envie o *comprovante* aqui neste chat.
3. Assim que confirmado, você recebe na hora o *link de convite VIP* para o Supergrupo no Telegram com todas as 68 pastas liberadas!`;

    await sendReply(mensagem);
  },
};
