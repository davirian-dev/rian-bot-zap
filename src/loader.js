/**
 * Este script é responsável
 * por carregar os eventos
 * que serão escutados pelo
 * socket do WhatsApp.
 *
 * @author Dev Gui
 */
import { onCall } from "./middlewares/onCall.js";
import { onMessagesUpsert } from "./middlewares/onMesssagesUpsert.js";
import { badMacHandler } from "./utils/badMacHandler.js";
import { errorLog, infoLog } from "./utils/logger.js";
import { processPendingConversations } from "./services/pendingResponder.js";

export function load(socket) {
  const safeEventHandler = async (callback, data, eventName) => {
    try {
      await callback(data);
    } catch (error) {
      if (badMacHandler.handleError(error, eventName)) {
        return;
      }
      errorLog(`Erro ao processar evento ${eventName}: ${error.message}`);
      if (error.stack) {
        errorLog(`Stack trace: ${error.stack}`);
      }
    }
  };

  // Escuta histórico inicial sincronizado (HistorySync) para responder pendências antigas/recentes sem resposta
  socket.ev.on("messaging-history.set", async (data) => {
    infoLog(`[History Sync] Histórico recebido: ${data?.chats?.length || 0} chats, ${data?.messages?.length || 0} mensagens.`);
    safeEventHandler(
      () => processPendingConversations(socket, data.messages, data.chats),
      data,
      "messaging-history.set"
    );
  });

  socket.ev.on("messages.upsert", async (data) => {
    const startProcess = Date.now();
    safeEventHandler(
      () =>
        onMessagesUpsert({
          socket,
          messages: data.messages,
          startProcess,
        }),
      data,
      "messages.upsert",
    );
  });

  socket.ev.process((events) => {
    if (events?.call?.length) {
      safeEventHandler(
        () => onCall({ socket, calls: events.call }),
        events.call,
        "call",
      );
    }
  });

  process.on("uncaughtException", (error) => {
    if (badMacHandler.handleError(error, "uncaughtException")) {
      return;
    }
    errorLog(`Erro não capturado: ${error.message}`);
  });

  process.on("unhandledRejection", (reason) => {
    if (badMacHandler.handleError(reason, "unhandledRejection")) {
      return;
    }
    errorLog(`Promessa rejeitada não tratada: ${reason}`);
  });
}
