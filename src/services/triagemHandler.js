/**
 * Manipulador Inteligente e Preciso de Triagem Oficial - Club Casalzaum
 * Garante que qualquer formulário enviado seja reconhecido imediatamente,
 * sem erros, sem dizer que veio vazio e sem alucinações.
 */

import { capturarLead, obterLeadPorTelefone } from "./leadCaptor.js";
import { infoLog } from "../utils/logger.js";

/**
 * Verifica se a mensagem é uma ficha de triagem oficial ou apresentação
 */
export function isMensagemTriagem(text) {
  if (!text) return false;
  const upper = text.toUpperCase();
  return (
    upper.includes("TRIAGEM OFICIAL") ||
    (upper.includes("NOME / IDENTIFICAÇÃO") && upper.includes("PERFIL")) ||
    (upper.includes("CIDADE/ESTADO") && upper.includes("REGRA DO PV"))
  );
}

/**
 * Gera a resposta perfeita e acolhedora para quem enviou a triagem oficial
 */
export function responderTriagemOficial(remoteJid, text) {
  // Salva no banco de dados e sincroniza com o painel web
  const dados = capturarLead(remoteJid, text);
  const lead = dados || obterLeadPorTelefone(remoteJid);

  const nome = lead?.nome || "Candidato";
  const perfil = lead?.perfil || "Casal Liberal";
  const cidade = lead?.cidade || "";
  const cidadeTexto = cidade && cidade !== "Identificando..." ? ` em ${cidade}` : "";

  infoLog(`[Triagem Handler] Gerando resposta oficial para ${nome} (${perfil}${cidadeTexto})`);

  // 1. CASAL LIBERAL
  if (perfil.toLowerCase().includes("casal")) {
    return (
      `Olá, ${nome}! Que alegria imensa receber vocês por aqui! Sejam muito bem-vindos ao Club Casalzaum! 🥂✨${cidade ? `\nQue maravilha saber que são de ${cidade}!` : ""}\n\n` +
      `Como vocês são um casal, a entrada de vocês na nossa comunidade é *100% GRATUITA*! 🎉\n\n` +
      `Já liberamos os links oficiais de acesso à nossa Portaria de Espera:\n` +
      `🚪 *Portaria no WhatsApp:* https://chat.whatsapp.com/CuqFrtYkz2B9KWlPhTcAcI\n` +
      `✈️ *Portaria no Telegram VIP:* https://t.me/+1bPY_rOD7n85YjZh\n\n` +
      `Para mantermos a segurança e liberar os outros 11 grupos temáticos da comunidade, só precisamos de uma confirmação rápida anti-fake:\n` +
      `👉 Podem nos mandar uma foto simples de vocês fazendo um sinal de legal 👍 OU um áudio curtinho de 5 segundos falando o nome de vocês e a cidade.\n\n` +
      `Entrem na portaria acima e fiquem super à vontade! Abraços, Davi & Mari.`
    );
  }

  // 2. MULHER SOLTEIRA
  if (perfil.toLowerCase().includes("mulher") || perfil.toLowerCase().includes("solteira")) {
    return (
      `Olá, ${nome}! Seja muito bem-vinda ao Club Casalzaum! 🌸✨${cidade ? `\nQue ótimo ter você com a gente de ${cidade}!` : ""}\n\n` +
      `A entrada para mulheres solteiras é *100% GRATUITA* e super acolhedora!\n\n` +
      `Já deixamos liberados os seus links de acesso à Portaria:\n` +
      `🚪 *Portaria WhatsApp:* https://chat.whatsapp.com/CuqFrtYkz2B9KWlPhTcAcI\n` +
      `✈️ *Portaria Telegram VIP:* https://t.me/+1bPY_rOD7n85YjZh\n\n` +
      `Para a moderação formalizar sua liberação em todos os grupos principais, basta uma confirmação rápida anti-fake:\n` +
      `👉 Pode nos mandar uma foto simples fazendo um legal 👍 OU um áudio de 5 segundos dizendo seu nome e cidade.\n\n` +
      `Já entra na portaria e nos avisa por aqui! Beijos, Mari & Davi.`
    );
  }

  // 3. HOMEM SOLTEIRO CRIADOR DE CONTEÚDO (+18 / ISENÇÃO DE PARCEIRO)
  if (perfil.toLowerCase().includes("criador") || text.toUpperCase().includes("CRIADOR")) {
    return (
      `Olá, ${nome}! Seja muito bem-vindo ao Club Casalzaum! 🎬👑\n\n` +
      `Recebemos sua ficha! Como você indicou que é *Homem Solteiro Criador de Conteúdo (+18)*, criadores ativos têm isenção na comunidade para fortalecer nossa rede e collabs. 🤝\n\n` +
      `Para a moderação validar seu perfil e liberar sua entrada, precisamos comprovar que você é de fato criador ativo e confirmar sua titularidade anti-fake:\n\n` +
      `1️⃣ *Perfil de Criador:* Envie o link do seu perfil ativo de criador (Privacy, OnlyFans, X/+18, SexLog ou Instagram de trabalho);\n` +
      `2️⃣ *Comprovação de Titularidade:* Envie um print simples do painel de criador logado (mostrando que a conta é sua) OU mande uma DM pela própria rede oficial confirmando seu WhatsApp;\n` +
      `3️⃣ *Verificação Anti-fake:* Uma foto simples segurando um papel escrito à mão "Club Casalzaum" e a data de hoje (ou fazendo sinal de 👍).\n\n` +
      `Assim que você enviar esses itens por aqui, a moderação já confere e libera seu acesso VIP oficial aos grupos! Tamo junto! Abraços, Davi & Mari.`
    );
  }

  // 4. HOMEM SOLTEIRO COMUM (ADESÃO PAGA)
  return (
    `Olá, ${nome}! Seja muito bem-vindo ao Club Casalzaum! 👑\n\n` +
    `Recebemos seus dados de triagem com sucesso! Para mantermos o respeito mútuo, segurança e o equilíbrio na comunidade, a entrada de homens solteiros é realizada mediante aprovação e contratação de um dos nossos Passes Oficiais com *Desconto Ativo de Black Friday*:\n\n` +
    `⭐ *Passe Semestral Black (6 Meses):* De ~R$ 97,00~ por *R$ 67,00 à vista*\n` +
    `👉 Link Cartão/Pix Mercado Pago: https://mpago.la/1oCKtkw\n\n` +
    `👑 *Passe VIP Black (12 Meses):* De ~R$ 167,00~ por *R$ 117,00 à vista*\n` +
    `👉 Link Cartão/Pix Mercado Pago: https://mpago.la/14fvgxf\n\n` +
    `💳 *Chave Pix Direta (Telefone):* 71936181632\n` +
    `🔒 *Fatura:* 100% Discreta\n\n` +
    `Assim que realizar o pagamento, envie o comprovante por aqui. A moderação irá validar no painel administrativo e liberar o seu acesso imediato! 🚀`
  );
}
