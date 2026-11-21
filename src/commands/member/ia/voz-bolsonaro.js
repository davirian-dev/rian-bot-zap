import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { specialTts } from "../../../services/spider-x-api.js";

export default {
  name: "voz-bolsonaro",
  description: "Gera um áudio com a voz de IA do Bolsonaro (até 512 caracteres).",
  commands: ["vozbolsonaro", "bolsonarovoz", "voicebolsonaro", "bolsonarovoice"],
  usage: `${PREFIX}vozbolsonaro <texto> ou responda uma mensagem com ${PREFIX}vozbolsonaro`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    replyText,
    sendWaitReply,
    sendSuccessReact,
    sendAudioFromURL,
    prefix,
  }) => {
    const currentPrefix = prefix || PREFIX;
    const text = (fullArgs?.trim() || replyText?.trim() || "").trim();

    if (!text) {
      throw new InvalidParameterError(
        `Informe o texto ou responda a uma mensagem.\n\nExemplo: ${currentPrefix}vozbolsonaro E daí? Quer que eu faça o que? Tá ok?`,
      );
    }

    if (text.length > 512) {
      throw new InvalidParameterError(
        "O texto deve ter no máximo 512 caracteres.",
      );
    }

    await sendWaitReply("Gerando áudio...");

    const audioUrl = await specialTts(text, "bolsonaro");

    await sendSuccessReact();
    await sendAudioFromURL(audioUrl, true);
  },
};
