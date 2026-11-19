import { PREFIX } from "../../../config.js";

const SIGNOS = {
  "aries": { nome: "Áries ♈", elemento: "Fogo", sorte: "87%", humor: "Fogo puro e sem paciência pra lerdeza", frase: "Hoje você conquista o que quiser, basta não perder a cabeça!" },
  "touro": { nome: "Touro ♉", elemento: "Terra", sorte: "92%", humor: "Pensando na próxima refeição ou no próximo descanso", frase: "Mantenha o foco nos seus objetivos financeiros e no prazer de viver bem." },
  "gemeos": { nome: "Gêmeos ♊", elemento: "Ar", sorte: "78%", humor: "Falando pelos cotovelos e com mil ideias", frase: "Um papo interessante hoje pode abrir portas inesperadas." },
  "cancer": { nome: "Câncer ♋", elemento: "Água", sorte: "85%", humor: "Dengo, carinho ou drama com carinho", frase: "Proteja quem você ama, mas lembre-se de cuidar primeiro do seu próprio coração." },
  "leao": { nome: "Leão ♌", elemento: "Fogo", sorte: "99%", humor: "Brilhando mais que o sol do meio-dia", frase: "Você nasceu para se destacar. Não aceite nada menos do que o topo!" },
  "virgem": { nome: "Virgem ♍", elemento: "Terra", sorte: "81%", humor: "Notando os mínimos detalhes e organizando o caos", frase: "A perfeição está na harmonia das coisas simples. Relaxe um pouco!" },
  "libra": { nome: "Libra ♎", elemento: "Ar", sorte: "90%", humor: "Indeciso entre ser charmoso ou irresistível", frase: "Seu charme social vai resolver um conflito que parecia sem saída." },
  "escorpiao": { nome: "Escorpião ♏", elemento: "Água", sorte: "95%", humor: "Misterioso, sedutor e com olhar penetrante", frase: "Sua intensidade atrai quem você deseja. Use sua intuição certeira hoje." },
  "sagitario": { nome: "Sagitário ♐", elemento: "Fogo", sorte: "88%", humor: "Rindo alto e pronto pra próxima aventura", frase: "A liberdade é o seu maior tesouro. Aproveite o momento presente!" },
  "capricornio": { nome: "Capricórnio ♑", elemento: "Terra", sorte: "84%", humor: "Trabalhando ou calculando o próximo lucro", frase: "Sua persistência vai dar o retorno merecido muito em breve." },
  "aquario": { nome: "Aquário ♒", elemento: "Ar", sorte: "79%", humor: "Vivendo no ano 3000 com pensamentos únicos", frase: "Inove, pense fora da caixa e surpreenda a todos com sua originalidade." },
  "peixes": { nome: "Peixes ♓", elemento: "Água", sorte: "91%", humor: "Sentindo a energia do universo e sonhando acordado", frase: "Sua empatia é uma força poderosa. Deixe sua criatividade fluir livremente." }
};

export default {
  name: "signo",
  description: "Mostra a previsão astrológica e o humor do seu signo",
  commands: ["signo", "horoscopo", "astrologia"],
  usage: `${PREFIX}signo [seu signo]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact }) => {
    const input = args[0]?.toLowerCase()?.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (!input || !SIGNOS[input]) {
      return sendReply(
        `🔮 *HORÓSCOPO & SIGNOS* 🔮\n\n` +
        `Por favor, informe seu signo para consultar os astros!\n\n` +
        `Exemplo: *${PREFIX}signo leao* ou *${PREFIX}signo escorpiao*\n\n` +
        `_Signos disponíveis:_ Áries, Touro, Gêmeos, Câncer, Leão, Virgem, Libra, Escorpião, Sagitário, Capricórnio, Aquário, Peixes.`
      );
    }

    await sendReact("✨");
    const info = SIGNOS[input];

    return sendReply(
      `🔮 *HORÓSCOPO DO DIA - ${info.nome}* 🔮\n\n` +
      `🔥 *Elemento:* ${info.elemento}\n` +
      `🍀 *Índice de Sorte Hoje:* ${info.sorte}\n` +
      `🎭 *Vibe / Humor:* ${info.humor}\n\n` +
      `💬 *Conselho dos Astros:*\n"${info.phrase || info.frase}" ✨`
    );
  }
};
