import { PREFIX } from "../../../config.js";

const QUIZZES = [
  {
    pergunta: "Qual é a capital oficial do Brasil?",
    opcoes: ["A) Rio de Janeiro", "B) São Paulo", "C) Brasília", "D) Salvador"],
    correta: "C",
    explicacao: "Brasília foi inaugurada em 1960 pelo presidente Juscelino Kubitschek."
  },
  {
    pergunta: "Quantos planetas compõem o Sistema Solar atualmente?",
    opcoes: ["A) 7", "B) 8", "C) 9", "D) 10"],
    correta: "B",
    explicacao: "São 8 planetas (Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno). Plutão é planeta anão."
  },
  {
    pergunta: "Qual elemento químico é representado pelo símbolo 'Au'?",
    opcoes: ["A) Prata", "B) Cobre", "C) Ouro", "D) Alumínio"],
    correta: "C",
    explicacao: "Au vem do latim 'Aurum', que significa ouro."
  },
  {
    pergunta: "Em qual continente fica localizado o Egito?",
    opcoes: ["A) Ásia", "B) Europa", "C) África", "D) América"],
    correta: "C",
    explicacao: "O Egito fica no nordeste do continente africano."
  },
  {
    pergunta: "Quem pintou a famosa obra 'Mona Lisa'?",
    opcoes: ["A) Vincent van Gogh", "B) Leonardo da Vinci", "C) Pablo Picasso", "D) Michelangelo"],
    correta: "B",
    explicacao: "Leonardo da Vinci pintou a Mona Lisa no início do século XVI."
  }
];

// Quiz ativo por grupo/chat: Map<remoteJid, { questao, respondido }>
const quizzesAtivos = new Map();

export default {
  name: "quiz",
  description: "Pergunta de conhecimentos gerais para responder no grupo",
  commands: ["quiz", "trivia", "pergunta"],
  usage: `${PREFIX}quiz [A, B, C ou D para responder]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, remoteJid, pushName }) => {
    const resposta = args[0]?.toUpperCase()?.trim();

    // Se estiver respondendo
    if (resposta && ["A", "B", "C", "D"].includes(resposta)) {
      const quizAtual = quizzesAtivos.get(remoteJid);
      if (!quizAtual) {
        return sendReply(`⚠️ Não há nenhum quiz ativo no momento! Digite *${PREFIX}quiz* para gerar uma nova pergunta.`);
      }

      quizzesAtivos.delete(remoteJid);

      if (resposta === quizAtual.correta) {
        await sendReact("🏆");
        return sendReply(
          `🎉 *RESPOSTA CORRETA, ${pushName || "Membro"}!* 👏🧠\n\n` +
          `A alternativa correta é mesmo a letra *(${quizAtual.correta})*.\n` +
          `📚 *Curiosidade:* ${quizAtual.explicacao}\n\n` +
          `Para o próximo desafio: *${PREFIX}quiz*`
        );
      } else {
        await sendReact("❌");
        return sendReply(
          `❌ *RESPOSTA INCORRETA!* 😅\n\n` +
          `Você escolheu a letra (${resposta}), mas a correta era *(${quizAtual.correta})*.\n` +
          `📚 *Curiosidade:* ${quizAtual.explicacao}\n\n` +
          `Para tentar outra: *${PREFIX}quiz*`
        );
      }
    }

    // Iniciar novo quiz
    const questao = QUIZZES[Math.floor(Math.random() * QUIZZES.length)];
    quizzesAtivos.set(remoteJid, questao);

    await sendReact("🧠");

    return sendReply(
      `🧠 *DESAFIO DO QUIZ* 💡\n\n` +
      `❓ *Pergunta:*\n_${questao.pergunta}_\n\n` +
      `${questao.opcoes.join("\n")}\n\n` +
      `👉 Para responder, digite:\n` +
      `*${PREFIX}quiz A*, *${PREFIX}quiz B*, *${PREFIX}quiz C* ou *${PREFIX}quiz D*`
    );
  }
};
