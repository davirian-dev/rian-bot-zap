import { PREFIX } from "../../../config.js";

const EU_NUNCA = [
  "Eu nunca fiquei com mais de uma pessoa na mesma noite.",
  "Eu nunca mandei mensagem bêbado(a) pro(a) ex me arrependendo na manhã seguinte.",
  "Eu nunca tive um crush secreto em alguém deste grupo.",
  "Eu nunca fingi que estava dormindo ou ocupado para não atender uma ligação.",
  "Eu nunca mandei um nude e fiquei com medo de vazar.",
  "Eu nunca beijei alguém sem saber o nome da pessoa.",
  "Eu nunca olhei as conversas de alguém escondido.",
  "Eu nunca inventei uma desculpa esfarrapada para ir embora de um encontro ruim.",
  "Eu nunca tive uma fantasia liberal que nunca contei pra ninguém.",
  "Eu nunca gastei meu dinheiro com algo inútil só por impulso na madrugada.",
  "Eu nunca dancei sozinho pelado(a) na frente do espelho.",
  "Eu nunca curti uma foto antiga de alguém por engano enquanto stalkeava.",
  "Eu nunca menti minha idade para conseguir algo.",
  "Eu nunca participei de uma brincadeira a três ou flerte coletivo."
];

export default {
  name: "eununca",
  description: "Envia uma pergunta clássica do jogo Eu Nunca para o grupo interagir",
  commands: ["eununca", "neverhaveiever", "nunca"],
  usage: `${PREFIX}eununca`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🍻");
    const frase = EU_NUNCA[Math.floor(Math.random() * EU_NUNCA.length)];

    return sendReply(
      `🍻 *EU NUNCA...* 🍻\n\n` +
      `👉 _"${frase}"_\n\n` +
      `🍺 Quem *JÁ FEZ*, reage com 🍻 ou toma um gole!\n` +
      `😇 Quem *NUNCA FEZ*, reage com 😇!`
    );
  }
};
