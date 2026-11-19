import { PREFIX } from "../../../config.js";

const ITENS_HOT = [
  "ficar com um casal junto",
  "fazer um menage com duas mulheres",
  "fazer um menage com dois homens",
  "ir para uma casa de swing ou festa liberal presencial",
  "ser assistido(a) na hora H por outra pessoa",
  "assistir o(a) parceiro(a) com outra pessoa sentindo tesão",
  "transar em um lugar público com risco de ser pego",
  "gravar um vídeo íntimo sensual pro celular",
  "usar vendas, algemas ou fetiches de dominação leve (BDSM)",
  "beijar alguém do mesmo sexo na resenha",
  "mandar nude na madrugada para atiçar",
  "fazer massagem tântrica com óleo quente pelo corpo todo",
  "fazer strip-tease particular",
  "tomar banho de banheira ou piscina pelados entre amigos liberais",
  "fazer brincadeira de troca de carícias com outro casal"
];

export default {
  name: "fariaounaofaria",
  description: "Dilema +18: Envia uma fantasia/situação liberal para o grupo votar",
  commands: ["fariaounaofaria", "faria", "toparia", "topaounaotopa"],
  usage: `${PREFIX}faria`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact, pushName }) => {
    await sendReact("🔥");

    const item = ITENS_HOT[Math.floor(Math.random() * ITENS_HOT.length)];

    return sendReply(
      `😈 *FARIA OU NÃO FARIA?* 🔞🔥\n` +
      `_O teste definitivo da mente aberta no Club Casalzaum_\n\n` +
      `Você faria ou toparia:\n` +
      `👉 *"${item.toUpperCase()}"*?\n\n` +
      `────────────────────────\n` +
      `🔥 Reaja com 🔥 se você *FARIA COM CERTEZA / JÁ FEZ*!\n` +
      `👀 Reaja com 👀 se você *TOPARIA COM A PESSOA CERTA*!\n` +
      `🙈 Reaja com 🙈 se você *NÃO FARIA DE JEITO NENHUM*!\n\n` +
      `_Votem e debatam com respeito no grupo!_ 🥂`
    );
  }
};
