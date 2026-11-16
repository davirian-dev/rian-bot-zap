import { PREFIX } from "../../config.js";

export default {
  name: "roteiro",
  description: "Roteiro e dicas de privacidade para encontros na Bahia",
  commands: ["roteiro", "motel", "motéis", "salvador", "bahia", "dicas"],
  usage: `${PREFIX}roteiro`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🏩");

    const mensagem = 
`🏩 *GUIA DE EXPERIÊNCIAS & PRIVACIDADE • SALVADOR/BAHIA* 🌊

Dicas essenciais selecionadas pela comunidade para encontros inesquecíveis e seguros:

🔒 *1. Regra Fundamental da Discrição:*
• Em motéis e locais públicos, preserve sempre a identidade de terceiros.
• Fotos e vídeos apenas com consentimento explícito prévio e sem identificação de rostos ou tatuagens marcantes.

📍 *2. Motéis Recomendados pela Comunidade:*
• *Orla & Pituba:* Suítes com hidro moderna e boa ventilação.
• *Lauro de Freitas & Estrada do Coco:* Espaços com piscina privativa, entrada discreta e total isolamento acústico.
• *Parceiros do Club:* Membros VIP têm acesso a cortesias e descontos no grupo de Promoções.

🥂 *3. O Primeiro Encontro Liberal:*
• Casais e solteiros novatos: comecem sempre por um drink ou café em local neutro (barzinho ou lounge) antes de ir para a suíte.
• Alinhem os limites ("o que pode e o que não pode") *antes* de qualquer bebida ou intimidade física.

📖 Para o guia completo com avaliações detalhadas, digite *${PREFIX}ebooks* e conheça o nosso *Roteiro Secreto da Bahia*!`;

    await sendReply(mensagem);
  },
};
