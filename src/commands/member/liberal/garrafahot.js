import { PREFIX } from "../../../config.js";

const ACOES = [
  "Dar um beijo molhado no pescoço de",
  "Dar um tapa estalado e carinhoso na bunda de",
  "Morder de leve o lábio de",
  "Sussurrar no ouvido uma sacanagem proibida para",
  "Fazer uma massagem sensual nas costas e ombros de",
  "Tirar uma peça de roupa na frente de",
  "Dançar coladinho(a) e com muito fogo com",
  "Tomar um gole de drink diretamente no corpo de",
  "Amarrar as mãos e provocar com beijos pelo corpo de",
  "Vendar os olhos e deixar sentir o perfume bem de perto de",
  "Propor um beijo triplo e sem pressa com",
  "Puxar pelo cabelo com pegada firme e dar um beijo de tirar o fôlego em"
];

export default {
  name: "garrafahot",
  description: "Gira a Garrafa Hot (+18) do meio liberal entre os membros do grupo",
  commands: ["garrafahot", "girargarrafa", "garrafa", "spin"],
  usage: `${PREFIX}garrafahot`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact, groupMetadata, userJid, pushName }) => {
    await sendReact("🍾");

    const participantes = groupMetadata?.participants || [];
    let autorId = userJid;
    let alvoId = null;

    if (participantes.length > 1) {
      // Sorteia um participante que não seja quem girou
      const outros = participantes.filter(p => p.id !== autorId);
      const sorteado = outros[Math.floor(Math.random() * outros.length)];
      alvoId = sorteado.id;
    }

    const acao = ACOES[Math.floor(Math.random() * ACOES.length)];

    let mencoes = [autorId];
    let textoAlvo = "@alguém";

    if (alvoId) {
      mencoes.push(alvoId);
      textoAlvo = `@${alvoId.split("@")[0]}`;
    }

    const textoAutor = `@${autorId.split("@")[0]}`;

    return sendReply(
      `🍾 *A GARRAFA HOT DO MEIO LIBERAL GIROU...* 🔥🔞\n\n` +
      `🌀 _A garrafa girou rápido, foi desacelerando... e parou!_\n\n` +
      `👤 *Quem girou:* ${textoAutor}\n` +
      `🎯 *A ponta da garrafa apontou para:* ${textoAlvo}\n\n` +
      `😈 *Ação Obrigatória do Casalzaum:*\n` +
      `👉 *${textoAutor}* deve *${acao}* *${textoAlvo}*! 🔥\n\n` +
      `_Têm coragem de cumprir essa no próximo encontro ou no privado?_ 😏🥂`,
      mencoes
    );
  }
};
