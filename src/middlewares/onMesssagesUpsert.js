// Middleware de mensagens e atendimento oficial Club Casalzaum

/**
 * Evento chamado quando uma mensagem
 * é enviada para o grupo do WhatsApp
 *
 * @author Dev Gui
 */
import { DEVELOPER_MODE } from "../config.js";
import { badMacHandler } from "../utils/badMacHandler.js";
import { checkIfMemberIsMuted } from "../utils/database.js";
import { dynamicCommand } from "../utils/dynamicCommand.js";
import {
  GROUP_PARTICIPANT_ADD,
  GROUP_PARTICIPANT_LEAVE,
  isAddOrLeave,
  isAtLeastMinutesInPast,
} from "../utils/index.js";
import { loadCommonFunctions } from "../utils/loadCommonFunctions.js";
import { errorLog, infoLog } from "../utils/logger.js";
import { customMiddleware } from "./customMiddleware.js";
import { messageHandler } from "./messageHandler.js";
import { recordMessageEnvelope } from "../utils/messageEnvelopeRegistry.js";
import { hasPaymentMessage } from "../utils/paymentMessage.js";
import { handleAfkReferences } from "./afkHandler.js";
import { onGroupParticipantsUpdate } from "./onGroupParticipantsUpdate.js";
import { getAiResponse } from "../services/aiChatbot.js";

// Cache de deduplicação de mensagens (evita processar a mesma mensagem duas vezes)
const processedMessageIds = new Set();

// Fila de agrupamento (debounce) por usuário para SEMPRE enviar APENAS UMA MENSAGEM
const userDebounceMap = new Map();

// Mapa de Atendimento Humano (remoteJid -> timestamp limite de pausa)
// Sempre que Davi ou Mari respondem no PV, o bot pausa para aquele contato por 30 minutos
const humanPauseMap = new Map();
const PAUSE_DURATION_MS = 30 * 60 * 1000; // 30 minutos

export async function onMessagesUpsert({ socket, messages, startProcess }) {
  if (!messages.length) {
    return;
  }

  for (const webMessage of messages) {
    // 1. Deduplicação por ID de mensagem (impede duplicidade do Baileys/WhatsApp)
    const msgId = webMessage?.key?.id;
    if (msgId) {
      if (processedMessageIds.has(msgId)) {
        continue;
      }
      processedMessageIds.add(msgId);
      if (processedMessageIds.size > 2000) {
        const first = processedMessageIds.values().next().value;
        processedMessageIds.delete(first);
      }
    }

    if (DEVELOPER_MODE) {
      infoLog(
        `\n\n⪨========== [ MENSAGEM RECEBIDA ] ==========⪩ \n\n${JSON.stringify(
          messages,
          null,
          2,
        )}`,
      );
    }

    try {
      // ATENDIMENTO NO PRIVADO COM IA (Mari & Davi) + SUPORTE A COMANDOS
      if (!webMessage?.key?.remoteJid?.endsWith("@g.us") && webMessage?.key?.remoteJid !== "status@broadcast") {
        const remoteJid = webMessage.key.remoteJid;

        const rawText =
          webMessage?.message?.conversation ||
          webMessage?.message?.extendedTextMessage?.text ||
          webMessage?.message?.imageMessage?.caption ||
          webMessage?.message?.videoMessage?.caption || "";
        const trimmed = rawText.trim();

        // 1. COMANDOS DO TAKESHI BOT COM PREFIXO (! ou /)
        // FUNCIONAM SEMPRE E INDEPENDENTEMENTE (mesmo se o contato estiver em pausa humana!)
        if (trimmed && (trimmed.startsWith("!") || trimmed.startsWith("/"))) {
          if (trimmed === "!bot on" || trimmed === "/bot on" || trimmed === "!ativar") {
            humanPauseMap.delete(remoteJid);
            infoLog(`[Atendimento Humano] Chatbot reativado manualmente para ${remoteJid}.`);
            await socket.sendMessage(remoteJid, { text: "✅ Chatbot reativado com sucesso para este contato!" });
            continue;
          }
          if (trimmed === "!bot off" || trimmed === "/bot off" || trimmed === "!pausar") {
            humanPauseMap.set(remoteJid, Date.now() + PAUSE_DURATION_MS);
            infoLog(`[Atendimento Humano] Chatbot pausado manualmente para ${remoteJid} por 30 minutos.`);
            await socket.sendMessage(remoteJid, { text: "⏸️ Chatbot pausado por 30 minutos para este contato." });
            continue;
          }

          infoLog(`[TakeshiBot PV] Executando comando com prefixo de ${remoteJid}: "${trimmed}"`);
          const commonFunctions = loadCommonFunctions({ socket, webMessage });
          if (commonFunctions) {
            await dynamicCommand(commonFunctions, startProcess);
            continue;
          }
        }

        // 2. SE A MENSAGEM FOI ENVIADA POR VOCÊ (fromMe = true):
        // Pausa o chatbot para este contato específico por 30 minutos para você conversar sem interferência
        if (webMessage?.key?.fromMe) {
          // Cancela qualquer resposta de IA pendente para este contato
          if (userDebounceMap.has(remoteJid)) {
            const state = userDebounceMap.get(remoteJid);
            if (state.timer) clearTimeout(state.timer);
            state.messages = [];
            state.inFlight = false;
          }

          // Define ou renova a pausa de 30 minutos para este contato
          humanPauseMap.set(remoteJid, Date.now() + PAUSE_DURATION_MS);
          infoLog(`[Atendimento Humano] Você respondeu ${remoteJid}. Chatbot pausado para este contato por 30 minutos.`);
          continue;
        }

        // 3. SE ESTE CONTATO ESPECÍFICO ESTIVER EM ATENDIMENTO HUMANO (PAUSADO):
        const pauseUntil = humanPauseMap.get(remoteJid);
        if (pauseUntil) {
          if (Date.now() < pauseUntil) {
            const minutosRestantes = Math.ceil((pauseUntil - Date.now()) / (60 * 1000));
            infoLog(`[Atendimento Humano] ${remoteJid} enviou mensagem normal, mas o chatbot de IA está em silêncio (em atendimento humano por mais ${minutosRestantes} min).`);
            continue; // O bot NÃO interfere na conversa normal!
          } else {
            humanPauseMap.delete(remoteJid);
            infoLog(`[Atendimento Humano] Período de 30 minutos encerrado para ${remoteJid}. Chatbot reativado.`);
          }
        }

        // 4. MENSAGEM DE CONVERSA COMUM (PROCESSADA PELA IA DAVI & MARI)
        if (trimmed) {
          infoLog(`[Chatbot IA PV] Mensagem recebida de ${remoteJid}: "${trimmed}"`);

          // Mostra presença digitando (composing)
          try {
            await socket.sendPresenceUpdate("composing", remoteJid);
          } catch (_) {}

          // Controle de Debounce: agrupa mensagens enviadas em sequência pelo cliente
          if (!userDebounceMap.has(remoteJid)) {
            userDebounceMap.set(remoteJid, { messages: [], timer: null, inFlight: false });
          }
          const userState = userDebounceMap.get(remoteJid);
          userState.messages.push(trimmed);

          if (userState.timer) {
            clearTimeout(userState.timer);
          }

          // Aguarda o cliente terminar de mandar as frases (2.5s) para enviar APENAS UMA RESPOSTA
          userState.timer = setTimeout(async () => {
            if (userState.inFlight) {
              return;
            }
            userState.inFlight = true;
            try {
              const combinedText = userState.messages.join("\n");
              userState.messages = [];

              infoLog(`[WhatsApp PV] Processando resposta única para ${remoteJid}...`);
              const aiReply = await getAiResponse(remoteJid, combinedText);

              // Envia RIGOROSAMENTE APENAS UMA MENSAGEM e encerra
              await socket.sendMessage(remoteJid, { text: aiReply });
              infoLog(`[WhatsApp PV] Mensagem única enviada com sucesso para ${remoteJid} ✅`);

              try {
                await socket.sendPresenceUpdate("paused", remoteJid);
              } catch (_) {}
            } catch (err) {
              errorLog(`[WhatsApp PV] Erro ao enviar resposta para ${remoteJid}: ${err.message}`);
            } finally {
              userState.inFlight = false;
            }
          }, 2500);
        }
        continue;
      }

      const timestamp = webMessage.messageTimestamp;

      // Registra o envelope (id -> autor/estado) de TODA mensagem de grupo,
      // para corroborar marcações de pagamento e impedir forja (banir inocente).
      recordMessageEnvelope(webMessage, hasPaymentMessage(webMessage));

      if (webMessage?.message) {
        messageHandler(socket, webMessage);
      }

      if (isAtLeastMinutesInPast(timestamp)) {
        continue;
      }

      if (isAddOrLeave.includes(webMessage.messageStubType)) {
        let action = "";
        if (webMessage.messageStubType === GROUP_PARTICIPANT_ADD) {
          action = "add";
        } else if (webMessage.messageStubType === GROUP_PARTICIPANT_LEAVE) {
          action = "remove";
        }

        await customMiddleware({
          socket,
          webMessage,
          type: "participant",
          action,
          data: webMessage.messageStubParameters[0],
          commonFunctions: null,
        });

        await onGroupParticipantsUpdate({
          data: webMessage.messageStubParameters[0],
          remoteJid: webMessage.key.remoteJid,
          socket,
          action,
        });

        return;
      }
      if (
        checkIfMemberIsMuted(
          webMessage?.key?.remoteJid,
          webMessage?.key?.participant?.replace(/:[0-9][0-9]|:[0-9]/g, ""),
        )
      ) {
        try {
          const { id, remoteJid, participant } = webMessage.key;

          const deleteKey = {
            remoteJid,
            fromMe: false,
            id,
            participant,
          };

          await socket.sendMessage(remoteJid, { delete: deleteKey });
        } catch (error) {
          errorLog(
            `Erro ao deletar mensagem de membro silenciado, provavelmente eu não sou administrador do grupo! ${error.message}`,
          );
        }

        return;
      }

      const commonFunctions = loadCommonFunctions({ socket, webMessage });

      if (!commonFunctions) {
        continue;
      }

      await customMiddleware({
        socket,
        webMessage,
        type: "message",
        commonFunctions,
      });

      await handleAfkReferences({ webMessage, commonFunctions });

      await dynamicCommand(commonFunctions, startProcess);
    } catch (error) {
      if (badMacHandler.handleError(error, "message-processing")) {
        continue;
      }

      if (badMacHandler.isSessionError(error)) {
        errorLog(`Erro de sessão ao processar mensagem: ${error.message}`);
        continue;
      }

      errorLog(
        `Erro ao processar mensagem: ${error.message} | Stack: ${error.stack}`,
      );

      continue;
    }
  }
}
