import { PREFIX } from "../../../config.js";

const DRINKS = [
  {
    nome: "Margarita Picante com Pimenta Jalapeño",
    ingredientes: "Tequila prata, suco de limão fresco, licor Cointreau, xarope de agave e fatias de pimenta.",
    modo: "Bata tudo na coqueteleira com bastante gelo e sirva na taça com a borda de sal picante.",
    efeito: "Acende o fogo imediatamente e esquenta a conversa. Perfeito para quebrar o gelo!"
  },
  {
    nome: "Gin Tropical Afrodite",
    ingredientes: "Gin artesanal, Red Bull Tropical, fatias de laranja Bahia, ramo de alecrim e zimbro.",
    modo: "Monte direto na taça com bastante gelo cristalino, mexa suavemente com a colher bailarina.",
    efeito: "Refrescante, aromático e com efeito estimulante para uma noite que promete ir longe."
  },
  {
    nome: "Sex on the Beach Casalzaum",
    ingredientes: "Vodka premium, licor de pêssego, suco de laranja e xarope de cranberry.",
    modo: "Adicione os ingredientes em camadas com gelo para criar o degradê sensual vermelho e laranja.",
    efeito: "Doce, sedutor e clássico. O preferido das noites liberais descontraídas."
  },
  {
    nome: "Caipirinha Gourmet de Frutas Vermelhas com Cachaça Envelhecida",
    ingredientes: "Morangos frescos, amoras, framboesas, açúcar demerara e cachaça nobre amadeirada.",
    modo: "Massafe suavemente as frutas com o açúcar no copo, complete com gelo moído e adicione a dose.",
    efeito: "Sabor marcante e afrodisíaco. Impossível tomar só uma taça!"
  },
  {
    nome: "Moscow Mule da Paixão",
    ingredientes: "Vodka, suco de limão taiti, xarope de gengibre caseiro, água com gás e espuma de gengibre.",
    modo: "Sirva na tradicional caneca de cobre bem gelada com a espuma fofa por cima e raspas de limão.",
    efeito: "Refrescância com a picância do gengibre, excelente termogênico natural."
  }
];

export default {
  name: "drink",
  description: "Sugere receitas de drinks e coquetéis afrodisíacos para encontros e noites a dois",
  commands: ["drink", "coquetel", "afrodisiaco", "receitadrink"],
  usage: `${PREFIX}drink`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🍸");

    const drink = DRINKS[Math.floor(Math.random() * DRINKS.length)];

    return sendReply(
      `🍸 *CARTA DE DRINKS DO CASALZAUM* 🍹🥂\n\n` +
      `🍹 *Coquetel da Vez:* *${drink.nome}*\n\n` +
      `📝 *Ingredientes:*\n${drink.ingredientes}\n\n` +
      `🥄 *Modo de Preparo:*\n${drink.modo}\n\n` +
      `🔥 *Efeito Esperado:*\n_${drink.efeito}_\n\n` +
      `_Dica: Perfeito para surpreender seu par ou fazer na resenha do clube!_ ✨`
    );
  }
};
