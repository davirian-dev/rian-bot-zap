import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  generateWAMessageFromContent,
  jidNormalizedUser,
  prepareWAMessageMedia,
  proto,
} from "baileys";
import { getBuffer } from "../utils/index.js";
import { errorLog, infoLog } from "../utils/logger.js";

/**
 * Extrai o tamanho do primeiro frame de um arquivo WebP animado.
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
 * Resolve a chave (MessageKey) da mensagem alvo para associar a reação.
 * @param {string} chatId
 * @param {object} targetKey
 * @returns {proto.IMessageKey}
 */
export function resolveTargetKey(chatId, targetKey) {
  if (!targetKey || !targetKey.id) {
    throw new Error("Chave de mensagem inválida: id da mensagem alvo é obrigatório.");
  }

  const isGroup = chatId.endsWith("@g.us");
  const remoteJid = targetKey.remoteJid || chatId;
  const fromMe = Boolean(targetKey.fromMe);

  let participant;
  if (isGroup && !fromMe) {
    participant = targetKey.participant ? jidNormalizedUser(targetKey.participant) : undefined;
  }

  return {
    remoteJid,
    fromMe,
    id: targetKey.id,
    ...(participant ? { participant } : {}),
  };
}

/**
 * Prepara o objeto IStickerMessage com upload e derivação criptográfica (se animado).
 * @param {import("baileys").WASocket} socket
 * @param {Buffer|string|proto.Message.IStickerMessage} source
 * @param {boolean} [isAnimatedOverride]
 * @returns {Promise<proto.Message.IStickerMessage>}
 */
export async function prepareStickerMessage(socket, source, isAnimatedOverride) {
  if (
    typeof source === "object" &&
    source !== null &&
    !Buffer.isBuffer(source) &&
    "fileSha256" in source &&
    "mediaKey" in source
  ) {
    const node = { ...source };
    node.height = node.height || 64;
    node.width = node.width || 64;
    node.mimetype = node.mimetype || "image/webp";
    node.isAvatar = Boolean(node.isAvatar);
    node.isAiSticker = Boolean(node.isAiSticker);
    node.isLottie = Boolean(node.isLottie);
    node.contextInfo = node.contextInfo || {};
    node.stickerSentTs = node.stickerSentTs || Date.now();
    return node;
  }

  let buffer;

  if (Buffer.isBuffer(source)) {
    buffer = source;
  } else if (typeof source === "string") {
    if (source.startsWith("http://") || source.startsWith("https://")) {
      buffer = await getBuffer(source);
    } else if (fs.existsSync(source)) {
      buffer = await fs.promises.readFile(source);
    } else {
      throw new Error(`Arquivo de figurinha não encontrado: ${source}`);
    }
  } else if (typeof source === "object" && source?.url) {
    buffer = await getBuffer(source.url);
  } else {
    throw new Error("Fonte de figurinha inválida fornecida.");
  }

  const isAnimated =
    isAnimatedOverride !== undefined
      ? isAnimatedOverride
      : buffer.includes(Buffer.from("ANMF")) || buffer.includes(Buffer.from("ANIM"));

  if (isAnimated) {
    const firstFrameLen = extractFirstFrameLength(buffer);
    if (firstFrameLen && firstFrameLen > 0 && firstFrameLen < buffer.length) {
      const tempFilePath = path.join(
        os.tmpdir(),
        `sticker_rx_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`
      );
      await fs.promises.writeFile(tempFilePath, buffer);

      try {
        const preparedMedia = await prepareWAMessageMedia(
          { sticker: { url: tempFilePath } },
          {
            upload: socket.waUploadToServer,
            mediaTypeOverride: "sticker",
          }
        );

        if (preparedMedia.stickerMessage) {
          const node = preparedMedia.stickerMessage;
          node.height = 64;
          node.width = 64;
          node.mimetype = "image/webp";
          node.isAnimated = true;
          node.isAvatar = false;
          node.isAiSticker = false;
          node.isLottie = false;
          node.contextInfo = node.contextInfo || {};
          node.stickerSentTs = Date.now();
          node.firstFrameLength = firstFrameLen;

          if (!node.url && node.directPath) {
            node.url = `https://mmg.whatsapp.net${node.directPath}`;
          }

          if (node.mediaKey) {
            const mediaKeyBuf = Buffer.isBuffer(node.mediaKey)
              ? node.mediaKey
              : Buffer.from(node.mediaKey);

            try {
              const hkdfKey = crypto.hkdfSync(
                "sha256",
                mediaKeyBuf,
                Buffer.alloc(32),
                Buffer.from("WhatsApp Image Keys"),
                112
              );

              const encKey = Buffer.from(hkdfKey.subarray(0, 32));
              const firstFrameBuf = buffer.subarray(0, firstFrameLen);

              const iv = Buffer.alloc(16, 0);
              const cipher = crypto.createCipheriv("aes-256-cbc", encKey, iv);
              const encFirstFrame = Buffer.concat([
                cipher.update(firstFrameBuf),
                cipher.final(),
              ]);

              const macKey = Buffer.from(hkdfKey.subarray(32, 64));
              const hmac = crypto.createHmac("sha256", macKey);
              hmac.update(Buffer.concat([iv, encFirstFrame]));
              node.firstFrameSidecar = hmac.digest().subarray(0, 10);
            } catch (sidecarErr) {
              errorLog(`[StickerReaction] Falha ao derivar firstFrameSidecar: ${sidecarErr.message}`);
            }
          }

          return node;
        }
      } finally {
        await fs.promises.unlink(tempFilePath).catch(() => {});
      }
    }
  }

  const preparedMedia = await prepareWAMessageMedia(
    { sticker: buffer },
    {
      upload: socket.waUploadToServer,
      mediaTypeOverride: "sticker",
    }
  );

  if (!preparedMedia.stickerMessage) {
    throw new Error("Falha ao processar e fazer upload da figurinha no servidor do WhatsApp.");
  }

  const stickerNode = preparedMedia.stickerMessage;
  stickerNode.height = 64;
  stickerNode.width = 64;
  stickerNode.mimetype = "image/webp";

  if (!stickerNode.url && stickerNode.directPath) {
    stickerNode.url = `https://mmg.whatsapp.net${stickerNode.directPath}`;
  }

  stickerNode.isAnimated = false;
  stickerNode.isAvatar = false;
  stickerNode.isAiSticker = false;
  stickerNode.isLottie = false;
  stickerNode.contextInfo = stickerNode.contextInfo || {};
  stickerNode.stickerSentTs = Date.now();

  return stickerNode;
}

/**
 * Envia uma reação com figurinha (Sticker Annotation) para a mensagem alvo.
 * @param {import("baileys").WASocket} socket
 * @param {string} chatId
 * @param {proto.IMessageKey} targetKey
 * @param {Buffer|string|proto.Message.IStickerMessage} stickerSource
 * @param {object} [options]
 * @param {number} [options.count=1] Quantidade de vezes para reagir (1 a 20)
 * @param {number} [options.delayMs=300] Intervalo em ms entre reações
 * @param {boolean} [options.isAnimated] Forçar flag de animação
 * @returns {Promise<Array<{ messageId: string, parentKey: proto.IMessageKey }>>}
 */
export async function sendStickerReaction(socket, chatId, targetKey, stickerSource, options = {}) {
  if (!socket) {
    throw new Error("Socket do Baileys não fornecido para sendStickerReaction.");
  }

  const count = Math.max(1, Math.min(Number(options.count) || 1, 20));
  const delayMs = Number(options.delayMs) || 300;
  const parentKey = resolveTargetKey(chatId, targetKey);
  const stickerMessage = await prepareStickerMessage(socket, stickerSource, options.isAnimated);

  infoLog(`[StickerReaction] Enviando ${count} reação(ões) com sticker para mensagem ${parentKey.id} no chat ${chatId}`);

  const results = [];

  for (let i = 0; i < count; i++) {
    const content = proto.Message.fromObject({
      messageContextInfo: {
        messageSecret: crypto.randomBytes(32),
        messageAssociation: {
          associationType: proto.MessageAssociation.AssociationType.STICKER_ANNOTATION,
          parentMessageKey: parentKey,
        },
      },
      associatedChildMessage: {
        message: {
          stickerMessage,
        },
      },
    });

    const reactionMsg = generateWAMessageFromContent(chatId, content, {
      userJid: socket.user?.id || "",
    });

    const messageId = reactionMsg.key.id;

    await socket.relayMessage(chatId, reactionMsg.message, {
      messageId,
      additionalAttributes: {
        type: "text",
      },
    });

    results.push({
      messageId,
      parentKey,
    });

    if (i < count - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
