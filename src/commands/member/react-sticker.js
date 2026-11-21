import fs from "node:fs";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { sendStickerReaction } from "../../services/stickerReaction.js";
import { infoLog } from "../../utils/logger.js";

const REACTIONS_DIR = path.join(ASSETS_DIR, "stickers", "reactions");

export default {
  name: "react-sticker",
  description: "Reage a uma mensagem marcada com figurinha (Sticker Annotation).",
  commands: ["react-sticker", "rs", "reagir-fig", "rfig", "reactfig"],
  usage: `${PREFIX}rs [opção ou quantia] (responda a uma mensagem)
Opções de figurinhas:
• ${PREFIX}rs (Foto do Casal - Padrão)
• ${PREFIX}rs casal (Foto do Casal)
• ${PREFIX}rs takeshi (Mascote Takeshi)
• ${PREFIX}rs dado (Dado da sorte)
• ${PREFIX}rs lista (Ver todas as figurinhas salvas)`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    webMessage,
    remoteJid,
    args,
    fullArgs,
    sendReply,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
    downloadSticker,
  }) => {
    // 1. Menu de lista
    const lowerArgs = (fullArgs || "").toLowerCase().trim();
    if (lowerArgs === "lista" || lowerArgs === "list" || lowerArgs === "opcoes") {
      let listFiles = [];
      if (fs.existsSync(REACTIONS_DIR)) {
        listFiles = fs
          .readdirSync(REACTIONS_DIR)
          .filter((f) => f.endsWith(".webp"))
          .map((f) => `• *${path.basename(f, ".webp")}*`);
      }
      return await sendReply(
        `🎭 *FIGURINHAS DE REAÇÃO DISPONÍVEIS:*\n\n${
          listFiles.join("\n") || "• casal\n• takeshi\n• dado"
        }\n\n💡 *Como usar:* Marque uma mensagem e digite: \n\`${PREFIX}rs\` (Padrão: Casal)\n\`${PREFIX}rs takeshi\`\n\`${PREFIX}rs casal 3\` (Reage 3x)`
      );
    }

    // 2. Extrai contextInfo de qualquer tipo de mensagem citada
    const contextInfo =
      webMessage.message?.extendedTextMessage?.contextInfo ||
      webMessage.message?.imageMessage?.contextInfo ||
      webMessage.message?.videoMessage?.contextInfo ||
      webMessage.message?.documentMessage?.contextInfo ||
      webMessage.message?.audioMessage?.contextInfo;

    if (!contextInfo?.stanzaId) {
      throw new InvalidParameterError(
        `Você precisa responder à mensagem que receberá a reação com figurinha!\nExemplo: Responda uma mensagem e digite *${PREFIX}rs*`
      );
    }

    const isGroup = remoteJid.endsWith("@g.us");
    const targetKey = {
      remoteJid,
      id: contextInfo.stanzaId,
      fromMe: Boolean(
        contextInfo.participant &&
          socket.user?.id?.includes(contextInfo.participant.split("@")[0])
      ),
      ...(isGroup && contextInfo.participant ? { participant: contextInfo.participant } : {}),
    };

    // 3. Extrair quantidade (ex: !rs 3 ou !rs casal 3)
    let count = 1;
    const countArg = args.find((a) => /^\d+$/.test(a));
    if (countArg) {
      const parsed = parseInt(countArg, 10);
      if (!isNaN(parsed) && parsed > 0) {
        count = Math.min(parsed, 10);
      }
    }

    // 4. Identificar opção de figurinha digitada
    const optionArg = args.find((a) => !/^\d+$/.test(a))?.toLowerCase().trim();

    let stickerSource = null;

    if (optionArg && optionArg !== "rs" && optionArg !== "react-sticker") {
      const customPath = path.join(REACTIONS_DIR, `${optionArg}.webp`);
      if (fs.existsSync(customPath)) {
        stickerSource = customPath;
        infoLog(`[ReactSticker] Usando figurinha escolhida: ${optionArg}`);
      }
    }

    // 5. Se marcou uma figurinha no chat e não escolheu outra manualmente
    const hasQuotedSticker = Boolean(contextInfo.quotedMessage?.stickerMessage);
    const hasCurrentSticker = Boolean(webMessage.message?.stickerMessage);

    if (!stickerSource && (hasCurrentSticker || hasQuotedSticker)) {
      try {
        const stickerPath = await downloadSticker(
          hasCurrentSticker ? webMessage : { message: contextInfo.quotedMessage },
          `rx_${Date.now()}`
        );
        if (stickerPath && fs.existsSync(stickerPath)) {
          stickerSource = stickerPath;
          infoLog(`[ReactSticker] Usando figurinha citada no chat.`);
        }
      } catch (_) {}
    }

    // 6. SEGREDO: O PADRÃO ABSOLUTO É SEMPRE O CASAL!
    if (!stickerSource) {
      const casalPath = path.join(REACTIONS_DIR, "casal.webp");
      if (fs.existsSync(casalPath)) {
        stickerSource = casalPath;
        infoLog(`[ReactSticker] Usando figurinha padrão: CASAL.`);
      }
    }

    if (!stickerSource) {
      throw new InvalidParameterError("Nenhuma figurinha disponível no momento.");
    }

    await sendWaitReact();

    try {
      await sendStickerReaction(socket, remoteJid, targetKey, stickerSource, {
        count,
        delayMs: 300,
      });
      await sendSuccessReact();
    } catch (error) {
      await sendErrorReply(`Falha ao reagir com figurinha: ${error.message}`);
    }
  },
};
