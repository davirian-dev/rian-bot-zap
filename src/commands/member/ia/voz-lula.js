import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { specialTts } from "../../../services/spider-x-api.js";

export default {
  name: "voz-lula",
  description: "Gera um áudio com a voz de IA do Lula (até 512 caracteres).",
  commands: ["vozlula", "lulavoz", "voicelula", "lulavoice"],
  usage: `${PREFIX}vozlula <texto> ou responda uma mensagem com ${PREFIX}vozlula`,
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
        `Informe o texto ou responda a uma mensagem.\n\nExemplo: ${currentPrefix}vozlula Companheiros e companheiras do Brasil!`,
      );
    }

    if (text.length > 512) {
      throw new InvalidParameterError(
        "O texto deve ter no máximo 512 caracteres.",
      );
    }

    await sendWaitReply("Gerando áudio...");

    const audioUrl = await specialTts(text, "lula");

    await sendSuccessReact();
    await sendAudioFromURL(audioUrl, true);
  },
};
