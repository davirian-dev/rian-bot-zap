/**
 * Script de
 * inicialização do bot.
 *
 * Este script é
 * responsável por
 * iniciar a conexão
 * com o WhatsApp.
 *
 * Não é recomendado alterar
 * este arquivo,
 * a menos que você saiba
 * o que está fazendo.
 *
 * @author Dev Gui
 */
import makeWASocket, {
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidNewsletter,
  isJidStatusBroadcast,
  useMultiFileAuthState,
} from "baileys";
import NodeCache from "node-cache";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pino from "pino";
import { PREFIX, TEMP_DIR } from "./config.js";
import { load } from "./loader.js";
import { badMacHandler } from "./utils/badMacHandler.js";
import { onlyNumbers, question } from "./utils/index.js";
import {
  bannerLog,
  errorLog,
  infoLog,
  successLog,
  warningLog,
} from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const logger = pino(
  { timestamp: () => `,"time":"${new Date().toJSON()}"` },
  pino.destination(path.join(TEMP_DIR, "wa-logs.txt")),
);

logger.level = "error";

const msgRetryCounterCache = new NodeCache();

function formatPairingCode(code) {
  if (!code) return code;

  return code?.match(/.{1,4}/g)?.join("-") || code;
}

function clearScreenWithBanner() {
  console.clear();
  bannerLog();
}

let activeSocket = null;
export function getActiveSocket() {
  return activeSocket;
}
let watchdogInterval = null;
let isReconnecting = false;

async function triggerSafeReconnect() {
  if (isReconnecting) return;
  isReconnecting = true;
  warningLog("[Watchdog 24/7] Reiniciando conexão com WhatsApp de forma limpa...");

  if (watchdogInterval) {
    clearInterval(watchdogInterval);
    watchdogInterval = null;
  }

  try {
    if (activeSocket) {
      try {
        activeSocket.end(new Error("Watchdog reconnect"));
      } catch (_) {}
    }
  } catch (_) {}

  await delay(2000);

  try {
    const newSocket = await connect();
    load(newSocket);
    infoLog("[Watchdog 24/7] Conexão restabelecida com sucesso!");
  } catch (err) {
    errorLog(`[Watchdog 24/7] Erro ao restabelecer conexão: ${err.message}. Tentando novamente em 4s...`);
    setTimeout(triggerSafeReconnect, 4000);
  } finally {
    isReconnecting = false;
  }
}

export async function connect() {
  const baileysFolder = path.resolve(
    __dirname,
    "..",
    "assets",
    "auth",
    "baileys",
  );

  const { state, saveCreds } = await useMultiFileAuthState(baileysFolder);

  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    logger,
    defaultQueryTimeoutMs: undefined,
    retryRequestDelayMs: 5000,
    auth: state,
    shouldIgnoreJid: (jid) =>
      isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    connectTimeoutMs: 30_000,
    keepAliveIntervalMs: 25_000,
    maxMsgRetryCount: 5,
    markOnlineOnConnect: true,
    syncFullHistory: true,
    emitOwnEvents: false,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => true,
  });

  activeSocket = socket;

  // Inicia o Watchdog 24/7 para verificar a saúde do WebSocket a cada 60 segundos
  if (watchdogInterval) clearInterval(watchdogInterval);
  watchdogInterval = setInterval(() => {
    try {
      if (socket && socket.ws) {
        // readyState: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
        const state = socket.ws?.readyState ?? socket.ws?.socket?.readyState;
        if (state !== undefined && state !== 1 && state !== 0 && !isReconnecting) {
          warningLog(`[Watchdog 24/7] WebSocket desconectado (readyState: ${state}). Disparando reconexão limpa...`);
          triggerSafeReconnect();
        }
      }
    } catch (e) {
      warningLog(`[Watchdog 24/7] Falha na checagem de socket: ${e.message}`);
    }
  }, 60_000);

  if (!socket.authState.creds.registered) {
    clearScreenWithBanner();
    console.log(
      'Informe o número do bot (SP/RJ exigem 9º dígito). \nExemplo: "+5511912345678", demais estados: "+554112345678":',
    );

    const phoneNumber = await question("Número: ");

    if (!phoneNumber) {
      errorLog(
        'Número de telefone inválido! Tente novamente com o comando "npm start".',
      );

      process.exit(1);
    }

    await delay(4000);
    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));

    console.log(`Código de pareamento: ${formatPairingCode(code)}`);
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const error = lastDisconnect?.error;
      const statusCode = error?.output?.statusCode;

      if (
        error?.message?.includes("Bad MAC") ||
        error?.toString()?.includes("Bad MAC")
      ) {
        errorLog("Bad MAC error na desconexão detectado");

        if (badMacHandler.handleError(error, "connection.update")) {
          if (badMacHandler.hasReachedLimit()) {
            warningLog(
              "Limite de erros Bad MAC atingido. Limpando arquivos de sessão problemáticos...",
            );
            badMacHandler.clearProblematicSessionFiles();
            badMacHandler.resetErrorCount();

            await triggerSafeReconnect();
            return;
          }
        }
      }

      if (statusCode === DisconnectReason.loggedOut) {
        errorLog("Bot desconectado! Por favor, faça login novamente.");
      } else {
        switch (statusCode) {
          case DisconnectReason.badSession:
            warningLog("Sessão inválida!");

            const sessionError = new Error("Bad session detected");
            if (badMacHandler.handleError(sessionError, "badSession")) {
              if (badMacHandler.hasReachedLimit()) {
                warningLog(
                  "Limite de erros de sessão atingido. Limpando arquivos de sessão...",
                );
                badMacHandler.clearProblematicSessionFiles();
                badMacHandler.resetErrorCount();
              }
            }
            break;
          case DisconnectReason.connectionClosed:
            warningLog("Conexão fechada!");
            break;
          case DisconnectReason.connectionLost:
            warningLog("Conexão perdida!");
            break;
          case DisconnectReason.connectionReplaced:
            warningLog("Conexão substituída!");
            break;
          case DisconnectReason.multideviceMismatch:
            warningLog("Dispositivo incompatível!");
            break;
          case DisconnectReason.forbidden:
            warningLog("Conexão proibida!");
            break;
          case DisconnectReason.restartRequired:
            infoLog('Reiniciando conexão necessária...');
            break;
          case DisconnectReason.unavailableService:
            warningLog("Serviço indisponível!");
            break;
        }

        await triggerSafeReconnect();
      }
    } else if (connection === "open") {
      clearScreenWithBanner();
      successLog("✅ Bot iniciado com sucesso!");
      successLog("Fui conectado com sucesso!");
      infoLog("Versão do WhatsApp Web: " + version.join("."));
      successLog(
        `✅ Estou pronto para uso! 
Verifique o prefixo, digitando a palavra "prefixo" no WhatsApp. 
O prefixo padrão definido no config.js é ${PREFIX}`,
      );
      badMacHandler.resetErrorCount();
    } else if (connection === "connecting") {
      infoLog("Conectando...");
    } else {
      infoLog("Atualizando conexão...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}
