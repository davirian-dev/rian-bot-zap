import { PREFIX } from "../../../config.js";

const verdades = [
  "Qual foi o fetiche mais ousado que você já realizou ou tem vontade de realizar?",
  "Você prefere dominar ou ser dominado(a) entre quatro paredes?",
  "Qual o lugar mais inusitado ou arriscado onde você já transou?",
  "Já teve alguma experiência liberal (menage, swing, troca) ou toparia experimentar?",
  "O que uma pessoa precisa fazer para te deixar com água na boca em 30 segundos?",
  "Qual peça íntima você mais gosta de usar (ou ver alguém usando)?",
  "Se pudesse escolher alguém aqui do grupo para um date secreto, quem seria?",
  "O que você acha mais atraente em Davi & Mari do Casalzaum?",
  "Qual foi a mensagem ou foto mais quente que você já mandou no direct?",
  "Já ficou excitado(a) em público e teve que disfarçar?"
];

const desafios = [
  "Mande um áudio de 5 segundos dando um suspiro ou falando uma frase provocativa.",
  "Mande uma foto do seu olhar mais sedutor agora.",
  "Faça um elogio bem picante para a última pessoa que mandou mensagem no grupo.",
  "Conte sem censura o melhor orgasmo ou lembrança quente da sua vida.",
  "Mande um emoji que defina o que você queria estar fazendo exatamente agora.",
  "Mande uma foto do look ou da roupa íntima que você está usando agora (sem mostrar o rosto se quiser descrição).",
  "Escolha alguém do grupo e mande uma cantada estilo Casalzaum no chat.",
  "Grave um áudio dizendo: 'Davi e Mari, me convidem para a laje do Casalzaum!'",
  "Diga qual o tipo de carícia ou toque que te desmonta por completo.",
  "Compartilhe uma música que você sempre escuta para entrar no clima do prazer."
];

export default {
  name: "verdadeoudesafio",
  description: "Jogo de Verdade ou Desafio picante para o Club Casalzaum",
  commands: ["verdadeoudesafio", "vod", "hot", "verdade", "desafio"],
  usage: `${PREFIX}verdadeoudesafio (ou /verdade ou /desafio)`,

  handle: async ({ args, sendReply, sendReact, userLid }) => {
    await sendReact("🔥");

    const userNum = userLid ? userLid.split("@")[0] : "membro";
    const sub = (args[0] || "").toLowerCase();

    let tipo = "";
    let texto = "";

    if (sub.includes("verdade") || sub === "v") {
      tipo = "💬 *VERDADE*";
      texto = verdades[Math.floor(Math.random() * verdades.length)];
    } else if (sub.includes("desafio") || sub === "d") {
      tipo = "😈 *DESAFIO*";
      texto = desafios[Math.floor(Math.random() * desafios.length)];
    } else {
      const isVerdade = Math.random() > 0.5;
      tipo = isVerdade ? "💬 *VERDADE*" : "😈 *DESAFIO*";
      const lista = isVerdade ? verdades : desafios;
      texto = lista[Math.floor(Math.random() * lista.length)];
    }

    const msg = 
`🔞 *VERDADE OU DESAFIO — CLUB CASALZAUM* 🔥

A bola da vez é sua, @${userNum}! 

${tipo}:
👉 _"${texto}"_

*Arregou ou vai encarar? Responda no chat!* 😈✨`;

    await sendReply(msg, userLid ? [userLid] : []);
  }
};
