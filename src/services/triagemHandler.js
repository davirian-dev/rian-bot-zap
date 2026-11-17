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
      `Para garantir a segurança de todos os membros e liberar o link de acesso aos nossos grupos, só precisamos de uma verificação rápida anti-fake:\n` +
      `👉 Podem nos mandar uma foto simples de vocês fazendo um sinal de legal 👍 OU um áudio curtinho de 5 segundos falando o nome de vocês e a cidade.\n\n` +
      `O que for mais prático para vocês! Assim que recebermos, já liberamos o link oficial de entrada na Portaria. Fiquem super à vontade! Abraços, Davi & Mari.`
    );
  }

  // 2. MULHER SOLTEIRA
  if (perfil.toLowerCase().includes("mulher") || perfil.toLowerCase().includes("solteira")) {
    return (
      `Olá, ${nome}! Seja muito bem-vinda ao Club Casalzaum! 🌸✨${cidade ? `\nQue ótimo ter você com a gente de ${cidade}!` : ""}\n\n` +
      `A entrada para mulheres solteiras é *100% GRATUITA* e super acolhedora!\n\n` +
      `Para mantermos o ambiente seguro e livre de perfis fakes, precisamos apenas de uma rápida confirmação:\n` +
      `👉 Pode nos mandar uma foto simples fazendo um legal 👍 OU um áudio de 5 segundos dizendo seu nome e cidade.\n\n` +
      `Assim que nos enviar, já te mando o link oficial para entrar na nossa Portaria! Beijos, Mari & Davi.`
    );
  }

  // 3. HOMEM SOLTEIRO
  return (
    `Olá, ${nome}! Seja muito bem-vindo ao Club Casalzaum! 👑\n\n` +
    `Recebemos seus dados de triagem com sucesso! Para mantermos o respeito mútuo, segurança e o equilíbrio na comunidade, a entrada de homens solteiros é realizada mediante aprovação e contratação de um dos nossos Passes Oficiais:\n\n` +
    `⭐ *Passe Semestral (6 Meses):* R$ 97,00 (apenas R$ 16/mês)\n` +
    `👑 *Passe VIP Black (12 Meses):* R$ 167,00 (menos de R$ 14/mês com máxima prioridade)\n\n` +
    `💳 *Chave Pix Oficial:* munizmarina149@gmail.com\n` +
    `👤 *Titular:* Marina Muniz\n\n` +
    `Assim que realizar o Pix, envie o comprovante por aqui. A moderação irá validar no painel administrativo e liberar o seu acesso imediato! 🚀`
  );
}
