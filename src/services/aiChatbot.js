/**
 * Serviço Inteligente de Chatbot IA (Casalzaum - Davi & Mari)
 * Suporta múltiplos provedores com fallback automático:
 * 1. Groq (Qwen 27B / GPT-OSS - Ultra Rápido e Ativo)
 * 2. OpenRouter (Auto / Hermes - Universal)
 */

import axios from "axios";
import { infoLog, warningLog, errorLog } from "../utils/logger.js";
import { obterLeadPorTelefone } from "./leadCaptor.js";

// Cache de memória recente da conversa por usuário (últimas 15 mensagens)
const conversationMemory = new Map();

// Determina o período do dia e a saudação correta no horário de Brasília (UTC-3)
export function getPeriodoDoDia() {
  const agora = new Date();
  const utc = agora.getTime() + agora.getTimezoneOffset() * 60000;
  const horaBrasil = new Date(utc - 3 * 3600000).getHours();

  if (horaBrasil >= 5 && horaBrasil < 12) {
    return { periodo: "manhã", saudacao: "Bom dia" };
  } else if (horaBrasil >= 12 && horaBrasil < 18) {
    return { periodo: "tarde", saudacao: "Boa tarde" };
  } else {
    return { periodo: "noite", saudacao: "Boa noite" };
  }
}

/**
 * Adiciona mensagem ao histórico do usuário (exportado para comandos e mídias)
 */
export function recordMessage(userId, role, content) {
  if (!userId || !content) return;
  if (!conversationMemory.has(userId)) {
    conversationMemory.set(userId, []);
  }
  const history = conversationMemory.get(userId);
  history.push({ role, content });
  if (history.length > 15) {
    history.shift();
  }
}

// Gera dinamicamente o Prompt do Sistema Oficial Davi & Mari com contexto do lead
export function getSystemPrompt(isFirstMessage = false, knownLead = null) {
  const { saudacao } = getPeriodoDoDia();

  const isAprovado = Boolean(
    knownLead?.linkEnviado || 
    knownLead?.status?.toLowerCase().includes("liberado") || 
    knownLead?.status?.toLowerCase().includes("aprovad") ||
    knownLead?.status?.toLowerCase().includes("portaria")
  );

  let leadContext = "";
  if (knownLead) {
    leadContext = `
# 👤 DADOS CONFIRMADOS DESTE CLIENTE NO SISTEMA:
- Nome/Identificação: ${knownLead.nome || "Não informado"}
- Perfil: ${knownLead.perfil || "Casal Liberal"}
- Cidade/Estado: ${knownLead.cidade || "Não informada"}
- Status Atual: ${knownLead.status || "Em Atendimento"}
- Já Foi Aprovado / Link Enviado?: ${isAprovado ? "SIM (Aprovado e Link da Portaria já enviado)" : "NÃO"}
`.trim();
  }

  let instrucaoAprovado = "";
  if (isAprovado) {
    instrucaoAprovado = `
# 👑 MEMBRO JÁ APROVADO E LINK DA PORTARIA JÁ ENTREGUE:
- Este membro JÁ FOI APROVADO pela moderação / Davi & Mari!
- O LINK DA PORTARIA JÁ FOI ENVIADO PARA ELE ACIMA NA CONVERSA!
- ⚠️ REGRAS RIGOROSAS:
  1. NÃO fique remandando os links toda hora se ele perguntar.
  2. NUNCA peça foto, áudio anti-fake ou triagem de novo! Ele já fez tudo!
  3. NUNCA mencione pagamento, passe ou Pix para quem é casal!
  4. Se o membro reperguntar ("E agora?", "Cadê o grupo?", "Expirou?", "Já fiz tudo", "Falta algo?", "Pedido pendente"):
     Explique com clareza:
     👉 O link da nossa Portaria de Espera já foi enviado logo acima na conversa! Agora é só aguardar: eles entram na Portaria (grupo seguro de recepção) e lá dentro o Davi e a moderação colocam eles MANUALMENTE no grupo principal temático.
  5. Se o membro apenas agradecer ("obrigado", "valeu", "show", emoji):
     Responda de forma curta e acolhedora: "Por nada! Sejam muito bem-vindos ao Casalzaum e aproveitem bastante! Qualquer dúvida estamos por aqui!"
`.trim();
  }

  return `
# PERSONAGEM E IDENTIDADE OFICIAL
Você é o atendimento oficial e direto de Davi & Mari (Marina), os anfitriões e criadores do Clube Casalzaum e do Casalzaum VIP.
Seu objetivo é conversar com as pessoas de forma 100% humanizada, acolhedora, objetiva e gentil, exatamente como um casal gente boa no WhatsApp.

${leadContext}

${instrucaoAprovado}

# 🚨 REGRA CRÍTICA DE NOMES E IDENTIDADE:
- **VOCÊS** são Davi & Mari (os anfitriões do Casalzaum).
- A pessoa conversando com você é o **CLIENTE / CANDIDATO**.
- **NUNCA CHAME A ESPOSA DO CLIENTE DE "MARI"!** Mari é a dona do perfil que atende. Chame-a de "sua esposa", "sua parceira" ou pelo nome dela.

# ☀️ SAUDAÇÃO NATURAL:
- Use "${saudacao}!" APENAS na primeira mensagem de um novo contato!
- Em mensagens de continuação da conversa, NÃO repita saudação! Use "Perfeito!", "Show!", "Entendi perfeitamente!", "Tranquilo!".

# ⚠️ REGRA DE OURO: SEMPRE APENAS UMA ÚNICA MENSAGEM!
- NUNCA envie duas mensagens seguidas. Envie rigorosamente UMA ÚNICA MENSAGEM completa por resposta.

---

# 🎯 REGRAS DE ATENDIMENTO:

1. 📋 SE O CLIENTE PEDIR A FICHA DE TRIAGEM OU VOCÊ DISSER QUE VAI MANDAR A FICHA:
   - NUNCA diga apenas "vou mandar" sem mandar!
   - Envie a ficha IMEDIATAMENTE na mesma mensagem:
   "Aqui está a nossa ficha para preencherem:

📋 *CLUB CASALZAUM - TRIAGEM OFICIAL*
• *Nome / Identificação:* 
• *Perfil:* Casal Liberal
• *Idade(s):* 
• *Cidade/Estado:* 
• *Experiência no meio liberal:* 
• *O que buscam no Clube:* 

É só copiar, preencher e nos mandar de volta por aqui! 😉✨"

2. 👫 CASAIS E MULHERES SOLTEIRAS = 100% GRATUITO:
   - Entrada GRATUITA! NUNCA mencione pagamento, passe, comprovante ou Pix para casais ou mulheres!

3. ⏳ PEDIDO PENDENTE / GRUPO DE ESPERA (PORTARIA):
   - Se o cliente disser que o pedido ficou pendente no grupo ou perguntar cadê o grupo principal:
     Explique que a Portaria de Espera é a recepção e que a aprovação da entrada nos grupos do WhatsApp é feita MANUALMENTE pela moderação e pelo Davi para barrar perfis fake, bastando aguardar um instante.

4. 🙋 HOMENS SOLTEIROS (NÃO CASAIS):
   - Passe Semestral: R$ 67,00 à vista / Passe VIP Black: R$ 117,00 à vista.
   - Pix Oficial: munizmarina149@gmail.com (Marina Muniz).
`.trim();
}

/**
 * Modelo padrão da Ficha de Triagem
 */
const FICHA_TRIAGEM_TEMPLATE = 
`📋 *CLUB CASALZAUM - TRIAGEM OFICIAL*
• *Nome / Identificação:* 
• *Perfil:* Casal Liberal
• *Idade(s):* 
• *Cidade/Estado:* 
• *Experiência no meio liberal:* 
• *O que buscam no Clube:* 

É só copiar, preencher com os dados de vocês e nos mandar de volta por aqui! 😉✨`;

/**
 * Sanitiza e limpa respostas para evitar alucinações e repetições
 */
function sanitizarResposta(rawText, isFirstMessage, knownLead) {
  if (!rawText) return "";

  let cleaned = rawText.trim();

  const isAprovado = Boolean(
    knownLead?.linkEnviado || 
    knownLead?.status?.toLowerCase().includes("liberado") || 
    knownLead?.status?.toLowerCase().includes("aprovad") ||
    knownLead?.status?.toLowerCase().includes("portaria")
  );

  // 1. Corrige confusão de nomes: Mari não é a parceira do cliente
  cleaned = cleaned
    .replace(/\bComo a Mari está em casa\b/gi, "Como a sua parceira está em casa")
    .replace(/\bAssim que a Mari mandar\b/gi, "Assim que a sua parceira mandar")
    .replace(/\ba Mari pode me enviar\b/gi, "a sua parceira pode me enviar")
    .replace(/\bAssim que a Mari me mandar\b/gi, "Assim que a sua parceira me mandar")
    .replace(/\bfoto da Mari\b/gi, "foto da sua parceira");

  // 2. Se NÃO for primeira mensagem, remove saudações repetidas de abertura
  if (!isFirstMessage) {
    cleaned = cleaned.replace(/^(?:Bom dia|Boa tarde|Boa noite|Olá)!(?:\s+Tudo bem\??)?(?:\s+Seja muito bem-vindo\(a\)!?)?\s*/i, "");
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }

  // 3. Se o cliente for Casal ou Mulher Solteira, remove qualquer citação acidental a passe/pagamento
  if (knownLead && (knownLead.perfil?.toLowerCase().includes("casal") || knownLead.perfil?.toLowerCase().includes("mulher"))) {
    cleaned = cleaned
      .replace(/fez o pagamento do passe\??/gi, "já enviou a confirmação anti-fake?")
      .replace(/pagamento do passe/gi, "confirmação")
      .replace(/comprovante pix/gi, "confirmação");
  }

  // 4. Se o membro JÁ FOI APROVADO, impede que a IA peça foto de novo
  if (isAprovado) {
    if (
      cleaned.toLowerCase().includes("fotinho de vocês") ||
      cleaned.toLowerCase().includes("aguardo da foto") ||
      cleaned.toLowerCase().includes("manda a foto") ||
      cleaned.toLowerCase().includes("mande sua foto")
    ) {
      cleaned = "Os links da nossa Portaria de Espera já foram enviados logo acima! 😉 Agora é só aguardar um instante que o Davi e a moderação já colocam vocês manualmente no grupo principal!";
    }
  }

  // 5. Se a mensagem diz que vai mandar a ficha mas esqueceu de anexar a ficha:
  if (
    cleaned.toLowerCase().includes("vou te mandar a ficha") ||
    cleaned.toLowerCase().includes("vou mandar a ficha")
  ) {
    if (!cleaned.includes("TRIAGEM OFICIAL")) {
      cleaned += `\n\n${FICHA_TRIAGEM_TEMPLATE}`;
    }
  }

  return cleaned;
}

/**
 * 1. Provedor Groq (Super Rápido - Qwen 27B / GPT-OSS 120B)
 */
async function callGroq(userId, userMessage, knownLead) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY não configurada");

  const url = "https://api.groq.com/openai/v1/chat/completions";
  const history = conversationMemory.get(userId) || [];
  const isFirstMessage = history.length <= 1;

  const messages = [
    { role: "system", content: getSystemPrompt(isFirstMessage, knownLead) },
    ...history
  ];

  // Modelos ativos e testados na conta Groq
  const models = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b"];
  let lastError;

  for (const model of models) {
    try {
      const response = await axios.post(
        url,
        {
          model,
          messages,
          temperature: 0.65,
          max_tokens: 450
        },
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          timeout: 8000
        }
      );

      const reply = response?.data?.choices?.[0]?.message?.content;
      if (reply && reply.trim()) return sanitizarResposta(reply, isFirstMessage, knownLead);
    } catch (err) {
      lastError = err;
      warningLog(`[Groq] Modelo ${model} falhou (${err.message}), tentando próximo...`);
    }
  }

  throw lastError || new Error("Groq retornou resposta vazia");
}

/**
 * 2. Provedor OpenRouter (Fallback Universal)
 */
async function callOpenRouter(userId, userMessage, knownLead) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada");

  const url = "https://openrouter.ai/api/v1/chat/completions";
  const history = conversationMemory.get(userId) || [];
  const isFirstMessage = history.length <= 1;

  const messages = [
    { role: "system", content: getSystemPrompt(isFirstMessage, knownLead) },
    ...history
  ];

  const response = await axios.post(
    url,
    {
      model: "openrouter/auto",
      messages,
      temperature: 0.7,
      max_tokens: 450
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://clubcasalzaum",
        "X-Title": "Club Casalzaum Chatbot"
      },
      timeout: 10000
    }
  );

  const reply = response?.data?.choices?.[0]?.message?.content;
  if (!reply || !reply.trim()) throw new Error("OpenRouter retornou resposta vazia");
  return sanitizarResposta(reply, isFirstMessage, knownLead);
}

/**
 * Orquestrador com Memória e Fallback Inteligente
 */
export async function getAiResponse(userId, userMessage) {
  recordMessage(userId, "user", userMessage);

  const knownLead = obterLeadPorTelefone(userId);
  const history = conversationMemory.get(userId) || [];
  const isFirstMessage = history.length <= 1;

  const isAprovado = Boolean(
    knownLead?.linkEnviado || 
    knownLead?.status?.toLowerCase().includes("liberado") || 
    knownLead?.status?.toLowerCase().includes("aprovad") ||
    knownLead?.status?.toLowerCase().includes("portaria")
  );

  // Tentativa 1: Groq (Ultra rápido - Qwen 27B)
  try {
    const reply = await callGroq(userId, userMessage, knownLead);
    recordMessage(userId, "assistant", reply);
    infoLog("[IA Chatbot] Resposta gerada via Groq (Qwen) ✅");
    return reply;
  } catch (err) {
    warningLog(`[IA Chatbot] Falha no Groq (${err.message}). Tentando OpenRouter...`);
  }

  // Tentativa 2: OpenRouter
  try {
    const reply = await callOpenRouter(userId, userMessage, knownLead);
    recordMessage(userId, "assistant", reply);
    infoLog("[IA Chatbot] Resposta gerada via OpenRouter ✅");
    return reply;
  } catch (err) {
    errorLog(`[IA Chatbot] Falha no OpenRouter: ${err.message}`);
  }

  // Resposta de Contingência contextual com memória
  const { saudacao } = getPeriodoDoDia();
  const lowerMsg = userMessage.toLowerCase();
  let fallbackReply = "";

  if (isAprovado) {
    if (lowerMsg.includes("obrigad") || lowerMsg.includes("valeu") || lowerMsg.includes("show") || lowerMsg.includes("obg")) {
      fallbackReply = "Por nada! Sejam muito bem-vindos ao Club Casalzaum! Curtam com respeito e qualquer dúvida estamos por aqui! Davi & Mari.";
    } else {
      fallbackReply = "Os links da nossa Portaria de Espera já foram enviados logo acima aqui na conversa! 😉 Agora é só aguardar um instante: vocês entram na Portaria e lá dentro o Davi e a moderação colocam vocês manualmente no grupo principal!";
    }
  } else if (lowerMsg.includes("ficha") || lowerMsg.includes("entrar") || lowerMsg.includes("triagem") || lowerMsg.includes("formulario")) {
    fallbackReply = `Com certeza! Podem preencher a nossa ficha de triagem oficial para avaliarmos o perfil de vocês:\n\n${FICHA_TRIAGEM_TEMPLATE}`;
  } else if (lowerMsg.includes("trabalho") || lowerMsg.includes("casa") || lowerMsg.includes("certo") || lowerMsg.includes("ok")) {
    fallbackReply = "Combinado! Ficamos no aguardo de vocês quando tiverem um tempinho livre. Bom descanso ou bom trabalho por aí! Davi & Mari.";
  } else if (knownLead?.perfil?.toLowerCase().includes("casal") || lowerMsg.includes("casal")) {
    fallbackReply = "Perfeito, casal! Entendido perfeitamente! 😊 Lembrando que para casais a entrada no Club Casalzaum é 100% gratuita! Qualquer dúvida nos avisem por aqui. Davi & Mari.";
  } else if (history.length > 2) {
    fallbackReply = "Entendido perfeitamente! Já estamos conferindo aqui para dar sequência no atendimento de vocês. Qualquer dúvida estamos à disposição! Davi & Mari.";
  } else {
    fallbackReply = 
      `${saudacao}! Seja muito bem-vindo(a) ao Club Casalzaum! 🥂\n\n` +
      "Recebemos seu contato. Para te orientar sobre o acesso aos nossos grupos ou conteúdos exclusivos, me conte: você é casal, mulher solteira ou homem solteiro?";
  }

  const finalReply = sanitizarResposta(fallbackReply, isFirstMessage, knownLead);
  recordMessage(userId, "assistant", finalReply);
  return finalReply;
}
