import fs from "node:fs";
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { play } from "../../services/spider-x-api.js";
import {
  sendAudioSticker,
  convertToStickerAudio,
  convertVisualToWebp,
} from "../../services/audioStickerService.js";
import { getBuffer } from "../../utils/index.js";
import { infoLog, errorLog } from "../../utils/logger.js";

export default {
  name: "audiosticker",
  description: "Cria figurinha com áudio acoplado (AudioSticker com selo sonoro).",
  commands: ["audiosticker", "as", "stickersom", "stickeraudio"],
  usage: `${PREFIX}stickeraudio <música> (respondendo a uma foto/vídeo)
• ${PREFIX}as <termo de busca> (respondendo a uma imagem ou figurinha)
• ${PREFIX}as (enviando um vídeo curto com som)
• ${PREFIX}as (respondendo a um áudio com uma imagem)`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    webMessage,
    args,
    fullArgs,
    sendReply,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
    downloadImage,
    downloadVideo,
    downloadSticker,
    downloadAudio,
  }) => {
    const query = (fullArgs || "").trim();
    const hasQuery = query.length > 0;

    const msg = webMessage.message;
    const contextInfo =
      msg?.extendedTextMessage?.contextInfo ||
      msg?.imageMessage?.contextInfo ||
      msg?.videoMessage?.contextInfo ||
      msg?.stickerMessage?.contextInfo ||
      msg?.audioMessage?.contextInfo;

    const quotedMsg = contextInfo?.quotedMessage;

    const hasCurrentImage = Boolean(msg?.imageMessage);
    const hasQuotedImage = Boolean(quotedMsg?.imageMessage);
    const hasCurrentVideo = Boolean(msg?.videoMessage);
    const hasQuotedVideo = Boolean(quotedMsg?.videoMessage);
    const hasQuotedSticker = Boolean(quotedMsg?.stickerMessage);
    const hasCurrentSticker = Boolean(msg?.stickerMessage);

    const hasCurrentAudio = Boolean(msg?.audioMessage);
    const hasQuotedAudio = Boolean(quotedMsg?.audioMessage);

    const hasVisual =
      hasCurrentImage ||
      hasQuotedImage ||
      hasCurrentVideo ||
      hasQuotedVideo ||
      hasQuotedSticker ||
      hasCurrentSticker;

    const hasAudio = hasCurrentAudio || hasQuotedAudio;

    if (!hasVisual && !hasAudio && !hasQuery) {
      throw new InvalidParameterError(
        `🔊 *COMO USAR FIGURINHA COM SOM:*\n\n` +
          `1️⃣ *Com música*: Responda a uma foto/figurinha com:\n` +
          `\`${PREFIX}stickeraudio o mentalista tema musica\`\n\n` +
          `2️⃣ *Com áudio próprio*: Marque um áudio e responda com uma foto usando \`${PREFIX}as\`\n\n` +
          `3️⃣ *Vídeo direto*: Envie um vídeo curto com legenda \`${PREFIX}as\``
      );
    }

    if (hasQuery && !hasVisual) {
      throw new InvalidParameterError(
        "Você digitou a música, mas não marcou uma imagem, vídeo ou figurinha!\n" +
          `Responda a uma imagem/figurinha com *${PREFIX}stickeraudio ${query}*`
      );
    }

    await sendWaitReact();

    let stickerBuffer = null;
    let audioBuffer = null;
    let audioSeconds = 10;
    let isAnimated = false;

    try {
      // 1. Processar parte visual
      let visualPath = null;
      if (hasCurrentVideo || hasQuotedVideo) {
        visualPath = await downloadVideo(
          hasCurrentVideo ? webMessage : { message: quotedMsg },
          `as_vid_${Date.now()}`
        );
        isAnimated = true;
      } else if (hasCurrentImage || hasQuotedImage) {
        visualPath = await downloadImage(
          hasCurrentImage ? webMessage : { message: quotedMsg },
          `as_img_${Date.now()}`
        );
        isAnimated = false;
      } else if (hasQuotedSticker || hasCurrentSticker) {
        visualPath = await downloadSticker(
          hasCurrentSticker ? webMessage : { message: quotedMsg },
          `as_stk_${Date.now()}`
        );
      }

      if (visualPath && fs.existsSync(visualPath)) {
        if (hasQuotedSticker || hasCurrentSticker) {
          stickerBuffer = await fs.promises.readFile(visualPath);
        } else {
          stickerBuffer = await convertVisualToWebp(visualPath, isAnimated);
        }
        await fs.promises.unlink(visualPath).catch(() => {});
      }

      if (!stickerBuffer) {
        throw new Error("Não foi possível carregar a imagem ou vídeo da figurinha.");
      }

      // 2. Processar áudio
      if (hasQuery) {
        infoLog(`[AudioSticker] Buscando faixa musical: ${query}`);
        const playData = await play("audio", query).catch((e) => {
          throw new Error(`Busca da música falhou: ${e.message}`);
        });

        if (!playData || !playData.url) {
          throw new Error(`Nenhuma música encontrada para: "${query}"`);
        }

        const rawAudio = await getBuffer(playData.url);
        const converted = await convertToStickerAudio(rawAudio, 15);
        audioBuffer = converted.buffer;
        audioSeconds = converted.seconds;
      } else if (hasAudio) {
        infoLog("[AudioSticker] Extraindo áudio marcado na mensagem...");
        const audioPath = await downloadAudio(
          hasCurrentAudio ? webMessage : { message: quotedMsg },
          `as_aud_${Date.now()}`
        );

        if (!audioPath || !fs.existsSync(audioPath)) {
          throw new Error("Falha ao baixar o áudio selecionado.");
        }

        const rawAudio = await fs.promises.readFile(audioPath);
        await fs.promises.unlink(audioPath).catch(() => {});

        const converted = await convertToStickerAudio(rawAudio, 15);
        audioBuffer = converted.buffer;
        audioSeconds = converted.seconds;
      } else if (hasCurrentVideo || hasQuotedVideo) {
        // Extrair áudio do próprio vídeo
        infoLog("[AudioSticker] Extraindo áudio nativo do vídeo...");
        const converted = await convertToStickerAudio(visualPath || stickerBuffer, 15);
        audioBuffer = converted.buffer;
        audioSeconds = converted.seconds;
      }

      if (!audioBuffer) {
        throw new Error("Nenhum áudio pôde ser gerado para a figurinha.");
      }

      // 3. Montar e Enviar AudioSticker
      const targetQuoted = quotedMsg ? { key: { id: contextInfo.stanzaId, remoteJid, participant: contextInfo.participant }, message: quotedMsg } : webMessage;

      await sendAudioSticker(
        socket,
        remoteJid,
        {
          stickerBuffer,
          audioBuffer,
          audioSeconds,
          isAnimated,
        },
        targetQuoted
      );

      await sendSuccessReact();
    } catch (err) {
      errorLog(`[AudioSticker] Erro: ${err.message}`);
      await sendErrorReply(`❌ Falha ao criar figurinha com som: ${err.message}`);
    }
  },
};
