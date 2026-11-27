import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import {
  buildTopicStyleNewsletter,
  resolveChannelCodeToJid,
  sendDigestToTarget,
} from "../../services/dailyNewsDigest.js";

export default {
  name: "test-canal",
  description: "Dispara uma edição completa no formato Tech/Nicho News com foto oficial e tópicos.",
  commands: ["test-canal", "teste-canal", "postar-canal"],
  usage: `${PREFIX}test-canal`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket, sendSuccessReply, sendWaitReply }) => {
    try {
      await sendWaitReply("Montando edição em tópicos com foto oficial e links de referência...");

      const channelJid = await resolveChannelCodeToJid(socket, "0029VbEHUMvFnSz2CnO59y3L");
      if (!channelJid) {
        throw new WarningError("Não foi possível resolver o JID do canal Club Casalzaum via código 0029VbEHUMvFnSz2CnO59y3L.");
      }

      const digestData = await buildTopicStyleNewsletter(4);
      const result = await sendDigestToTarget(socket, channelJid, digestData);

      await sendSuccessReply(
        `🚀 *Edição publicada com sucesso no canal!*\n\n` +
        `Canal: \`${channelJid}\`\n` +
        `Imagem enviada: ${result.withImage ? "Sim ✅" : "Não (apenas texto)"}` +
        (result.serverId ? `\nServer ID: \`${result.serverId}\`` : ""),
      );
    } catch (err) {
      throw new WarningError(`Falha ao disparar no canal: ${err.message}`);
    }
  },
};
