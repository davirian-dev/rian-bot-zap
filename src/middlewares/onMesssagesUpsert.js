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
import { getAiResponse, recordMessage } from "../services/aiChatbot.js";
import { capturarLead } from "../services/leadCaptor.js";
import { registrarAtividadeMensagem, verificarRegraVisualizacaoUnica } from "../services/groupActivityTracker.js";
import { isMensagemTriagem, responderTriagemOficial } from "../services/triagemHandler.js";

// Timestamp de inicialização do processo (mensagens enviadas antes disso nunca serão respondidas)
const BOT_START_TIME = Date.now();

// Cache de deduplicação de mensagens (evita processar a mesma mensagem duas vezes)
const processedMessageIds = new Set();

// Cache de IDs de mensagens enviadas pelo próprio BOT (para nunca confundir mensagem do bot com mensagem digitada por Davi/Mari)
const botSentMessageIds = new Set();

// Fila de agrupamento (debounce) por usuário para SEMPRE enviar APENAS UMA MENSAGEM
const userDebounceMap = new Map();

// Mapa de Atendimento Humano (remoteJid -> timestamp limite de pausa)
// Quando Davi ou Mari respondem no PV pelo celular, o bot pausa para aquele contato por 5 minutos
const humanPauseMap = new Map();
const PAUSE_DURATION_MS = 5 * 60 * 1000; // 5 minutos (configurado a pedido de Davi & Mari)

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

        // Se o remoteJid for o próprio número do bot (chat consigo mesmo ou sincronização), ignora
        if (remoteJid.includes("160602467102822")) {
          continue;
        }

        const rawText =
          webMessage?.message?.conversation ||
          webMessage?.message?.extendedTextMessage?.text ||
          webMessage?.message?.imageMessage?.caption ||
          webMessage?.message?.videoMessage?.caption || "";
        const trimmed = rawText.trim();

        // 0. TRIAGEM OFICIAL TEM PRIORIDADE MÁXIMA E RESPOSTA IMEDIATA:
        // Se o cliente mandou a ficha de triagem oficial, responde na hora sem esperar nem pausar!
        if (trimmed && isMensagemTriagem(trimmed)) {
          infoLog(`[WhatsApp PV] Ficha de triagem oficial recebida de ${remoteJid}! Processando imediatamente...`);
          humanPauseMap.delete(remoteJid);
          try { capturarLead(remoteJid, trimmed); } catch (_) {}
          try { await socket.sendPresenceUpdate("composing", remoteJid); } catch (_) {}
          
          const respostaTriagem = responderTriagemOficial(remoteJid, trimmed);
          if (respostaTriagem && respostaTriagem.trim()) {
            const sentMsg = await socket.sendMessage(remoteJid, { text: respostaTriagem });
            if (sentMsg?.key?.id) {
              botSentMessageIds.add(sentMsg.key.id);
            }
            infoLog(`[WhatsApp PV] Resposta oficial de triagem entregue com sucesso para ${remoteJid} ✅`);
          }
          try { await socket.sendPresenceUpdate("paused", remoteJid); } catch (_) {}
          continue;
        }

        // 1. COMANDOS DO TAKESHI BOT COM PREFIXO (! ou /)
        // FUNCIONAM SEMPRE E INDEPENDENTEMENTE (mesmo se o contato estiver em pausa humana!)
        if (trimmed && (trimmed.startsWith("!") || trimmed.startsWith("/"))) {
          if (trimmed === "!bot on" || trimmed === "/bot on" || trimmed === "!ativar") {
            humanPauseMap.delete(remoteJid);
            infoLog(`[Atendimento Humano] Chatbot reativado manualmente para ${remoteJid}.`);
            const sent = await socket.sendMessage(remoteJid, { text: "✅ Chatbot reativado com sucesso para este contato!" });
            if (sent?.key?.id) botSentMessageIds.add(sent.key.id);
            continue;
          }
          if (trimmed === "!bot off" || trimmed === "/bot off" || trimmed === "!pausar") {
            humanPauseMap.set(remoteJid, Date.now() + PAUSE_DURATION_MS);
            infoLog(`[Atendimento Humano] Chatbot pausado manualmente para ${remoteJid} por 5 minutos.`);
            const sent = await socket.sendMessage(remoteJid, { text: "⏸️ Chatbot pausado por 5 minutos para este contato." });
            if (sent?.key?.id) botSentMessageIds.add(sent.key.id);
            continue;
          }

          infoLog(`[TakeshiBot PV] Executando comando com prefixo de ${remoteJid}: "${trimmed}"`);
          const commonFunctions = loadCommonFunctions({ socket, webMessage });
          if (commonFunctions) {
            await dynamicCommand(commonFunctions, startProcess);
            // Se o comando foi executado por você no PV (ex: !aprovado), pausa o chatbot para este contato por 10 minutos
            if (webMessage?.key?.fromMe) {
              humanPauseMap.set(remoteJid, Date.now() + 10 * 60 * 1000);
              infoLog(`[Atendimento Humano] Comando executado por você no PV. Chatbot pausado para ${remoteJid} por 10 minutos.`);
            }
            continue;
          }
        }

        // 2. SE A MENSAGEM FOI ENVIADA POR VOCÊ (fromMe = true):
        if (webMessage?.key?.fromMe) {
          // Se essa mensagem foi enviada pelo próprio BOT, NÃO é atendimento humano! Apenas ignora.
          if (msgId && botSentMessageIds.has(msgId)) {
            continue;
          }

          const msgTime = webMessage.messageTimestamp ? Number(webMessage.messageTimestamp) * 1000 : Date.now();
          const isRecentFromMe = (Date.now() - msgTime) < PAUSE_DURATION_MS;

          // Se você respondeu recentemente no celular (últimos 5 minutos), ativa o atendimento humano:
          if (isRecentFromMe) {
            // Cancela qualquer resposta de IA pendente para este contato
            if (userDebounceMap.has(remoteJid)) {
              const state = userDebounceMap.get(remoteJid);
              if (state.timer) clearTimeout(state.timer);
              state.messages = [];
              state.inFlight = false;
            }

            // Registra a mensagem de Davi/Mari no histórico da IA para ela sempre saber o contexto!
            if (trimmed) {
              recordMessage(remoteJid, "assistant", trimmed);
            }

            // Define a pausa de 5 minutos APENAS para este contato específico
            humanPauseMap.set(remoteJid, Date.now() + PAUSE_DURATION_MS);
            infoLog(`[Atendimento Humano] Você respondeu ${remoteJid} no celular há pouco. Chatbot pausado para este contato por 5 minutos.`);
          }
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
            infoLog(`[Atendimento Humano] Período de 5 minutos encerrado para ${remoteJid}. Chatbot reativado.`);
          }
        }

        // 4. MENSAGEM DE CONVERSA COMUM (PROCESSADA PELA IA DAVI & MARI)
        const msgTime = webMessage.messageTimestamp ? Number(webMessage.messageTimestamp) * 1000 : Date.now();
        // Ignora rigorosamente mensagens enviadas antes de o bot iniciar (evita ressuscitar conversas ou responder histórico)
        if (msgTime < (BOT_START_TIME - 15000)) {
          // Se for mensagem de triagem no histórico, apenas atualiza o banco de dados sem reenviar mensagem
          if (trimmed && isMensagemTriagem(trimmed)) {
            try { capturarLead(remoteJid, trimmed); } catch (_) {}
          }
          continue;
        }

        const isTooOld = (Date.now() - msgTime) > (2 * 60 * 60 * 1000); // Mais de 2 horas ignora
        if (isTooOld) {
          continue;
        }

        // 5. SE A PESSOA MANDOU FOTO, ÁUDIO, COMPROVANTE OU PDF:
        // Regra do Usuário: Se a pessoa mandou foto, comprovante, PDF ou áudio sem texto/dúvida clara,
        // o bot NÃO interfere e deixa para atendimento humano direto de Davi & Mari!
        const msgContent = webMessage?.message;
        const isMediaOnly = Boolean(
          (msgContent?.imageMessage && !msgContent?.imageMessage?.caption) ||
          msgContent?.audioMessage ||
          msgContent?.documentMessage ||
          msgContent?.documentWithCaptionMessage ||
          msgContent?.stickerMessage
        );

        if (isMediaOnly) {
          infoLog(`[Atendimento Humano] Mídia detectada (foto/áudio/PDF/comprovante) de ${remoteJid}. IA em silêncio para Davi & Mari atenderem.`);
          recordMessage(remoteJid, "user", "[Cliente enviou foto/áudio de confirmação anti-fake]");
          continue;
        }

        if (trimmed) {
          infoLog(`[Chatbot IA PV] Mensagem recebida de ${remoteJid}: "${trimmed}"`);

          // Capta automaticamente leads e dados de triagem para o painel em tempo real
          try {
            capturarLead(remoteJid, trimmed);
          } catch (leadErr) {
            errorLog(`[LeadCaptor] Erro ao captar lead: ${leadErr.message}`);
          }

          // Mostra presença digitando (composing)
          try {
            await socket.sendPresenceUpdate("composing", remoteJid);
          } catch (_) {}

          // Controle de Debounce com fila sequencial: agrupa mensagens e NUNCA manda duplicadas
          if (!userDebounceMap.has(remoteJid)) {
            userDebounceMap.set(remoteJid, { messages: [], timer: null, inFlight: false, lastResponseTime: 0 });
          }
          const userState = userDebounceMap.get(remoteJid);
          userState.messages.push(trimmed);

          const scheduleDebounce = () => {
            if (userState.timer) {
              clearTimeout(userState.timer);
            }

            userState.timer = setTimeout(async () => {
              if (userState.inFlight) {
                // Se já tem uma resposta sendo gerada, espera ela terminar e reagenda
                scheduleDebounce();
                return;
              }

              if (!userState.messages.length) return;

              userState.inFlight = true;
              try {
                const combinedText = userState.messages.join("\n");
                userState.messages = [];

                let respostaFinal = "";

                // SE O CLIENTE MANDOU A FICHA DE TRIAGEM OFICIAL PREENCHIDA:
                if (isMensagemTriagem(combinedText)) {
                  infoLog(`[WhatsApp PV] Triagem oficial detectada de ${remoteJid}. Respondendo com Handler Especializado...`);
                  respostaFinal = responderTriagemOficial(remoteJid, combinedText);
                } else {
                  infoLog(`[WhatsApp PV] Processando resposta inteligente com IA para ${remoteJid}...`);
                  respostaFinal = await getAiResponse(remoteJid, combinedText);
                }

                if (respostaFinal && respostaFinal.trim()) {
                  const sentMsg = await socket.sendMessage(remoteJid, { text: respostaFinal });
                  if (sentMsg?.key?.id) {
                    botSentMessageIds.add(sentMsg.key.id);
                    if (botSentMessageIds.size > 2000) {
                      const first = botSentMessageIds.values().next().value;
                      botSentMessageIds.delete(first);
                    }
                  }
                  userState.lastResponseTime = Date.now();
                  infoLog(`[WhatsApp PV] Mensagem única enviada com sucesso para ${remoteJid} ✅`);
                }

                try {
                  await socket.sendPresenceUpdate("paused", remoteJid);
                } catch (_) {}
              } catch (err) {
                errorLog(`[WhatsApp PV] Erro ao enviar resposta para ${remoteJid}: ${err.message}`);
              } finally {
                userState.inFlight = false;
                // Se chegaram novas mensagens enquanto a IA gerava a resposta anterior, agenda com intervalo seguro
                if (userState.messages.length > 0) {
                  userState.timer = setTimeout(scheduleDebounce, 3000);
                }
              }
            }, 2500);
          };

          scheduleDebounce();
        }
        continue;
      }

      const timestamp = webMessage.messageTimestamp;

      // Registra o envelope (id -> autor/estado) de TODA mensagem de grupo,
      // para corroborar marcações de pagamento e impedir forja (banir inocente).
      recordMessageEnvelope(webMessage, hasPaymentMessage(webMessage));

      // 1. Rastreia atividade de envio para classificar Ativo vs Observador
      registrarAtividadeMensagem(webMessage);

      // 2. Fiscaliza regra de nudes/mídias em grupos: obrigatoriedade de visualização única no Zap e incentivo ao Telegram
      await verificarRegraVisualizacaoUnica(socket, webMessage);

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
