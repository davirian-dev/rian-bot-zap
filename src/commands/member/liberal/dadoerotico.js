import { PREFIX } from "../../../config.js";

const DADOS_ACOES = [
  "Beijo suave e molhado",
  "Mordidinha de arrepiar",
  "Massagem com óleo",
  "Lamber com calma",
  "Tapa estalado",
  "Sussurrar com a respiração quente",
  "Beijo com pegada firme",
  "Chupão de leve"
];

const DADOS_LOCAIS = [
  "no pescoço",
  "na nuca",
  "na orelha",
  "na boca",
  "na virilha",
  "na coxa por dentro",
  "na bunda",
  "na barriga / abdômen",
  "nos seios / peitoral",
  "nos lábios inferiores"
];

export default {
  name: "dadoerotico",
  description: "Rola os 2 dados eróticos (+18) combinando uma ação sensual e uma parte do corpo",
  commands: ["dadoerotico", "dadohot", "dadosensual", "erotico"],
  usage: `${PREFIX}dadoerotico [@parceiro/alguém opcional]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, isReply, replyJid, mentions, pushName }) => {
    await sendReact("🎲");

    const acao = DADOS_ACOES[Math.floor(Math.random() * DADOS_ACOES.length)];
    const local = DADOS_LOCAIS[Math.floor(Math.random() * DADOS_LOCAIS.length)];

    let mencoes = [];
    let textoAlvo = "";

    if (mentions && mentions.length > 0) {
      mencoes.push(mentions[0]);
      textoAlvo = ` com @${mentions[0].split("@")[0]}`;
    } else if (isReply && replyJid) {
      mencoes.push(replyJid);
      textoAlvo = ` com @${replyJid.split("@")[0]}`;
    }

    return sendReply(
      `🎲 *DADOS ERÓTICOS CASALZAUM* 🔞🔥\n\n` +
      `🎲 *Dado 1 (Ação):* ${acao}\n` +
      `🎯 *Dado 2 (Onde):* ${local}\n\n` +
      `Resultado combinado${textoAlvo}:\n` +
      `👉 *"${acao} ${local}"*! 😈🔥\n\n` +
      `_Quem aí topa pagar essa rodada?_ 🥂`,
      mencoes
    );
  }
};
