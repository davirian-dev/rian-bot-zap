/**
 * Serviço de Identificação e Resposta a Mensagens Pendentes (Sem Resposta)
 * Garante que clientes que enviaram mensagem e não receberam retorno sejam atendidos pela IA
 * respeitando com fidelidade as diretrizes de Davi e Mari.
 */

import { getAiResponse } from "./aiChatbot.js";
import { infoLog, warningLog, errorLog } from "../utils/logger.js";

// Conjunto para evitar responder duas vezes para a mesma mensagem ou contato na mesma sessão
const respondedMessageIds = new Set();
const recentlyRepliedChats = new Set();

/**
 * Extrai o texto limpo de uma mensagem do WhatsApp
 */
export function extractMessageText(msg) {
  if (!msg || !msg.message) return "";
  return (
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption ||
    ""
  ).trim();
}

/**
 * Processa uma lista de mensagens recebidas (ex: via HistorySync ou sincronização)
 * e responde exclusivamente aquelas que estão sem resposta (onde a última mensagem foi do cliente).
 */
export async function processPendingConversations(socket, messagesList, chatsList = []) {
  if (!socket || (!messagesList?.length && !chatsList?.length)) {
    return;
  }

  infoLog(`[Mensagens Pendentes] Analisando ${messagesList?.length || 0} mensagens e ${chatsList?.length || 0} chats...`);

  // Agrupa mensagens por remoteJid (apenas conversas privadas)
  const chatMessagesMap = new Map();

  if (Array.isArray(messagesList)) {
    for (const msg of messagesList) {
      const jid = msg?.key?.remoteJid;
      if (!jid || jid.endsWith("@g.us") || jid === "status@broadcast" || jid.includes("160602467102822")) {
        continue;
      }
      if (!chatMessagesMap.has(jid)) {
        chatMessagesMap.set(jid, []);
      }
      chatMessagesMap.get(jid).push(msg);
    }
  }

  // Se temos lista de chats com mensagens embutidas (HistorySync), adiciona também
  if (Array.isArray(chatsList)) {
    for (const chat of chatsList) {
      const jid = chat?.id;
      if (!jid || jid.endsWith("@g.us") || jid === "status@broadcast" || jid.includes("160602467102822")) {
        continue;
      }
      if (!chatMessagesMap.has(jid)) {
        chatMessagesMap.set(jid, []);
      }
      if (Array.isArray(chat.messages)) {
        for (const item of chat.messages) {
          if (item?.message) {
            chatMessagesMap.get(jid).push(item.message);
          }
        }
      }
    }
  }

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  let pendingCount = 0;

  for (const [jid, msgs] of chatMessagesMap.entries()) {
    // Ordena mensagens em ordem cronológica (mais antiga primeiro, mais nova no fim)
    msgs.sort((a, b) => {
      const tA = Number(a.messageTimestamp || 0);
      const tB = Number(b.messageTimestamp || 0);
      return tA - tB;
    });

    const lastMsg = msgs[msgs.length - 1];
    if (!lastMsg || !lastMsg.key) continue;

    // Regra 1: A ÚLTIMA mensagem foi enviada pelo cliente (fromMe === false)
    if (lastMsg.key.fromMe) {
      continue; // Nós já somos quem mandou a última mensagem, não está pendente!
    }

    const msgId = lastMsg.key.id;
    if (respondedMessageIds.has(msgId) || recentlyRepliedChats.has(jid)) {
      continue; // Já respondemos nesta sessão
    }

    // Regra do Usuário: Se a pessoa mandou foto, áudio, PDF ou comprovante sem texto, deixa para atendimento humano
    const msgContent = lastMsg?.message;
    const isMediaOnly = Boolean(
      (msgContent?.imageMessage && !msgContent?.imageMessage?.caption) ||
      msgContent?.audioMessage ||
      msgContent?.documentMessage ||
      msgContent?.documentWithCaptionMessage ||
      msgContent?.stickerMessage
    );

    if (isMediaOnly) {
      infoLog(`[Mensagens Pendentes] Mídia detectada (foto/áudio/PDF/comprovante) de ${jid}. Deixando para conferência manual de Davi & Mari.`);
      continue;
    }

    const text = extractMessageText(lastMsg);
    if (!text) {
      continue; // Mensagem sem texto ou de sistema
    }

    // Regra 2: Mensagem recente (dentro das últimas 24 horas)
    const timestampMs = lastMsg.messageTimestamp ? Number(lastMsg.messageTimestamp) * 1000 : now;
    if (now - timestampMs > ONE_DAY_MS) {
      continue; // Mais de 24 horas, não ressuscita conversa fria
    }

    // Identificada conversa pendente!
    pendingCount++;
    infoLog(`[Mensagens Pendentes] Encontrada conversa sem resposta de ${jid}: "${text}" (${new Date(timestampMs).toLocaleTimeString()})`);

    // Gera a resposta com a IA seguindo com precisão todas as diretrizes de Davi & Mari
    try {
      // Simula presença digitando para ficar 100% natural e humanizado
      await socket.sendPresenceUpdate("composing", jid);
      
      const aiReply = await getAiResponse(jid, text);
      
      // Envia RIGOROSAMENTE UMA ÚNICA MENSAGEM
      await socket.sendMessage(jid, { text: aiReply });
      
      respondedMessageIds.add(msgId);
      recentlyRepliedChats.add(jid);

      infoLog(`[Mensagens Pendentes] Resposta enviada com sucesso para ${jid} ✅`);
      await socket.sendPresenceUpdate("paused", jid);

      // Intervalo de segurança suave entre mensagens para não disparar flood
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      errorLog(`[Mensagens Pendentes] Falha ao responder ${jid}: ${err.message}`);
    }
  }

  if (pendingCount === 0) {
    infoLog("[Mensagens Pendentes] Nenhuma mensagem de cliente pendente de resposta nas últimas 24h.");
  } else {
    infoLog(`[Mensagens Pendentes] Total de ${pendingCount} cliente(s) pendente(s) respondido(s) com sucesso!`);
  }
}

/**
 * Responde diretamente a lista de clientes pendentes identificados na tela do WhatsApp (ZapZap)
 * que aguardam retorno de triagem/portaria.
 */
export async function responderContatosZapZap(socket) {
  if (!socket) return 0;

  const contatosParaResponder = [
    {
      jid: "555399764938@s.whatsapp.net",
      nome: "Cliente RS (Final 4938)",
      contexto: "*CLUB CASALZAUM - TRIAGEM OFICIAL*\nOlá, preenchi meus dados para a triagem do Club Casalzaum e quero liberação."
    },
    {
      jid: "557191172350@s.whatsapp.net",
      nome: "Cliente Salvador (Final 2350)",
      contexto: "*CLUB CASALZAUM - TRIAGEM OFICIAL*\nOlá, enviei minha triagem oficial para entrar no Club Casalzaum."
    },
    {
      jid: "557181913249@s.whatsapp.net",
      nome: "Cliente Salvador (Final 3249)",
      contexto: "*CLUB CASALZAUM - TRIAGEM OFICIAL*\nOlá moderação, mandei minha triagem para entrar no grupo."
    },
    {
      jid: "557197308580@s.whatsapp.net",
      nome: "Cliente Salvador (Final 8580)",
      contexto: "*CLUB CASALZAUM - TRIAGEM OFICIAL*\nOlá, preenchi os dados e aguardo a liberação da triagem."
    },
    {
      jid: "558186927412@s.whatsapp.net",
      nome: "Cliente Recife (Final 7412)",
      contexto: "*CLUB CASALZAUM - TRIAGEM OFICIAL*\nOlá, mandei a triagem oficial para entrar no Club Casalzaum."
    },
    {
      jid: "69128186527844@lid",
      nome: "Amor / Cliente Portaria",
      contexto: "Olá, estou na Portaria e quero fazer minha triagem gratuita"
    }
  ];

  let enviados = 0;
  for (const c of contatosParaResponder) {
    if (recentlyRepliedChats.has(c.jid)) {
      infoLog(`[Disparo Real] ${c.nome} já foi respondido recentemente, pulando.`);
      continue;
    }

    try {
      infoLog(`[Disparo Real] Gerando resposta inteligente para ${c.nome} (${c.jid})...`);
      await socket.sendPresenceUpdate("composing", c.jid);

      const aiReply = await getAiResponse(c.jid, c.contexto);
      await socket.sendMessage(c.jid, { text: aiReply });

      recentlyRepliedChats.add(c.jid);
      enviados++;
      infoLog(`[Disparo Real] Mensagem enviada com sucesso para ${c.nome} ✅`);
      await socket.sendPresenceUpdate("paused", c.jid);

      // Intervalo seguro de 3 segundos entre mensagens
      await new Promise(r => setTimeout(r, 3000));
    } catch (err) {
      errorLog(`[Disparo Real] Falha ao enviar para ${c.jid}: ${err.message}`);
    }
  }

  return enviados;
}
