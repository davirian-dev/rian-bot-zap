import path from "node:path";
import fs from "node:fs";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { sendStickerReaction } from "../../../services/stickerReaction.js";

const REACTIONS_DIR = path.join(ASSETS_DIR, "stickers", "reactions");

export default {
  name: "beijar",
  description: "Interação carinhosa e picante entre membros ou casais com figurinha.",
  commands: ["beijar", "beijo", "morder", "mordida", "abracar", "abraco"],
  usage: `${PREFIX}beijar @parceiro(a) (ou respondendo à mensagem dele)`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    commandName,
    socket,
    remoteJid,
    webMessage,
    userLid,
    isReply,
    replyLid,
    args,
    sendReply,
    sendReact,
  }) => {
    let target = isReply
      ? replyLid
      : args[0] && args[0].includes("@")
      ? args[0].replace("@", "")
      : "";

    if (!target) {
      throw new InvalidParameterError(
        `Marque a pessoa ou responda a mensagem dela!\nExemplo: *${PREFIX}${commandName} @pessoa*`
      );
    }

    const senderNumber = userLid ? userLid.split("@")[0].split(":")[0] : "Alguém";
    const targetNumber = target.split("@")[0].split(":")[0];

    const actions = {
      beijar: { verb: "deu um beijo bem gostoso em", emoji: "💋" },
      beijo: { verb: "deu um beijo ardente em", emoji: "💋" },
      morder: { verb: "deu uma mordidinha safada em", emoji: "😈" },
      mordida: { verb: "deu uma mordidinha gostosa no pescoço de", emoji: "😈" },
      abracar: { verb: "deu um abraço bem apertado e quentinho em", emoji: "🫂" },
      abraco: { verb: "deu um abraço bem gostoso em", emoji: "🫂" },
    };

    const action = actions[commandName] || actions.beijar;

    await sendReact(action.emoji);

    const msg = `🔥 @${senderNumber} ${action.verb} @${targetNumber}! ${action.emoji}✨`;
    const mentions = [
      userLid || `${senderNumber}@lid`,
      target.includes("@") ? target : `${targetNumber}@lid`,
    ];

    await sendReply(msg, mentions);

    // Se respondeu a uma mensagem, aproveita e coloca a reação de figurinha do casal!
    const contextInfo =
      webMessage.message?.extendedTextMessage?.contextInfo ||
      webMessage.message?.imageMessage?.contextInfo;

    if (contextInfo?.stanzaId) {
      const casalPath = path.join(REACTIONS_DIR, "casal.webp");
      if (fs.existsSync(casalPath)) {
        try {
          const isGroup = remoteJid.endsWith("@g.us");
          const targetKey = {
            remoteJid,
            id: contextInfo.stanzaId,
            fromMe: Boolean(contextInfo.participant && socket.user?.id?.includes(contextInfo.participant.split("@")[0])),
            ...(isGroup && contextInfo.participant ? { participant: contextInfo.participant } : {}),
          };
          await sendStickerReaction(socket, remoteJid, targetKey, casalPath, { count: 3, delayMs: 250 });
        } catch (_) {}
      }
    }
  },
};
