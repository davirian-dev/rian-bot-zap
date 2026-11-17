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
function lerTriagens() {
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
function salvarTriagens(triagens) {
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
 * Extrai campos de uma mensagem de triagem oficial
 */
function parseTriagemMessage(text) {
  if (!text.includes("TRIAGEM OFICIAL") && !text.includes("Nome / Identificação")) {
    return null;
  }

  const getField = (pattern) => {
    const match = text.match(pattern);
    return match ? match[1].trim() : "";
  };

  const nome = getField(/Nome \/ Identificação:\*?\s*([^\n\r*]+)/i) || "Candidato";
  let perfil = getField(/Perfil:\*?\s*([^\n\r*]+)/i) || "Casal Liberal";
  const idade = getField(/Idade\(?s?\)?:\*?\s*([^\n\r*]+)/i) || "Não informada";
  const cidade = getField(/Cidade\/Estado:\*?\s*([^\n\r*]+)/i) || "Salvador";
  const experiencia = getField(/Experiência:\*?\s*([^\n\r*]+)/i) || "Iniciante";
  const referencia = getField(/Perfil de Referência[^:]*:\*?\s*([^\n\r*]+)/i) || "Não informado";

  // Normalização do Perfil
  const pLower = perfil.toLowerCase();
  if (pLower.includes("casal")) {
    perfil = "Casal Liberal";
  } else if (pLower.includes("mulher") || pLower.includes("solteira")) {
    perfil = "Mulher Solteira";
  } else if (pLower.includes("homem") || pLower.includes("solteiro")) {
    perfil = "Homem Solteiro";
  }

  return { nome, perfil, idade, cidade, experiencia, referencia };
}

/**
 * Analisa e registra mensagem recebida no painel
 */
export function capturarLead(remoteJid, text) {
  if (!remoteJid || !text) return;

  const phoneOnly = remoteJid.replace(/[^0-9]/g, "");
  const triagens = lerTriagens();

  // 1. Mensagem de Triagem Oficial Estruturada
  const parsed = parseTriagemMessage(text);
  if (parsed) {
    const agora = new Date();
    const dataFormatada = `${agora.toLocaleDateString("pt-BR")} ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

    const novoRegistro = {
      id: "t-" + Date.now(),
      data: dataFormatada,
      nome: parsed.nome,
      fone: phoneOnly,
      perfil: parsed.perfil,
      cidade: parsed.cidade,
      idade: parsed.idade,
      experiencia: parsed.experiencia,
      referencia: parsed.referencia,
      valor: parsed.perfil.includes("Casal") || parsed.perfil.includes("Mulher") ? "Isento (Grátis)" : "Passe a definir",
      status: "Aguardando Foto 👍 ou Áudio",
      origem: "Site / Triagem Oficial"
    };

    // Remove registro anterior com mesmo telefone se houver, para manter atualizado
    const filtered = triagens.filter(t => t.fone !== phoneOnly);
    filtered.unshift(novoRegistro);
    salvarTriagens(filtered);

    infoLog(`[LeadCaptor] ✅ Nova triagem salva no Painel: ${parsed.nome} (${parsed.perfil} - ${parsed.cidade})`);
    return;
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

      triagens.unshift({
        id: "t-" + Date.now(),
        data: dataFormatada,
        nome: `Cliente (${phoneOnly.slice(-4)})`,
        fone: phoneOnly,
        perfil: perfilDetectado,
        cidade: "Identificando...",
        idade: "Não informada",
        experiencia: "Conversa no WhatsApp",
        referencia: "WhatsApp",
        valor: perfilDetectado.includes("Casal") || perfilDetectado.includes("Mulher") ? "Isento (Grátis)" : "Adesão Solteiro",
        status: "Em Atendimento",
        origem: "WhatsApp PV"
      });
      salvarTriagens(triagens);
      infoLog(`[LeadCaptor] Lead identificado e salvo no Painel: ${phoneOnly} (${perfilDetectado})`);
    }
  }
}
