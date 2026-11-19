import { PREFIX } from "../../../config.js";

const PIADAS = [
  "Qual é o café favorito dos desenvolvedores de IA? O Java-script!",
  "— Amor, você me acha gorda?\n— Não, claro que não!\n— Fala a verdade!\n— Juro por Deus! Você só ocupa bastante espaço no meu coração.",
  "Por que os químicos são excelentes em resolver problemas? Porque eles têm todas as soluções!",
  "— Doutor, como foi o meu parto?\n— Foi tudo bem, mas quando a criança nasceu, ela deu um tapa no bumbum do médico e disse: 'E aí, beleza?'",
  "O que o pato falou para a pata? Vem Quá!",
  "Por que o livro de matemática se suicidou? Porque tinha muitos problemas.",
  "Qual é o contrário de volátil? Vem cá, sobrinho!",
  "— Pai, o que é um eco?\n— É a única coisa que consegue ter a última palavra com a sua mãe.",
  "Como o Batman faz para entrar na Bat-caverna? Ele bate palma e diz: 'Abre-te Bat-sésamo!'",
  "O que a Lua disse para o Sol? 'Você é tão grande e ainda não te deixam sair à noite!'",
  "Por que o jacaré tirou o filho da escola? Porque ele réptil de ano!",
  "Qual é o cúmulo da paciência? Comer sopa de letrinhas em ordem alfabética.",
  "Por que a plantinha não foi atendida no hospital? Porque só tinha médico de plantão!"
];

export default {
  name: "piada",
  description: "Conta uma piada engraçada para animar o chat ou o grupo",
  commands: ["piada", "joke", "humor", "rir"],
  usage: `${PREFIX}piada`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("😂");
    const piada = PIADAS[Math.floor(Math.random() * PIADAS.length)];
    return sendReply(`🎭 *MOMENTO DO HUMOR* 😂\n\n${piada}`);
  }
};
