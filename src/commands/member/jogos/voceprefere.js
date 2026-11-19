import { PREFIX } from "../../../config.js";

// Lista de perguntas e cenários hipotéticos profundos / divertidos
const DILEMAS = [
  "Você preferiria nunca mais poder beijar na boca ou nunca mais poder fazer sexo?",
  "Você preferiria saber exatamente o que o seu parceiro(a) está pensando na cama OU ter o poder de fazer qualquer pessoa sentir atração por você?",
  "Você preferiria viver uma aventura selvagem a três em uma praia deserta OU passar um fim de semana em um hotel 5 estrelas com tudo liberado com seu casal favorito?",
  "Você preferiria nunca mais poder tirar a roupa na frente de ninguém com a luz acesa OU nunca mais poder falar nada durante a hora H?",
  "Você preferiria que seu parceiro(a) tivesse um crush secreto no seu melhor amigo(a) OU que ele(a) descobrisse todos os seus históricos de busca proibidos?",
  "Você preferiria ter que confessar seu fetiche mais secreto em voz alta para todo o grupo OU pagar uma rodada de drinks para todo mundo no próximo encontro?",
  "Você preferiria passar 1 ano sem celular OU 1 ano sem ter nenhum tipo de prazer íntimo?",
  "Você preferiria fazer uma troca de casais onde você só assiste OU uma onde você participa mas com os olhos vendados o tempo todo?",
  "Você preferiria ter atração física irresistível mas sem nenhuma química de conversa OU uma conexão mental perfeita mas sem pegada?",
  "Você preferiria que todas as suas mensagens apagadas do WhatsApp fossem lidas pelo grupo OU dançar pelado(a) no meio da sala?"
];

export default {
  name: "voceprefere",
  description: "Dilemas e escolhas difíceis (+18 e divertidas) para o grupo debater e votar",
  commands: ["voceprefere", "prefere", "oquevoceprefere", "dilema"],
  usage: `${PREFIX}voceprefere`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🤔");

    const dilema = DILEMAS[Math.floor(Math.random() * DILEMAS.length)];

    return sendReply(
      `⚖️ *O QUE VOCÊ PREFERE?* 🤔🔥\n` +
      `_Dilema do Club Casalzaum • Escolha difícil!_\n\n` +
      `👉 *${dilema}*\n\n` +
      `─────────────────────────\n` +
      `🅰️ Reaja com 🅰️ ou 1️⃣ para a *PRIMEIRA OPÇÃO*!\n` +
      `🅱️ Reaja com 🅱️ ou 2️⃣ para a *SEGUNDA OPÇÃO*!\n\n` +
      `_Justifiquem sua resposta no grupo se tiverem coragem!_ 😈🥂`
    );
  }
};
