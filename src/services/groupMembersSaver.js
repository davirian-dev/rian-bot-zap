/**
 * Serviço de Rastreamento e Armazenamento de Membros de Grupos
 * Captura todos os contatos que já estão nos grupos e salva automaticamente
 * qualquer novo membro que for entrando em tempo real.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { infoLog, errorLog, successLog } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_GRUPOS_DB = path.resolve(__dirname, "../../database/contatos-grupos.json");
const PAINEL_GRUPOS_DB = path.resolve(__dirname, "../../../club-casalzaum/painel/contatos-grupos.json");
const TRIAGENS_DB = path.resolve(__dirname, "../../database/triagens-club.json");
const PAINEL_TRIAGENS_DB = path.resolve(__dirname, "../../../club-casalzaum/painel/dados-triagem.json");

/**
 * Lê os contatos salvos de grupos
 */
export function lerContatosGrupos() {
  try {
    if (fs.existsSync(BOT_GRUPOS_DB)) {
      const data = fs.readFileSync(BOT_GRUPOS_DB, "utf-8");
      return JSON.parse(data || "[]");
    }
  } catch (_) {}
  return [];
}

/**
 * Salva a lista de contatos dos grupos no banco e sincroniza com o Painel Web
 */
export function salvarContatosGrupos(lista) {
  try {
    const jsonStr = JSON.stringify(lista, null, 2);
    fs.writeFileSync(BOT_GRUPOS_DB, jsonStr, "utf-8");

    const painelDir = path.dirname(PAINEL_GRUPOS_DB);
    if (fs.existsSync(painelDir)) {
      fs.writeFileSync(PAINEL_GRUPOS_DB, jsonStr, "utf-8");
    }
  } catch (err) {
    errorLog(`[GroupMembersSaver] Erro ao salvar contatos dos grupos: ${err.message}`);
  }
}

/**
 * Sincroniza todos os membros de todos os grupos onde o bot está participando
 */
export async function sincronizarTodosGrupos(socket) {
  try {
    if (!socket || typeof socket.groupFetchAllParticipating !== "function") {
      return { totalContatos: 0, totalGrupos: 0 };
    }

    infoLog("[GroupTracker] 🔄 Iniciando varredura e mapeamento de todos os membros nos grupos...");
    const grupos = await socket.groupFetchAllParticipating();
    const gruposEntries = Object.entries(grupos || {});

    let contatosExistentes = lerContatosGrupos();
    let novosCount = 0;
    let atualizadosCount = 0;

    // Carrega triagens existentes para enriquecer com nomes reais conhecidos (ex: Camila Solteira)
    let triagens = [];
    try {
      if (fs.existsSync(TRIAGENS_DB)) {
        triagens = JSON.parse(fs.readFileSync(TRIAGENS_DB, "utf-8") || "[]");
      }
    } catch (_) {}

    for (const [groupId, meta] of gruposEntries) {
      const grupoNome = meta.subject || "Grupo WhatsApp";
      const participants = meta.participants || [];

      for (const p of participants) {
        const jid = p.id || "";
        const fone = jid.split("@")[0].replace(/[^0-9]/g, "");
        if (!fone) continue;

        // Procura se tem nome cadastrado na triagem
        const lead = triagens.find(t => t.fone === fone);
        let nomeContato = lead ? lead.nome : `Membro (${fone.slice(-4)})`;

        // Se for identificado como Camila ou mulher solteira
        if (nomeContato.toLowerCase().includes("camila") || lead?.perfil?.includes("Mulher")) {
          nomeContato = lead?.nome || "Camila Solteira";
        }

        const indexExistente = contatosExistentes.findIndex(c => c.fone === fone && c.grupoId === groupId);

        if (indexExistente === -1) {
          contatosExistentes.push({
            id: `grp-${fone}-${Date.now()}`,
            fone: fone,
            jid: jid,
            nome: nomeContato,
            grupoId: groupId,
            grupoNome: grupoNome,
            isAdmin: p.admin === "admin" || p.admin === "superadmin",
            dataRegistro: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            status: "No Grupo",
            perfil: lead ? lead.perfil : "Membro do Grupo"
          });
          novosCount++;
        } else {
          // Atualiza dados
          contatosExistentes[indexExistente].grupoNome = grupoNome;
          contatosExistentes[indexExistente].isAdmin = p.admin === "admin" || p.admin === "superadmin";
          if (lead && lead.nome && !contatosExistentes[indexExistente].nome.includes(lead.nome)) {
            contatosExistentes[indexExistente].nome = lead.nome;
          }
          atualizadosCount++;
        }
      }
    }

    salvarContatosGrupos(contatosExistentes);
    successLog(`[GroupTracker] ✅ Varredura concluída! ${gruposEntries.length} grupos verificados, ${contatosExistentes.length} membros mapeados (${novosCount} novos adicionados).`);
    return {
      totalGrupos: gruposEntries.length,
      totalContatos: contatosExistentes.length,
      novos: novosCount
    };
  } catch (err) {
    errorLog(`[GroupTracker] Erro ao sincronizar grupos: ${err.message}`);
    return { totalContatos: 0, totalGrupos: 0, erro: err.message };
  }
}

/**
 * Registra a entrada de novos participantes em tempo real via evento Baileys
 */
export async function registrarEventoParticipante(socket, data) {
  try {
    const { id: remoteJid, participants, action } = data;
    if (!remoteJid || !participants || !participants.length) return;

    // Nos interessa principalmente a entrada de membros
    if (action !== "add") return;

    let grupoNome = "Grupo WhatsApp";
    try {
      const meta = await socket.groupMetadata(remoteJid);
      if (meta && meta.subject) {
        grupoNome = meta.subject;
      }
    } catch (_) {}

    const contatos = lerContatosGrupos();
    let triagens = [];
    try {
      if (fs.existsSync(TRIAGENS_DB)) {
        triagens = JSON.parse(fs.readFileSync(TRIAGENS_DB, "utf-8") || "[]");
      }
    } catch (_) {}

    const agora = new Date();
    const dataHoraStr = agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    for (const p of participants) {
      const jid = typeof p === "string" ? p : p.id;
      const fone = (jid || "").split("@")[0].replace(/[^0-9]/g, "");
      if (!fone) continue;

      infoLog(`[GroupTracker] 📥 NOVO MEMBRO DETECTADO: +${fone} acabou de entrar no grupo "${grupoNome}"!`);

      // 1. Salva nos contatos de grupos
      const existeNoGrupo = contatos.some(c => c.fone === fone && c.grupoId === remoteJid);
      if (!existeNoGrupo) {
        contatos.unshift({
          id: `grp-${fone}-${Date.now()}`,
          fone: fone,
          jid: jid,
          nome: `Novo Membro (${fone.slice(-4)})`,
          grupoId: remoteJid,
          grupoNome: grupoNome,
          isAdmin: false,
          dataRegistro: dataHoraStr,
          status: "Entrou Recentemente",
          perfil: "Entrou no Grupo"
        });
      }

      // 2. Se o grupo for do Club Casalzaum (Portaria, Geral, etc.), cria / atualiza na triagem oficial
      const triagemExiste = triagens.find(t => t.fone === fone);
      if (!triagemExiste) {
        triagens.unshift({
          id: "t-" + Date.now(),
          data: dataHoraStr,
          nome: `Membro Portaria (${fone.slice(-4)})`,
          fone: fone,
          perfil: "Em Identificação",
          cidade: "Identificando...",
          idade: "Não informada",
          experiencia: `Entrou no grupo: ${grupoNome}`,
          referencia: "Entrou no Grupo WhatsApp",
          valor: "Isento (Grátis)",
          status: "Entrou na Portaria / Grupo",
          origem: `Grupo: ${grupoNome}`
        });
      } else {
        triagemExiste.status = `Entrou no Grupo: ${grupoNome}`;
      }
    }

    salvarContatosGrupos(contatos);

    // Sincroniza triagens atualizadas com a nova entrada
    try {
      const jsonStr = JSON.stringify(triagens, null, 2);
      fs.writeFileSync(TRIAGENS_DB, jsonStr, "utf-8");
      const painelDir = path.dirname(PAINEL_TRIAGENS_DB);
      if (fs.existsSync(painelDir)) {
        fs.writeFileSync(PAINEL_TRIAGENS_DB, jsonStr, "utf-8");
      }
    } catch (_) {}

    successLog(`[GroupTracker] ✅ Contato(s) de quem entrou no grupo "${grupoNome}" salvo(s) com sucesso no banco e painel!`);
  } catch (err) {
    errorLog(`[GroupTracker] Erro ao registrar evento de participante: ${err.message}`);
  }
}

/**
 * Inicia o rastreamento periódico dos grupos
 */
export function iniciarRastreamentoGrupos(socket) {
  // Executa uma varredura após 8 segundos para estabilização da conexão
  setTimeout(() => {
    sincronizarTodosGrupos(socket);
  }, 8000);

  // Reexecuta periodicamente a cada 15 minutos para manter 100% atualizado
  setInterval(() => {
    sincronizarTodosGrupos(socket);
  }, 15 * 60 * 1000);
}
