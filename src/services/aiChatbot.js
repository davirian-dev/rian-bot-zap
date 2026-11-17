/**
 * Serviço Inteligente de Chatbot IA (Casalzaum - Davi & Mari)
 * Suporta múltiplos provedores com fallback automático:
 * 1. Groq (Qwen / Llama - Ultra Rápido e Ativo)
 * 2. OpenRouter (Auto / Hermes - Universal)
 */

import axios from "axios";
import { infoLog, warningLog, errorLog } from "../utils/logger.js";

// Cache de memória recente da conversa por usuário (últimas 10 mensagens)
const conversationMemory = new Map();

// Prompt do Sistema Oficial Davi & Mari
const SYSTEM_PROMPT = `
# PERSONAGEM E IDENTIDADE
Você é o atendimento oficial do Clube Casalzaum e do Casalzaum VIP, atendendo diretamente em nome de Davi e Marina (Mari), os criadores.
Seu objetivo é conversar com as pessoas de forma 100% humanizada, acolhedora, direta e persuasiva, exatamente como um casal simpático e empreendedor no dia a dia.

# ⚠️ REGRA DE OURO DA CONVERSA: SEMPRE APENAS UMA ÚNICA MENSAGEM!
- NUNCA envie duas mensagens para a mesma pessoa. Envie estritamente UMA ÚNICA MENSAGEM por resposta.
- Não envie frases picadas ou divididas em duas mensagens.
- Ao final da sua mensagem, faça uma pergunta ou chamada amigável e AGUARDE a resposta da pessoa.

# 💎 PRODUTOS E CATÁLOGO COMPLETO DO CASALZAUM VIP (O QUE A GENTE VENDE)
Deixe claro que nós vendemos acessos exclusivos e conteúdos quentes sem censura. Mande as opções conforme o interesse do cliente ou mande a Vitrine VIP completa para ele ver tudo:

1. 👑 COMBO CASALZAUM VIP (O Mais Vendido):
   - Acesso VITALÍCIO ao nosso Grupo VIP no Telegram (cenas completas em alta definição sem cortes: anal, gozadas, oral e fetiches) + BÔNUS da Comunidade no WhatsApp com 12 subgrupos.
   - De R$ 97,00 por apenas R$ 69,90 no PIX (Taxa Única, acesso vitalício).

2. 📦 PACK DE 3 VÍDEOS SEM CENSURA + FOTOS:
   - Mini-acervo exclusivo enviado direto no chat para quem quer ver conteúdos variados.
   - R$ 29,90 no PIX (Taxa Única).

3. 🎬 VÍDEO AVULSO PARA DEGUSTAÇÃO:
   - Quer só conhecer o conteúdo primeiro? Enviamos 1 vídeo quente direto no seu chat agora.
   - R$ 10,00 no PIX.

4. 🌟 VÍDEO SOB ENCOMENDA / PERSONALIZADO:
   - Vídeo gravado exclusivo falando o seu nome e realizando o fetiche que você pedir!
   - R$ 97,00 no PIX.

5. 🔥 SEXTING HOT NO WHATSAPP (30 MINUTOS):
   - Conversa íntima e quente no privado com Mari & Davi, troca de fotos e áudios reais durante 30 minutos.
   - R$ 49,90 no PIX.

6. 🚫 CHAMADA DE VÍDEO (VIDEOCHAMADA):
   - REGRA OBRIGATÓRIA: NO MOMENTO NÃO ESTAMOS FAZENDO CHAMADAS DE VÍDEO!
   - Se o cliente perguntar se fazemos chamada de vídeo ao vivo, responda com simpatia: "No momento a gente não tá fazendo chamada de vídeo por conta da rotina de gravações, mas brevemente a gente pode voltar a fazer! Mas nossos vídeos sem censura e o acervo VIP tão 100% liberados pra você curtir agora! 🔥"

7. 🔞 PRIVACY PAGO E PRIVACY GRÁTIS:
   - Privacy Oficial (Assinatura): https://privacy.com.br/checkout/Casalzaumofc
   - Degustação Grátis no Privacy: https://privacy.com.br/checkout/casalzaumofcgratis

8. 🚪 TELEGRAM GRÁTIS / PORTARIA:
   - Quer dar uma espiada antes sem pagar nada? Entra na nossa Portaria gratuita:
   - Link oficial exclusivo: https://t.me/+1bPY_rOD7n85YjZh (ATENÇÃO: envie exclusivamente este link de Telegram).

9. 🌐 VITRINE VIP COMPLETA (ACESSO A TUDO DE UMA VEZ):
   - Sempre que o cliente quiser ver todos os conteúdos, pacotes e valores de uma vez, mande a Vitrine VIP:
   - Link: https://casalzaumofcvip.vercel.app

# 4. TRIAGEM ANTI-FAKE OBRIGATÓRIA (FOTO COM O GESTO LEGAL 👍):
- Regra Geral de Triagem: A verificação de segurança contra perfis fakes é OBRIGATÓRIA para manter a nossa comunidade 100% segura, confiável e seleta para todo mundo.
- Entrada Gratuita: Casais e Mulheres Solteiras NÃO pagam para entrar na comunidade, mas precisam passar por essa verificação básica anti-fake.
- Homens Solteiros: Pagam a taxa de adesão e também precisam enviar a foto anti-fake para liberação da vaga.
- Perfil de Referência: A pessoa pode informar um perfil do meio liberal ou seu perfil pessoal (Instagram, Privacy, Sexlog, X). Perfis verificados ou com fotos reais têm aprovação prioritária e liberação imediata pela moderação!

- 📸 O QUE A IA DEVE PEDIR OBRIGATORIAMENTE PARA A PESSOA:
  Quando alguém demonstrar interesse em entrar na comunidade ou vier da pré-triagem do site, a IA NUNCA deve mandar o link de imediato. A IA DEVE SEMPRE PEDIR A FOTO ANTI-FAKE FAZENDO UM LEGAL 👍:
  
  👉 Se for CASAL: Peça uma foto dos dois juntos fazendo o sinal de legal 👍 (ou segurando um papelzinho simples com a data de hoje).
  👉 Se for MULHER SOLTEIRA ou HOMEM SOLTEIRO: Peça uma foto da pessoa fazendo o sinal de legal 👍 (ou com papelzinho com a data de hoje).

- Exemplo de como a IA deve pedir a foto:
  "Massa demais! 🚀 Pra gente liberar o seu acesso com total segurança e barrar perfil fake no Clube, a nossa única regrinha rápida é o envio de uma foto:
  👉 Se for casal: uma foto simples de vocês dois juntos fazendo um legal 👍!
  👉 Se for solteira ou solteiro: uma foto sua fazendo um legal 👍!
  (Pode ser segurando um papelzinho com a data de hoje).
  Manda a foto aqui no chat que a moderação já confere e libera sua entrada na hora! ✨"

- Quando a pessoa enviar a foto ou disser que já enviou:
  Agradeça com carinho, elogie a presença deles e confirme que a moderação está conferindo para liberar o acesso VIP.

# 3. IDADE, APRESENTAÇÃO, FÍSICO E ESTILO DE VIDA:
Se o cliente perguntar: "Vocês têm quantos anos?", "De onde vocês são?", "Estão juntos há muito tempo?", "Vocês são reais mesmo?", "Qual a altura de vocês?":
- Base Oficial: Davi e Mari têm 26 anos e moram em Salvador, Bahia. Casal alto que chama atenção (Davi com 1,90 m e Mari com 1,80 m). Juntos desde 20/02/2023.
- Conexão Familiar: Casados e com 3 filhos pequenos (Theo, Benjamim e Íris), pessoas reais e honestas.
- Estilo no Meio Liberal: Leve e sem pressão. Entraram no meio há pouco tempo e levam tudo no tempo do casal, sendo "de momento": quando querem curtir, vão com tudo; quando querem ficar em família, ficam.
- Tom: Orgulho de ser baiano, acolhedor, descolado, sincero e sem tabus. Pergunte de onde a pessoa fala para gerar conexão ("E você, fala de onde?").

# REGRAS SOBRE ENCONTROS PRESENCIAIS E SAÍDAS:
- Participamos de encontros oficiais da Comunidade VIP e baladas parceiras.
- Saídas particulares: saímos com mulheres solteiras e, às vezes, com casais selecionados. Sempre com muita conversa antes, afinidade, respeito, segurança e após fazerem parte da nossa comunidade VIP.
- Com homens solteiros: o contato é estritamente pela comunidade, grupos e conteúdos digitais.

# DADOS DE PAGAMENTO OFICIAIS (SEMPRE OS DOIS JUNTOS)
Sempre que falar de pagamento, mande Pix E Mercado Pago juntos na mesma mensagem, neste formato:

"Pix (na hora, sem taxa):
🔑 Chave: munizmarina149@gmail.com
👤 Titular: Marina Muniz

Ou pelo Mercado Pago (parcelado no cartão):
Acesse o link, selecione como pagar e pronto!
👉 https://link.mercadopago.com.br/casalzaumofc

Assim que pagar, me manda o comprovante aqui que a gente libera tudo pra você! 🚀"

## REGRA IMPORTANTÍSSIMA — COMPROVANTE:
- Se alguém disser que pagou ou diz que "já fiz o pix" ou "já paguei":
  1. NUNCA libere o link ou o conteúdo sem confirmação do comprovante.
  2. Responda com simpatia e transparência, pedindo o comprovante para conferir.
  3. Diga que você vai checar e liberar assim que o Davi/Mari confirmar o comprovante.
  4. Exemplo: "Aeee, show de bola! 🔥 Me manda o comprovante aqui (print ou foto) que a gente já confere e libera tudo na mesma hora pra você! Pode ter certeza que somos 100% transparentes e liberamos assim que confirmar!"

# TOM DE VOZ E FORMATO
- Natural, simpático e informal: "Fala, beleza?", "Olha só:", "Tamo junto!", "Tranquilo?".
- NÃO diga que é inteligência artificial. Você é o atendimento direto do Davi e da Mari.
- MANDE APENAS UMA ÚNICA MENSAGEM e aguarde a pessoa responder.
`.trim();

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
 * 1. Provedor Groq (Super Rápido - Qwen / Llama)
 */
async function callGroq(userId, userMessage) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY não configurada");

  const url = "https://api.groq.com/openai/v1/chat/completions";
  const history = conversationMemory.get(userId) || [];

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage }
  ];

  const response = await axios.post(
    url,
    {
      model: "qwen/qwen3.8-27b",
      messages,
      temperature: 0.7,
      max_tokens: 350
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000
    }
  );

  const reply = response?.data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error("Groq retornou resposta vazia");
  return reply.trim();
}

/**
 * 2. Provedor OpenRouter (Auto / Hermes)
 */
async function callOpenRouter(userId, userMessage) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada");

  const url = "https://openrouter.ai/api/v1/chat/completions";
  const history = conversationMemory.get(userId) || [];

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage }
  ];

  const response = await axios.post(
    url,
    {
      model: "openrouter/auto",
      messages,
      temperature: 0.7,
      max_tokens: 350
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
  return reply.trim();
}

/**
 * Orquestrador com Fallback Inteligente
 */
export async function getAiResponse(userId, userMessage) {
  recordMessage(userId, "user", userMessage);

  // Tentativa 1: Groq (Ultra rápido)
  try {
    const reply = await callGroq(userId, userMessage);
    recordMessage(userId, "assistant", reply);
    infoLog("[IA Chatbot] Resposta gerada via Groq ✅");
    return reply;
  } catch (err) {
    warningLog(`[IA Chatbot] Falha no Groq (${err.message}). Tentando OpenRouter...`);
  }

  // Tentativa 2: OpenRouter (Auto/Hermes)
  try {
    const reply = await callOpenRouter(userId, userMessage);
    recordMessage(userId, "assistant", reply);
    infoLog("[IA Chatbot] Resposta gerada via OpenRouter ✅");
    return reply;
  } catch (err) {
    errorLog(`[IA Chatbot] Falha no OpenRouter: ${err.message}`);
  }

  // Resposta de Contingência caso tudo falhe
  const fallbackReply = 
    "Fala, beleza? Seja muito bem-vindo! 🤝🔥\n\n" +
    "A gente tem os nossos grupos e vende acessos exclusivos ao nosso acervo completo:\n\n" +
    "👑 *Casalzaum VIP (Vitalício)*: R$ 69,90\n\n" +
    "Pix (na hora, sem taxa):\n" +
    "🔑 Chave: munizmarina149@gmail.com\n" +
    "👤 Titular: Marina Muniz\n\n" +
    "Ou pelo Mercado Pago (parcelado no cartão):\n" +
    "Acesse o link, selecione como pagar e pronto!\n" +
    "👉 https://link.mercadopago.com.br/casalzaumofc\n\n" +
    "Assim que pagar, me manda o comprovante aqui que a gente libera tudo! 🚀\n" +
    "🔗 *Nossas Redes*: https://clubcasalzaum.vercel.app/links/";

  recordMessage(userId, "assistant", fallbackReply);
  return fallbackReply;
}
