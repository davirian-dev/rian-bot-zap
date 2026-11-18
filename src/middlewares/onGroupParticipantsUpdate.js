/**
 * Evento chamado quando um usuário
 * entra ou sai de um grupo de WhatsApp.
 *
 * @author Dev Gui
 */
import { exitMessage, welcomeMessage } from "../messages.js";
import { obterMensagemBoasVindasGrupo } from "../services/groupWelcomeSelector.js";
import { obterMensagemSaidaGrupo } from "../services/groupExitSelector.js";
import {
  isActiveExitGroup,
  isActiveGroup,
  isActiveWelcomeGroup,
} from "../utils/database.js";
import { extractUserLid, onlyNumbers } from "../utils/index.js";
import { errorLog } from "../utils/logger.js";

export async function onGroupParticipantsUpdate({
  data,
  remoteJid,
  socket,
  action,
}) {
  try {
    if (!remoteJid.endsWith("@g.us")) {
      return;
    }

    if (!isActiveGroup(remoteJid)) {
      return;
    }

    const userLid = extractUserLid(data);

    if (isActiveWelcomeGroup(remoteJid) && action === "add") {
      let grupoNome = "";
      try {
        const meta = await socket.groupMetadata(remoteJid);
        if (meta && meta.subject) {
          grupoNome = meta.subject;
        }
      } catch (_) {}

      // Seleciona a mensagem especializada para o grupo específico (Portaria, Geral, Casais, etc.)
      const templateWelcome = grupoNome ? obterMensagemBoasVindasGrupo(grupoNome) : welcomeMessage;
      const hasMemberMention = templateWelcome.includes("@member");

      const mentions = [];
      let finalWelcomeMessage = templateWelcome;

      if (hasMemberMention) {
        const userNumber = onlyNumbers(userLid);
        finalWelcomeMessage = templateWelcome.replace(
          "@member",
          `@${userNumber}`,
        );
        mentions.push(userLid);
      }

      await socket.sendMessage(remoteJid, {
        text: finalWelcomeMessage,
        mentions,
      });
    } else if (isActiveExitGroup(remoteJid) && action === "remove") {
      let grupoNome = "";
      try {
        const meta = await socket.groupMetadata(remoteJid);
        if (meta && meta.subject) {
          grupoNome = meta.subject;
        }
      } catch (_) {}

      // Seleciona a mensagem especializada de saída para o grupo específico (Portaria, Geral, etc.)
      const templateExit = grupoNome ? obterMensagemSaidaGrupo(grupoNome) : exitMessage;
      const hasMemberMention = templateExit.includes("@member");

      const mentions = [];
      let finalExitMessage = templateExit;

      if (hasMemberMention) {
        const userNumber = onlyNumbers(userLid);
        finalExitMessage = templateExit.replace("@member", `@${userNumber}`);
        mentions.push(userLid);
      }

      await socket.sendMessage(remoteJid, {
        text: finalExitMessage,
        mentions,
      });
    }
  } catch (error) {
    errorLog(`Erro em onGroupParticipantsUpdate: ${error.message}`);
    errorLog(JSON.stringify(error, null, 2));
  }
}
