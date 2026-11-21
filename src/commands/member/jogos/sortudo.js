import { PREFIX } from "../../../config.js";
import { lerContatosGrupos } from "../../../services/groupMembersSaver.js";
import { errorLog } from "../../../utils/logger.js";

const ITENS_SORTUDO = [
  "foi eleito(a) a pessoa mais cheirosa do grupo hoje! 🌸✨",
  "está com a sorte em 100%! As chances de rolar algo incrível esta semana são máximas! 🔥",
  "tem o olhar mais misterioso e sedutor da comunidade! 😏💎",
  "deve ganhar um drink pago no próximo encontro presencial! 🍸",
  "está irradiando uma energia que chamou a atenção de alguém secreto aqui! 👀💘",
  "deve compartilhar a melhor música da sua vida hoje no grupo! 🎶",
  "foi coroado(a) o(a) rei/rainha da resenha dessa semana! 👑🥂"
];

export default {
  name: "sortudo",
  description: "Sorteia um membro aleatório do grupo para uma premiação ou destaque",
  commands: ["sortudo", "sorteio", "escolhido", "sorte"],
  usage: `${PREFIX}sortudo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    isGroup,
    sendReply,
    sendReact,
    getGroupMetadata,
  }) => {
    if (!isGroup) {
      return sendReply(`⚠️ O sorteio deve ser realizado dentro de um grupo!`);
    }

    let participantes = [];

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
      errorLog(`[Sortudo] Aviso ao buscar groupMetadata: ${errMeta.message}`);
    }

    if (!participantes.length) {
      try {
        const contatosSalvos = lerContatosGrupos();
        participantes = contatosSalvos
          .filter((c) => c.grupoId === remoteJid && c.id)
          .map((c) => c.id);
      } catch (_) {}
    }

    if (participantes.length === 0) {
      return sendReply(`⚠️ Não foi possível obter os membros do grupo para o sorteio.`);
    }

    await sendReact("🎯");

    const escolhido = participantes[Math.floor(Math.random() * participantes.length)];
    const item = ITENS_SORTUDO[Math.floor(Math.random() * ITENS_SORTUDO.length)];

    const jid = typeof escolhido === "string" ? escolhido : escolhido.id;
    const mencao = `@${jid.split("@")[0]}`;

    return sendReply(
      `🎯 *SORTEIO DO MEMBRO DESTAQUE* 🌟✨\n\n` +
      `O radar do bot girou e escolheu:\n` +
      `👉 ${mencao}!\n\n` +
      `🏆 *Veredito da Sorte:*\n` +
      `Você ${item}\n\n` +
      `_Mandem os parabéns para o nosso destaque da rodada!_ 👏🥂`,
      [jid]
    );
  },
};
