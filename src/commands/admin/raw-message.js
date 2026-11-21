import { PREFIX } from "../../config.js";

/**
 * Serializador seguro para inspecionar payloads brutos do Baileys/WhatsApp
 * sem quebrar em Buffers ou BigInts.
 */
function safeSerialize(obj) {
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      if (value && value.type === "Buffer" && Array.isArray(value.data)) {
        return `<Buffer length=${value.data.length}>`;
      }
      if (Buffer.isBuffer(value)) {
        return `<Buffer length=${value.length}>`;
      }
      return value;
    },
    2
  );
}

export default {
  name: "raw-message",
  description: "Obtém dados brutos (JSON) da mensagem atual ou da mensagem respondida.",
  commands: ["raw-message", "raw"],
  usage: `${PREFIX}raw (responda a qualquer mensagem para ver o JSON dela ou envie direto)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ webMessage, isReply, sendReply }) => {
    let payloadToInspect = webMessage;

    // Se estiver respondendo a alguém, inspeciona o contextInfo e a mensagem citada
    if (isReply) {
      const contextInfo =
        webMessage.message?.extendedTextMessage?.contextInfo ||
        webMessage.message?.imageMessage?.contextInfo ||
        webMessage.message?.videoMessage?.contextInfo ||
        webMessage.message?.documentMessage?.contextInfo;

      if (contextInfo?.quotedMessage) {
        payloadToInspect = {
          stanzaId: contextInfo.stanzaId,
          participant: contextInfo.participant,
          quotedMessage: contextInfo.quotedMessage,
          fullContextInfo: contextInfo,
        };
      }
    }

    const jsonString = safeSerialize(payloadToInspect);

    // Se o JSON for muito longo para o WhatsApp, divide ou resume mantendo legibilidade
    if (jsonString.length > 3500) {
      const chunk = jsonString.slice(0, 3500);
      await sendReply(`🤖 *Payload Bruto (truncado):*\n\`\`\`json\n${chunk}\n...\n\`\`\``);
    } else {
      await sendReply(`🤖 *Payload Bruto:*\n\`\`\`json\n${jsonString}\n\`\`\``);
    }
  },
};
