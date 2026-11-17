/**
 * Serviço Inteligente de Chatbot IA (Casalzaum - Davi & Mari)
 * Suporta múltiplos provedores com fallback automático:
 * 1. Groq (Qwen / Llama - Ultra Rápido e Ativo)
 * 2. OpenRouter (Auto / Hermes - Universal)
 */

import axios from "axios";
import { infoLog, warningLog, errorLog } from "../utils/logger.js";
import { obterLeadPorTelefone } from "./leadCaptor.js";

// Cache de memória recente da conversa por usuário (últimas 10 mensagens)
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

// Gera dinamicamente o Prompt do Sistema Oficial Davi & Mari com contexto do lead
export function getSystemPrompt(isFirstMessage = false, knownLead = null) {
  const { periodo, saudacao } = getPeriodoDoDia();

  let leadContext = "";
  if (knownLead) {
    leadContext = `
# 👤 DADOS CONFIRMADOS DESTE CLIENTE NO PAINEL:
- Nome/Identificação: ${knownLead.nome || "Não informado"}
- Perfil: ${knownLead.perfil || "Casal Liberal"}
- Cidade/Estado: ${knownLead.cidade || "Não informada"}
- Referência: ${knownLead.referencia || "Não informada"}
- Status Atual: ${knownLead.status || "Em Atendimento"}
⚠️ ATENÇÃO MÁXIMA: Este cliente JÁ ENVIOU A TRIAGEM E É IDENTIFICADO como ${knownLead.perfil}!
NUNCA pergunte se ele é casal, homem solteiro ou mulher solteira! Já sabemos quem ele é!
`.trim();
  }

  return `
# PERSONAGEM E IDENTIDADE OFICIAL
Você é o atendimento oficial e direto de Davi & Mari (Marina), os anfitriões e criadores do Clube Casalzaum e do Casalzaum VIP.
Seu objetivo é conversar com as pessoas de forma 100% humanizada, acolhedora, objetiva e persuasiva, exatamente como um casal gente boa no WhatsApp.

${leadContext}

# 🚨 REGRA CRÍTICA DE NOMES E IDENTIDADE (NUNCA CONFUNDA!):
- **VOCÊS** são Davi & Mari (os anfitriões e atendentes do Casalzaum).
- A pessoa com quem você está conversando no WhatsApp é o **CLIENTE / CANDIDATO**.
- **NUNCA, SOB HIPÓTESE ALGUMA, CHAME A PARCEIRA OU ESPOSA DO CLIENTE DE "MARI"!**
  - "Mari" é a Marina do Casalzaum (a dona do perfil, quem está atendendo).
  - Se o cliente disser "ela está em casa", "minha esposa", "minha parceira", refira-se a ela como **"sua esposa"**, **"sua parceira"**, **"ela"** ou pelo nome dela informado na triagem.
  - Exemplo CORRETO: "Perfeito! Como a sua parceira está em casa, ela pode mandar a fotinha quando puder."
  - Exemplo ERRADO (PROIBIDO): "Como a Mari está em casa..." (NUNCA FAÇA ISSO!).

# ☀️ SAUDAÇÃO NATURAL (SEM REPETIÇÃO CHATA):
- Use "${saudacao}!" **APENAS** na primeira mensagem de contato!
- Em mensagens de continuação da mesma conversa (quando já estiver dialogando), **NÃO COMECE COM "${saudacao}!" DE NOVO**!
- Seja natural e dinâmico como qualquer pessoa no WhatsApp: use "Perfeito!", "Show!", "Entendi perfeitamente!", "Tranquilo!", "Combinado!".

# ⚠️ REGRA DE OURO: SEMPRE APENAS UMA ÚNICA MENSAGEM!
- NUNCA envie duas mensagens seguidas. Envie rigorosamente UMA ÚNICA MENSAGEM completa por resposta.
- Se o cliente já combinou ("Tá certo", "Depois mando", "Estou no trabalho", "Ela tá em casa"), confirme com carinho e encerre:
  👉 "Tranquilo, combinadíssimo! Ficamos no aguardo de vocês. Bom trabalho por aí!"
  Não fique mandando mensagens sozinho nem cobrando!

---

# 🎯 ANÁLISE DE CONTEXTO E INTENÇÃO DO CLIENTE:
Você DEVE ler com atenção o que o cliente escreveu e responder com base no que ele falou:

1. 📝 SE O CLIENTE MANDOU A FICHA DE TRIAGEM PREENCHIDA (ex: "CLUB CASALZAUM - TRIAGEM OFICIAL"):
   - **LEIA E RECONHEÇA OS DADOS IMEDIATAMENTE! NUNCA DIGA QUE VEIO SEM INFORMAÇÕES!**
   - Se for CASAL:
     👉 Acolha com alegria chamando pelos nomes.
     👉 Explique que para casais a entrada no Clube é **100% GRATUITA**!
     👉 Explique a verificação rápida anti-fake: foto de legal 👍 OU um áudio de 5 segundos falando os nomes e a cidade.
   - Se for MULHER SOLTEIRA:
     👉 Acolha com carinho, entrada 100% gratuita, e mesma verificação rápida (foto 👍 ou áudio).
   - Se for HOMEM SOLTEIRO:
     👉 Acolha e explique a política do Clube para manter o equilíbrio e respeito:
        • Passe Semestral (6 Meses): R$ 16/mês (total R$ 97 à vista).
        • Passe VIP Black (12 Meses): Menos de R$ 14/mês (total R$ 167 à vista) com prioridade máxima.
        • Chave Pix: munizmarina149@gmail.com (Marina Muniz).

2. ❓ SE A PESSOA FEZ UMA PERGUNTA ESPECÍFICA:
   - Responda DIRETAMENTE à pergunta dela com simpatia e clareza. Não mande textos genéricos ou desconexos.

3. 🏛️ MEIO LIBERAL vs 🔥 CONTEÚDOS +18:
   - Se o foco for a comunidade/amizades/encontros: fale do Clube Casalzaum.
   - Se o foco for vídeos íntimos e sem censura de Davi & Mari: fale do Casalzaum VIP (Degustação R$ 10, Pack R$ 29,90, Vitalício R$ 69,90).

4. 💳 PAGAMENTO OFICIAL:
   - Chave Pix: munizmarina149@gmail.com (Marina Muniz)
   - Cartão / Mercado Pago: https://link.mercadopago.com.br/casalzaumofc

# 💬 QUEM SOMOS (DAVI & MARI):
- 26 anos, Salvador/BA. Davi (1,90m) e Mari (1,80m). Casados, 3 filhos pequenos (Theo, Benjamim e Íris). Pessoas reais, honestas e acolhedoras.
- Tom de voz: baiano, descontraído, educado, sem tabus e direto ao ponto. Responda em UMA ÚNICA MENSAGEM.
`.trim();
}

/**
 * Adiciona mensagem ao histórico do usuário
 */
function recordMessage(userId, role, content) {
  if (!conversationMemory.has(userId)) {
    conversationMemory.set(userId, []);
  }
  const history = conversationMemory.get(userId);
  history.push({ role, content });
  if (history.length > 10) {
    history.shift();
  }
}

/**
 * Sanitiza e limpa respostas para evitar alucinações e repetições chatas
 */
function sanitizarResposta(rawText, isFirstMessage, knownLead) {
  if (!rawText) return "";

  let cleaned = rawText.trim();

  // 1. Corrige confusão de nomes: Mari não é a parceira do cliente!
  cleaned = cleaned
    .replace(/\bComo a Mari está em casa\b/gi, "Como a sua parceira está em casa")
    .replace(/\bAssim que a Mari mandar\b/gi, "Assim que a sua parceira mandar")
    .replace(/\ba Mari pode me enviar\b/gi, "a sua parceira pode me enviar")
    .replace(/\bAssim que a Mari me mandar\b/gi, "Assim que a sua parceira me mandar")
    .replace(/\bfoto da Mari\b/gi, "foto da sua parceira");

  // Se soubermos o nome feminino da triagem (ex: Nathalia em "Murilo e nathalia")
  if (knownLead?.nome && knownLead.nome.includes("e ")) {
    const partes = knownLead.nome.split(/ e /i);
    if (partes.length > 1) {
      const nomeMulher = partes[1].trim();
      cleaned = cleaned.replace(/\ba sua parceira\b/gi, nomeMulher);
    }
  }

  // 2. Se NÃO for primeira mensagem, remove saudações repetidas de abertura
  if (!isFirstMessage) {
    cleaned = cleaned.replace(/^(?:Bom dia|Boa tarde|Boa noite|Olá)!(?:\s+Tudo bem\??)?(?:\s+Seja muito bem-vindo\(a\)!?)?\s*/i, "");
    // Capitaliza primeira letra se necessário
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }

  // 3. Se o cliente já tem perfil de casal ou solteira, bloqueia perguntas sobre "você é casal ou solteiro"
  if (knownLead && (knownLead.perfil.includes("Casal") || knownLead.perfil.includes("Mulher"))) {
    if (cleaned.toLowerCase().includes("preciso saber: você é *casal*") || cleaned.toLowerCase().includes("preciso saber o seu perfil")) {
      cleaned = "Entendido perfeitamente! Como vocês já estão cadastrados, ficamos no aguardo da foto simples de confirmação 👍 ou do áudio curto de 5 segundos. Qualquer dúvida estamos por aqui!";
    }
  }

  return cleaned;
}

/**
 * 1. Provedor Groq (Super Rápido - Llama 3.3 70B / Llama 3.1 8B)
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

  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
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
          timeout: 10000
        }
      );

      const reply = response?.data?.choices?.[0]?.message?.content;
      if (reply) return sanitizarResposta(reply, isFirstMessage, knownLead);
    } catch (err) {
      lastError = err;
      warningLog(`[Groq] Modelo ${model} falhou (${err.message}), tentando próximo...`);
    }
  }

  throw lastError || new Error("Groq retornou resposta vazia");
}

/**
 * 2. Provedor OpenRouter (Auto / Hermes)
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
      timeout: 12000
    }
  );

  const reply = response?.data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error("OpenRouter retornou resposta vazia");
  return sanitizarResposta(reply, isFirstMessage, knownLead);
}

/**
 * Orquestrador com Fallback Inteligente
 */
export async function getAiResponse(userId, userMessage) {
  recordMessage(userId, "user", userMessage);

  const knownLead = obterLeadPorTelefone(userId);
  const history = conversationMemory.get(userId) || [];
  const isFirstMessage = history.length <= 1;

  // Tentativa 1: Groq (Ultra rápido)
  try {
    const reply = await callGroq(userId, userMessage, knownLead);
    recordMessage(userId, "assistant", reply);
    infoLog("[IA Chatbot] Resposta gerada via Groq ✅");
    return reply;
  } catch (err) {
    warningLog(`[IA Chatbot] Falha no Groq (${err.message}). Tentando OpenRouter...`);
  }

  // Tentativa 2: OpenRouter (Auto/Hermes)
  try {
    const reply = await callOpenRouter(userId, userMessage, knownLead);
    recordMessage(userId, "assistant", reply);
    infoLog("[IA Chatbot] Resposta gerada via OpenRouter ✅");
    return reply;
  } catch (err) {
    errorLog(`[IA Chatbot] Falha no OpenRouter: ${err.message}`);
  }

  // Resposta de Contingência contextual
  const { saudacao } = getPeriodoDoDia();
  const lowerMsg = userMessage.toLowerCase();
  let fallbackReply = "";

  if (lowerMsg.includes("trabalho") || lowerMsg.includes("casa") || lowerMsg.includes("certo") || lowerMsg.includes("ok")) {
    fallbackReply = "Combinado! Ficamos no aguardo da confirmação rápida de vocês quando tiverem um tempinho livre. Bom trabalho por aí! Mari & Davi.";
  } else if (knownLead?.perfil?.includes("Casal") || lowerMsg.includes("casal")) {
    fallbackReply = 
      "Perfeito! Entendido perfeitamente! 😊\n\n" +
      "Lembrando que para casais a entrada no Club Casalzaum é 100% gratuita! Assim que tiverem um tempinho livre, é só nos mandar a verificação rápida anti-fake (foto fazendo legal 👍 ou um áudio de 5 segundos com nome e cidade) que a gente já confere e libera o acesso de vocês! Mari & Davi.";
  } else if (knownLead?.perfil?.includes("Homem") || lowerMsg.includes("solteir")) {
    fallbackReply = 
      `${saudacao}! Seja muito bem-vindo ao Club Casalzaum! 👑\n\n` +
      "Para manter o equilíbrio e respeito na comunidade, a entrada de homens solteiros funciona por adesão:\n\n" +
      "• *Passe Semestral (6 Meses)*: R$ 97,00 (apenas R$ 16/mês)\n" +
      "• *Passe VIP Black (12 Meses)*: R$ 167,00 (menos de R$ 14/mês com prioridade máxima)\n\n" +
      "Pix Oficial: munizmarina149@gmail.com (Marina Muniz)\n\n" +
      "Assim que fizer o pagamento, nos mande o comprovante aqui para liberarmos sua vaga! 🚀";
  } else {
    fallbackReply = 
      `${saudacao}! Seja muito bem-vindo(a) ao Club Casalzaum! 🥂\n\n` +
      "Recebemos seu contato. Para te orientar sobre o acesso aos nossos grupos ou conteúdos exclusivos, me conte: você é casal, mulher solteira ou homem solteiro?";
  }

  const finalReply = sanitizarResposta(fallbackReply, isFirstMessage, knownLead);
  recordMessage(userId, "assistant", finalReply);
  return finalReply;
}
