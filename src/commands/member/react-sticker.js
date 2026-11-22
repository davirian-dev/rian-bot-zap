import fs from "node:fs";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { sendStickerReaction } from "../../services/stickerReaction.js";
import { infoLog } from "../../utils/logger.js";

const REACTIONS_DIR = path.join(ASSETS_DIR, "stickers", "reactions");

export default {
  name: "react-sticker",
  description: "Cerca e reage a uma mensagem com moldura de figurinhas (Sticker Annotation).",
  commands: [
    "react-sticker",
    "rs",
    "reagir-fig",
    "rfig",
    "reactfig",
    "moldura",
    "cercar",
    "gato",
  ],
  usage: `${PREFIX}moldura (responda a uma mensagem para cercar com 12 figurinhas do gato)
• ${PREFIX}cercar [opção] (cerca a mensagem com a figurinha escolhida)
• ${PREFIX}rs [opção ou quantia] (ex: ${PREFIX}rs gato 5 ou ${PREFIX}rs casal)
Opções de figurinhas:
• ${PREFIX}moldura (Gatinho em moldura completa - Padrão)
• ${PREFIX}rs gato (Gatinho da foto)
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
    commandName,
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
          listFiles.join("\n") || "• gato\n• casal\n• takeshi\n• dado"
        }\n\n💡 *Como usar:* Marque uma mensagem e digite: \n\`${PREFIX}moldura\` (Cerca com gatinhos igual ao print)\n\`${PREFIX}cercar casal\`\n\`${PREFIX}rs gato 12\``
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
        `Você precisa responder à mensagem que receberá a reação com figurinha!\nExemplo: Responda a uma mensagem e digite *${PREFIX}moldura* ou *${PREFIX}rs*`
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

    // 3. Determinar quantidade padrão conforme o comando
    const isFramingCommand = commandName === "moldura" || commandName === "cercar";
    let count = isFramingCommand ? 12 : 1;

    const countArg = args.find((a) => /^\d+$/.test(a));
    if (countArg) {
      const parsed = parseInt(countArg, 10);
      if (!isNaN(parsed) && parsed > 0) {
        count = Math.min(parsed, 16);
      }
    }

    // 4. Identificar opção de figurinha digitada
    const optionArg = args.find((a) => !/^\d+$/.test(a))?.toLowerCase().trim();

    let stickerSource = null;

    if (
      optionArg &&
      optionArg !== "rs" &&
      optionArg !== "react-sticker" &&
      optionArg !== "moldura" &&
      optionArg !== "cercar"
    ) {
      const customPath = path.join(REACTIONS_DIR, `${optionArg}.webp`);
      if (fs.existsSync(customPath)) {
        stickerSource = customPath;
        infoLog(`[ReactSticker] Usando figurinha escolhida: ${optionArg}`);
      }
    }

    // Se o comando for diretamente !gato
    if (commandName === "gato") {
      const gatoPath = path.join(REACTIONS_DIR, "gato.webp");
      if (fs.existsSync(gatoPath)) {
        stickerSource = gatoPath;
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

    // 6. Padrão para moldura/cercar: GATO (da foto 1)
    if (!stickerSource && isFramingCommand) {
      const gatoPath = path.join(REACTIONS_DIR, "gato.webp");
      if (fs.existsSync(gatoPath)) {
        stickerSource = gatoPath;
        infoLog(`[ReactSticker] Usando figurinha padrão para moldura: GATO.`);
      }
    }

    // 7. Padrão para rs geral: CASAL
    if (!stickerSource) {
      const casalPath = path.join(REACTIONS_DIR, "casal.webp");
      if (fs.existsSync(casalPath)) {
        stickerSource = casalPath;
        infoLog(`[ReactSticker] Usando figurinha padrão: CASAL.`);
      } else {
        const gatoPath = path.join(REACTIONS_DIR, "gato.webp");
        if (fs.existsSync(gatoPath)) stickerSource = gatoPath;
      }
    }

    if (!stickerSource) {
      throw new InvalidParameterError("Nenhuma figurinha disponível no momento.");
    }

    await sendWaitReact();

    try {
      await sendStickerReaction(socket, remoteJid, targetKey, stickerSource, {
        count,
        delayMs: 200,
      });
      await sendSuccessReact();
    } catch (error) {
      await sendErrorReply(`Falha ao reagir com figurinha: ${error.message}`);
    }
  },
};
