import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "set-desc",
  description: "Altera a descrição / bio do grupo no WhatsApp",
  commands: ["set-desc", "set-bio", "mudar-bio", "mudar-descricao", "bio-grupo", "desc-grupo"],
  usage: `${PREFIX}set-desc Nova descrição do grupo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    remoteJid,
    socket,
    sendErrorReply,
    sendSuccessReply,
    sendWaitReply,
    isGroup,
  }) => {
    if (!isGroup) {
      throw new WarningError("Esse comando só pode ser usado em grupos.");
    }
    if (!fullArgs) {
      throw new InvalidParameterError(
        "Você precisa fornecer a nova descrição / bio do grupo!"
      );
    }

    try {
      await sendWaitReply("Atualizando a bio do grupo...");
      // O método oficial do Baileys para atualizar descrição do grupo
      await socket.groupUpdateDescription(remoteJid, fullArgs);
      await sendSuccessReply(
        `✅ *Descrição / Bio do grupo atualizada com sucesso!*\n\n📝 *Nova Bio:*\n${fullArgs}`
      );
    } catch (error) {
      errorLog("Erro ao alterar a descrição do grupo:", error);
      await sendErrorReply(
        "Falha ao alterar a bio do grupo. Verifique se o bot é administrador do grupo!"
      );
    }
  },
};
