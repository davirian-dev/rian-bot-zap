import { PREFIX } from "../../../config.js";
import { lerContatosGrupos } from "../../../services/groupMembersSaver.js";
import { errorLog } from "../../../utils/logger.js";

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
  "Puxar pelo cabelo com pegada firme e dar um beijo de tirar o fôlego em",
  "Fazer uma pergunta íntima sem filtro que precisa ser respondida por",
  "Dar um selinho demorado e provocante em"
];

export default {
  name: "garrafahot",
  description: "Gira a Garrafa Hot (+18) do meio liberal entre os membros do grupo",
  commands: ["garrafahot", "girargarrafa", "garrafa", "spin"],
  usage: `${PREFIX}garrafahot`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    userLid,
    isGroup,
    sendReply,
    sendReact,
    getGroupMetadata,
  }) => {
    if (!isGroup) {
      return sendReply("⚠️ A Garrafa Hot deve ser girada dentro de um grupo!");
    }

    await sendReact("🍾");

    let participantes = [];

    // Método 1: Busca metadados ao vivo via getGroupMetadata ou socket direto
    try {
      let meta = null;
      if (typeof getGroupMetadata === "function") {
        meta = await getGroupMetadata(remoteJid);
      }
      if (!meta && socket?.groupMetadata) {
        meta = await socket.groupMetadata(remoteJid);
      }
      if (meta?.participants?.length) {
        participantes = meta.participants.map((p) => p.id || p.jid || p);
      }
    } catch (errMeta) {
      errorLog(`[GarrafaHot] Aviso ao buscar groupMetadata: ${errMeta.message}`);
    }

    // Método 2: Fallback pelo banco de membros salvo (contatos-grupos.json)
    if (!participantes.length) {
      try {
        const contatosSalvos = lerContatosGrupos();
        participantes = contatosSalvos
          .filter((c) => c.grupoId === remoteJid && c.id)
          .map((c) => c.id);
      } catch (_) {}
    }

    const autorId = userLid || socket.user?.id || "";
    let alvoId = null;

    // Normaliza para comparação (remove sufixos de device tipo :1@s.whatsapp.net)
    const autorLimpo = autorId.split(":")[0].split("@")[0];

    const outros = participantes.filter((p) => {
      const pId = typeof p === "string" ? p : p?.id || "";
      const pLimpo = pId.split(":")[0].split("@")[0];
      return pLimpo && pLimpo !== autorLimpo;
    });

    if (outros.length > 0) {
      const sorteado = outros[Math.floor(Math.random() * outros.length)];
      alvoId = typeof sorteado === "string" ? sorteado : sorteado.id;
    }

    const acao = ACOES[Math.floor(Math.random() * ACOES.length)];

    const mencoes = [];
    let textoAutor = "Você";
    let textoAlvo = "alguém misterioso do grupo";

    if (autorId) {
      mencoes.push(autorId);
      textoAutor = `@${autorId.split("@")[0]}`;
    }

    if (alvoId) {
      mencoes.push(alvoId);
      textoAlvo = `@${alvoId.split("@")[0]}`;
    }

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
  },
};
