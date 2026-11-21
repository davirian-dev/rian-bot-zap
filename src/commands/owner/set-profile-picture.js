import fs from "node:fs";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { errorLog, infoLog } from "../../utils/logger.js";

export default {
  name: "set-profile-picture",
  description: "Define a foto de perfil do próprio bot no WhatsApp com a foto do casal ou uma imagem marcada.",
  commands: [
    "setperfil",
    "set-perfil",
    "fotoperfil",
    "set-foto",
    "fotocasal",
    "set-foto-casal",
  ],
  usage: `${PREFIX}fotocasal ou ${PREFIX}setperfil (respondendo a uma imagem)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isImage,
    isReply,
    downloadImage,
    sendWaitReply,
    sendSuccessReply,
    sendErrorReply,
    socket,
    webMessage,
  }) => {
    try {
      await sendWaitReply("Atualizando a foto de perfil do bot...");

      const botJid = socket?.user?.id?.split(":")[0] + "@s.whatsapp.net" || socket?.user?.id;
      let targetImagePath = "";

      if (isReply && isImage) {
        targetImagePath = await downloadImage(webMessage, "new-profile-pic");
      } else {
        // Usa a foto oficial 1:1 do casal
        targetImagePath = path.join(ASSETS_DIR, "images", "perfil-casal.png");
        if (!fs.existsSync(targetImagePath)) {
          targetImagePath = path.join(ASSETS_DIR, "images", "takeshi-bot.png");
        }
      }

      await socket.updateProfilePicture(botJid, { url: targetImagePath });

      infoLog(`[TakeshiBot] Foto de perfil do bot atualizada para ${botJid} com ${targetImagePath}`);
      await sendSuccessReply("Foto de perfil do bot atualizada com a foto do casal com sucesso! 👑❤️");
    } catch (error) {
      errorLog(`Erro ao atualizar foto de perfil do bot: ${error.message}`);
      await sendErrorReply(`Não foi possível atualizar a foto de perfil: ${error.message}`);
    }
  },
};
