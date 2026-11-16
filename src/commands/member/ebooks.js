import { PREFIX } from "../../config.js";

export default {
  name: "ebooks",
  description: "Biblioteca de E-books e Manuais Oficiais do Club Casalzaum",
  commands: ["ebooks", "ebook", "livros", "livro", "conteudo", "manuais"],
  usage: `${PREFIX}ebooks`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("📚");

    const chavePix = "71936181632";

    const mensagem = 
`📚 *BIBLIOTECA OFICIAL • CLUB CASALZAUM* 🔞

Conteúdos práticos, didáticos e desenvolvidos para transformar sua experiência com total discrição e segurança:

1️⃣ *O GUIA DEFINITIVO DO CASAL LIBERAL*
• Do desejo ao 1º encontro sem crises, medos ou ciúmes.
• Limites de toque, regras claras e diferença entre Soft e Full Swap.
💰 *Valor:* R$ 37,00

2️⃣ *MANUAL DO HOMEM SOLTEIRO NO MEIO LIBERAL* ⭐ _(Mais Vendido)_
• Como ter postura, respeito e ser convidado por casais.
• A etiqueta de ouro do ménage e os 5 erros capitais que causam banimento.
💰 *Valor:* R$ 47,00

3️⃣ *ROTEIRO SECRETO: MOTÉIS & BALADAS NA BAHIA*
• As melhores suítes com hidro, discrição e segurança em Salvador e litoral.
• Dicas de eventos e cupons de desconto exclusivos.
💰 *Valor:* R$ 27,00

4️⃣ *VENDER CONTEÚDO DO ZERO (+18)* 🔥 _(Novo!)_
• O manual prático para criadoras e casais faturarem no Privacy, OnlyFans e Close Friends.
• Como vender sem mostrar o rosto, precificação de packs e blindagem de CPF/identidade.
💰 *Valor:* R$ 47,00

---
👑 *COMBO COMPLETO (4 E-BOOKS):* De ~R$ 158~ por apenas *R$ 77,00*!

🔒 *COMO ADQUIRIR VIA PIX:*
• Chave PIX (Telefone): \`${chavePix}\`
• Envie o comprovante aqui no chat com o nome do e-book escolhido para receber o link de download em PDF imediatamente!`;

    await sendReply(mensagem);
  },
};
