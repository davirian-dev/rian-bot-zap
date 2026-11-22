import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import {
  prepareWAMessageMedia,
  proto,
} from "baileys";
import { infoLog, errorLog } from "../utils/logger.js";

const execAsync = promisify(exec);

let isExtensionInstalled = false;

/**
 * Instala patches no protobuf do Baileys para habilitar serialização nativa
 * de audioStickerMessage (field 134) e stickerMessage.audioMessage (field 26).
 */
export function installAudioStickerExtension() {
  if (isExtensionInstalled) return;

  try {
    const origStickerEncode = proto.Message.StickerMessage.encode;
    proto.Message.StickerMessage.encode = function encode(m, w) {
      w = origStickerEncode.call(this, m, w);
      if (m.audioMessage != null && Object.hasOwnProperty.call(m, "audioMessage")) {
        proto.Message.AudioMessage.encode(m.audioMessage, w.uint32(210).fork()).ldelim();
      }
      return w;
    };

    const origMessageEncode = proto.Message.encode;
    proto.Message.encode = function encode(m, w) {
      w = origMessageEncode.call(this, m, w);
      if (m.audioStickerMessage != null && Object.hasOwnProperty.call(m, "audioStickerMessage")) {
        proto.Message.FutureProofMessage.encode(m.audioStickerMessage, w.uint32(1074).fork()).ldelim();
      }
      return w;
    };

    isExtensionInstalled = true;
    infoLog("[AudioSticker] Extensão de audioStickerMessage instalada com sucesso no Baileys.");
  } catch (err) {
    errorLog(`[AudioSticker] Falha ao instalar extensão: ${err.message}`);
  }
}

/**
 * Extrai o tamanho do primeiro frame de um WebP animado (chunk ANMF).
 * @param {Buffer} buffer
 * @returns {number|null}
 */
export function extractFirstFrameLength(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff !== "RIFF" || webp !== "WEBP") return null;

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const fourcc = buffer.subarray(offset, offset + 4).toString("ascii");
    const size = buffer.readUInt32LE(offset + 4);
    const chunkTotal = 8 + size + (size % 2);
    offset += chunkTotal;
    if (fourcc === "ANMF") {
      return offset;
    }
  }
  return null;
}

/**
 * Converte qualquer áudio ou vídeo para o formato oficial Opus (.ogg) de áudio para stickers.
 * @param {Buffer|string} inputBufferOrPath
 * @param {number} [maxSeconds=15]
 * @returns {Promise<{ buffer: Buffer, seconds: number }>}
 */
export async function convertToStickerAudio(inputBufferOrPath, maxSeconds = 15) {
  const tmpId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const tmpInput = path.join(os.tmpdir(), `audio_in_${tmpId}.tmp`);
  const tmpOutput = path.join(os.tmpdir(), `audio_out_${tmpId}.ogg`);

  try {
    if (Buffer.isBuffer(inputBufferOrPath)) {
      await fs.promises.writeFile(tmpInput, inputBufferOrPath);
    } else {
      await fs.promises.copyFile(inputBufferOrPath, tmpInput);
    }

    const cmd = `ffmpeg -y -i "${tmpInput}" -t ${maxSeconds} -vn -c:a libopus -b:a 64k -ar 48000 "${tmpOutput}"`;
    await execAsync(cmd);

    const buffer = await fs.promises.readFile(tmpOutput);

    // Duração aproximada via probe ou fallback
    let seconds = 10;
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tmpOutput}"`
      );
      const parsed = parseFloat(stdout.trim());
      if (!isNaN(parsed) && parsed > 0) {
        seconds = Math.round(parsed);
      }
    } catch (_) {}

    return { buffer, seconds };
  } finally {
    await fs.promises.unlink(tmpInput).catch(() => {});
    await fs.promises.unlink(tmpOutput).catch(() => {});
  }
}

/**
 * Converte imagem ou vídeo para WebP compatível com figurinha.
 * @param {Buffer|string} inputBufferOrPath
 * @param {boolean} isVideo
 * @returns {Promise<Buffer>}
 */
export async function convertVisualToWebp(inputBufferOrPath, isVideo = false) {
  const tmpId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const tmpInput = path.join(os.tmpdir(), `visual_in_${tmpId}.tmp`);
  const tmpOutput = path.join(os.tmpdir(), `visual_out_${tmpId}.webp`);

  try {
    if (Buffer.isBuffer(inputBufferOrPath)) {
      await fs.promises.writeFile(tmpInput, inputBufferOrPath);
    } else {
      await fs.promises.copyFile(inputBufferOrPath, tmpInput);
    }

    let cmd;
    if (isVideo) {
      cmd = `ffmpeg -y -i "${tmpInput}" -t 8 -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -loop 0 -an -vsync 0 "${tmpOutput}"`;
    } else {
      cmd = `ffmpeg -y -i "${tmpInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -f webp -quality 85 "${tmpOutput}"`;
    }

    await execAsync(cmd);
    return await fs.promises.readFile(tmpOutput);
  } finally {
    await fs.promises.unlink(tmpInput).catch(() => {});
    await fs.promises.unlink(tmpOutput).catch(() => {});
  }
}

/**
 * Monta e envia um Sticker com Som (AudioSticker) no WhatsApp.
 * @param {import("baileys").WASocket} socket
 * @param {string} jid
 * @param {object} options
 * @param {Buffer} options.stickerBuffer
 * @param {Buffer} [options.audioBuffer]
 * @param {proto.Message.IAudioMessage} [options.existingAudioMessage]
 * @param {number} [options.audioSeconds=10]
 * @param {boolean} [options.isAnimated]
 * @param {object} [quotedMessage]
 * @returns {Promise<string>}
 */
export async function sendAudioSticker(socket, jid, options, quotedMessage) {
  installAudioStickerExtension();

  const stickerMedia = await prepareWAMessageMedia(
    { sticker: options.stickerBuffer },
    { upload: socket.waUploadToServer }
  );

  if (!stickerMedia.stickerMessage) {
    throw new Error("Falha no upload do sticker no servidor do WhatsApp.");
  }

  const firstFrameLength = extractFirstFrameLength(options.stickerBuffer);
  const isAnimated = options.isAnimated ?? (firstFrameLength !== null);

  const stickerNode = stickerMedia.stickerMessage;
  stickerNode.isAnimated = isAnimated;
  if (firstFrameLength) {
    stickerNode.firstFrameLength = firstFrameLength;
  }

  if (quotedMessage?.key?.id) {
    const participant = quotedMessage.key.participant || quotedMessage.key.remoteJid;
    stickerNode.contextInfo = {
      stanzaId: quotedMessage.key.id,
      ...(participant ? { participant } : {}),
      ...(quotedMessage.message ? { quotedMessage: quotedMessage.message } : {}),
    };
  }

  let audioMessage;
  if (options.existingAudioMessage) {
    audioMessage = options.existingAudioMessage;
  } else if (options.audioBuffer) {
    const uploadedAudio = await prepareWAMessageMedia(
      { audio: options.audioBuffer, mimetype: "audio/ogg; codecs=opus", ptt: false },
      { upload: socket.waUploadToServer }
    );
    if (!uploadedAudio.audioMessage) {
      throw new Error("Falha no upload do áudio no servidor do WhatsApp.");
    }
    audioMessage = {
      ...uploadedAudio.audioMessage,
      mimetype: "audio/ogg; codecs=opus",
      seconds: options.audioSeconds || 10,
    };
  } else {
    throw new Error("Nenhum áudio fornecido para compor a figurinha com som.");
  }

  stickerNode.audioMessage = audioMessage;

  const payload = {
    audioStickerMessage: {
      message: {
        stickerMessage: stickerNode,
      },
    },
    messageContextInfo: {
      messageSecret: crypto.randomBytes(32),
    },
  };

  const messageId = socket.generateMessageTag();
  await socket.relayMessage(jid, payload, { messageId });

  infoLog(`[AudioSticker] Figurinha com som enviada com sucesso para ${jid} (id: ${messageId})`);
  return messageId;
}
