/**
 * Serviço de Captação e Armazenamento Automático de Triagens e Leads
 * Registra quem entra em contato, identifica se é casal, solteira ou solteiro,
 * e alimenta o Painel Administrativo do Club Casalzaum em tempo real.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { infoLog, errorLog } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_DB_PATH = path.resolve(__dirname, "../../database/triagens-club.json");
const PAINEL_DB_PATH = path.resolve(__dirname, "../../../club-casalzaum/painel/dados-triagem.json");

/**
 * Lê a lista atual de triagens
 */
export function lerTriagens() {
  try {
    if (fs.existsSync(BOT_DB_PATH)) {
      const data = fs.readFileSync(BOT_DB_PATH, "utf-8");
      return JSON.parse(data || "[]");
    }
  } catch (_) {}
  return [];
}

/**
 * Salva a lista de triagens no banco do bot e sincroniza com o Painel Web
 */
export function salvarTriagens(triagens) {
  try {
    const jsonStr = JSON.stringify(triagens, null, 2);
    fs.writeFileSync(BOT_DB_PATH, jsonStr, "utf-8");

    // Sincroniza diretamente com o painel web se a pasta existir
    const painelDir = path.dirname(PAINEL_DB_PATH);
    if (fs.existsSync(painelDir)) {
      fs.writeFileSync(PAINEL_DB_PATH, jsonStr, "utf-8");
    }
  } catch (err) {
    errorLog(`[LeadCaptor] Erro ao salvar triagens: ${err.message}`);
  }
}

/**
 * Obtém lead cadastrado pelo número de telefone
 */
export function obterLeadPorTelefone(remoteJid) {
  if (!remoteJid) return null;
  const phoneOnly = remoteJid.replace(/[^0-9]/g, "");
  const triagens = lerTriagens();
  return triagens.find(t => t.fone === phoneOnly) || null;
}

/**
 * Extrai campos de uma mensagem de triagem oficial
 */
function parseTriagemMessage(text) {
  if (!text) return null;

  const upper = text.toUpperCase();
  if (!upper.includes("TRIAGEM OFICIAL") && !upper.includes("NOME / IDENTIFICAÇÃO")) {
    return null;
  }

  const getField = (pattern) => {
    const match = text.match(pattern);
    return match ? match[1].trim().replace(/^[*_~`]+|[*_~`]+$/g, "") : "";
  };

  const nome = getField(/(?:Nome \/ Identificação|Nome|Identificação):?\*?\s*([^\n\r*]+)/i) || "Candidato";
  let perfil = getField(/Perfil:\*?\s*([^\n\r*]+)/i) || "Casal Liberal";
  const quemEntra = getField(/(?:Quem vai entrar nos grupos|Participação nos grupos):?\*?\s*([^\n\r*]+)/i) || "📱 Ambos no mesmo número de WhatsApp";
  const idade = getField(/Idade\(?s?\)?:\*?\s*([^\n\r*]+)/i) || "Não informada";
  const cidade = getField(/Cidade\/Estado:\*?\s*([^\n\r*]+)/i) || "Salvador";
  const experiencia = getField(/Experiência:\*?\s*([^\n\r*]+)/i) || "Iniciante";
  const referencia = getField(/(?:Perfil de Referência|Link do Perfil de Criador|Link Criador)[^:]*:\*?\s*([^\n\r*]+)/i) || "Não informado";
  const objetivo = getField(/Objetivo Principal|Objetivo:\*?\s*([^\n\r*]+)/i) || "Encontros e conexões liberais";
  const vendeConteudo = getField(/Produz\/Vende Conteúdo:\*?\s*([^\n\r*]+)/i) || "Não";
  const collab = getField(/Interesse em Collab:\*?\s*([^\n\r*]+)/i) || "Não";
  const festas = getField(/Interesse em Festas:\*?\s*([^\n\r*]+)/i) || "Não";
  const compraConteudo = getField(/Comprador de Conteúdo:\*?\s*([^\n\r*]+)/i) || "Não";
  const regraPv = getField(/Regra do (?:seu )?PV:\*?\s*([^\n\r*]+)/i) || "🔒 PV com Permissão";
  const grupoInteresse = getField(/Subgrupo de Maior Interesse:\*?\s*([^\n\r*]+)/i) || "Geral";

  const isCriador = 
    upper.includes("CRIADOR +18") ||
    upper.includes("CRIADOR DE CONTEÚDO") ||
    upper.includes("ISENÇÃO ESPECIAL DE CRIADOR") ||
    upper.includes("PARCERIA CRIADOR");

  // Normalização do Perfil
  const pLower = perfil.toLowerCase();
  if (isCriador || pLower.includes("criador")) {
    perfil = "Homem Solteiro (Criador +18)";
  } else if (pLower.includes("casal")) {
    perfil = "Casal Liberal (Homem e Mulher)";
  } else if (pLower.includes("mulher") || pLower.includes("solteira")) {
    perfil = "Mulher Solteira";
  } else if (pLower.includes("homem") || pLower.includes("solteiro")) {
    perfil = "Homem Solteiro";
  }

  return { nome, perfil, idade, cidade, experiencia, referencia, objetivo, grupoInteresse, vendeConteudo, collab, festas, compraConteudo, regraPv };
}

/**
 * Analisa e registra mensagem recebida no painel
 */
export function capturarLead(remoteJid, text) {
  if (!remoteJid || !text) return null;

  const phoneOnly = remoteJid.replace(/[^0-9]/g, "");

  // Ignora IDs internos LID que não são números de telefone reais
  if (!phoneOnly.startsWith("55") || phoneOnly.length < 11 || phoneOnly.length > 13) {
    return null;
  }

  const triagens = lerTriagens();

  // 1. Mensagem de Triagem Oficial Estruturada
  const parsed = parseTriagemMessage(text);
  if (parsed) {
    const agora = new Date();
    const dataFormatada = `${agora.toLocaleDateString("pt-BR")} ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

    const isCriador = parsed.perfil.includes("Criador");
    const isSolteiroComum = (parsed.perfil.includes("Homem") || parsed.perfil.includes("Solteiro")) && !isCriador;

    let valorLead = "Isento (Grátis)";
    let statusLead = "Aguardando Foto 👍 ou Áudio";

    if (isCriador) {
      valorLead = "Isento (Parceria Criador +18)";
      statusLead = "Aguardando Comprovação de Criador (Print / Link)";
    } else if (isSolteiroComum) {
      valorLead = "R$ 97,00 (Passe Semestral)";
      statusLead = "Aguardando Pagamento";
    }

    const novoRegistro = {
      id: "t-" + Date.now(),
      data: dataFormatada,
      nome: parsed.nome,
      fone: phoneOnly,
      perfil: parsed.perfil,
      quemEntra: parsed.quemEntra,
      cidade: parsed.cidade,
      idade: parsed.idade,
      experiencia: parsed.experiencia,
      referencia: parsed.referencia,
      objetivo: parsed.objetivo,
      grupoInteresse: parsed.grupoInteresse,
      vendeConteudo: parsed.vendeConteudo,
      collab: parsed.collab,
      festas: parsed.festas,
      compraConteudo: parsed.compraConteudo,
      regraPv: parsed.regraPv,
      valor: valorLead,
      status: statusLead,
      origem: isCriador ? "Site / Solicitação Criador" : "Site / Triagem Oficial"
    };

    // Remove registro anterior com mesmo telefone se houver, para manter atualizado
    const filtered = triagens.filter(t => t.fone !== phoneOnly);
    filtered.unshift(novoRegistro);
    salvarTriagens(filtered);

    infoLog(`[LeadCaptor] ✅ Nova triagem salva no Painel: ${parsed.nome} (${parsed.perfil} - ${parsed.cidade})`);
    return novoRegistro;
  }

  // 2. Se o cliente falar "Casal" ou "Solteira" durante a conversa
  const textLower = text.toLowerCase();
  if (textLower.includes("casal") || textLower.includes("solteira") || textLower.includes("solteiro")) {
    let perfilDetectado = "Casal Liberal";
    if (textLower.includes("solteira") || textLower.includes("mulher")) {
      perfilDetectado = "Mulher Solteira";
    } else if (textLower.includes("homem solteiro") || (textLower.includes("solteiro") && !textLower.includes("casal"))) {
      perfilDetectado = "Homem Solteiro";
    }

    const existe = triagens.find(t => t.fone === phoneOnly);
    if (!existe) {
      const agora = new Date();
      const dataFormatada = `${agora.toLocaleDateString("pt-BR")} ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

      const isSolt = perfilDetectado === "Homem Solteiro";
      const novoLead = {
        id: "t-" + Date.now(),
        data: dataFormatada,
        nome: `Cliente (${phoneOnly.slice(-4)})`,
        fone: phoneOnly,
        perfil: perfilDetectado,
        cidade: "Identificando...",
        idade: "Não informada",
        experiencia: "Conversa no WhatsApp",
        referencia: "WhatsApp",
        valor: isSolt ? "R$ 97,00 (Passe Semestral)" : "Isento (Grátis)",
        status: isSolt ? "Aguardando Pagamento" : "Em Atendimento",
        origem: "WhatsApp PV"
      };
      triagens.unshift(novoLead);
      salvarTriagens(triagens);
      infoLog(`[LeadCaptor] Lead identificado e salvo no Painel: ${phoneOnly} (${perfilDetectado})`);
      return novoLead;
    }
    return existe;
  }

  return null;
}
