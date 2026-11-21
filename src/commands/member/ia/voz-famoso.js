import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { specialTts } from "../../../services/spider-x-api.js";

const VOZES_DISPONIVEIS = {
  lula: ["lula", "luiz", "petista"],
  bolsonaro: ["bolsonaro", "mito", "jair"],
};

export default {
  name: "voz-famoso",
  description: "Gera áudio de voz de famoso com inteligência artificial.",
  commands: ["vozfamoso", "famosovoz", "vozes"],
  usage: `${PREFIX}vozfamoso <lula|bolsonaro> <texto>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    fullArgs,
    sendWaitReply,
    sendSuccessReact,
    sendAudioFromURL,
    sendReply,
    prefix,
  }) => {
    const currentPrefix = prefix || PREFIX;

    if (!args.length || args[0].toLowerCase() === "ajuda" || args[0].toLowerCase() === "lista") {
      return sendReply(
        `🎙️ *Vozes de Famosos Disponíveis:*\n\n` +
          `• *${currentPrefix}vozlula <texto>* (ou ${currentPrefix}lulavoz)\n` +
          `• *${currentPrefix}vozbolsonaro <texto>* (ou ${currentPrefix}bolsonarovoz)\n` +
          `• *${currentPrefix}vozfamoso <lula|bolsonaro> <texto>*\n\n` +
          `💡 *Exemplo:* \n` +
          `${currentPrefix}vozlula Companheiros, o amor venceu!\n` +
          `${currentPrefix}vozbolsonaro Olha que papelão, talkei?`,
      );
    }

    const requestedVoice = args[0].toLowerCase();
    let selectedVoice = null;

    if (VOZES_DISPONIVEIS.lula.includes(requestedVoice)) {
      selectedVoice = "lula";
    } else if (VOZES_DISPONIVEIS.bolsonaro.includes(requestedVoice)) {
      selectedVoice = "bolsonaro";
    }

    if (!selectedVoice) {
      throw new InvalidParameterError(
        `Voz não encontrada!\n\nVozes disponíveis: *lula* e *bolsonaro*.\nExemplo: ${currentPrefix}vozfamoso lula Olá povo brasileiro!`,
      );
    }

    // Pega o restante da mensagem após o nome da voz
    const text = fullArgs.slice(args[0].length).trim();

    if (!text) {
      throw new InvalidParameterError(
        `Informe o texto a ser falado!\nExemplo: ${currentPrefix}vozfamoso ${selectedVoice} Olá a todos!`,
      );
    }

    if (text.length > 512) {
      throw new InvalidParameterError(
        "O texto deve ter no máximo 512 caracteres.",
      );
    }

    await sendWaitReply("Gerando áudio...");

    const audioUrl = await specialTts(text, selectedVoice);

    await sendSuccessReact();
    await sendAudioFromURL(audioUrl, true);
  },
};
