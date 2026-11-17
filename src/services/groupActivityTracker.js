/**
 * Serviço de Monitoramento de Atividade nos Grupos e Regras de Conteúdo (+18)
 * 1. Conta mensagens enviadas por cada membro na semana e no mês para classificar como "Ativo" ou "Observador".
 * 2. Notifica no grupo quando mídias/fotos íntimas forem enviadas sem Visualização Única (1x),
 *    reforçando que o conteúdo explícito aberto deve ser postado no Telegram!
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { infoLog, warningLog } from "../utils/logger.js";
import { lerContatosGrupos, salvarContatosGrupos } from "./groupMembersSaver.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ATIVIDADE_DB = path.resolve(__dirname, "../../database/atividade-membros.json");
const PAINEL_MEMBROS_DB = path.resolve(__dirname, "../../../club-casalzaum/painel/membros-reais.json");

// Controle de alerta para não floodar o grupo
const alertaDebounceMap = new Map();

/**
 * Lê o histórico de atividade dos membros
 */
export function lerAtividadeMembros() {
  try {
    if (fs.existsSync(ATIVIDADE_DB)) {
      return JSON.parse(fs.readFileSync(ATIVIDADE_DB, "utf-8") || "{}");
    }
  } catch (_) {}
  return {};
}

/**
 * Salva a atividade dos membros
 */
export function salvarAtividadeMembros(data) {
  try {
    fs.writeFileSync(ATIVIDADE_DB, JSON.stringify(data, null, 2), "utf-8");
  } catch (_) {}
}

/**
 * Registra cada mensagem enviada por um membro em qualquer grupo
 * Atualiza o status de Ativo vs Observador automaticamente
 */
export function registrarAtividadeMensagem(webMessage) {
  try {
    const remoteJid = webMessage?.key?.remoteJid;
    if (!remoteJid || !remoteJid.endsWith("@g.us")) return;

    const rawParticipant = webMessage?.key?.participant || remoteJid;
    const fone = rawParticipant.split("@")[0].replace(/[^0-9]/g, "");
    if (!fone) return;

    const atividade = lerAtividadeMembros();
    const hoje = new Date();
    const diaKey = hoje.toISOString().split("T")[0]; // YYYY-MM-DD
    const semanaKey = `${hoje.getFullYear()}-W${getWeekNumber(hoje)}`;
    const mesKey = `${hoje.getFullYear()}-${hoje.getMonth() + 1}`;

    if (!atividade[fone]) {
      atividade[fone] = {
        fone: fone,
        nome: webMessage.pushName || `Membro (${fone.slice(-4)})`,
        totalMensagens: 0,
        mensagensDia: 0,
        mensagensSemana: 0,
        mensagensMes: 0,
        ultimaMensagem: hoje.toISOString(),
        diaAtual: diaKey,
        semanaAtual: semanaKey,
        mesAtual: mesKey,
        statusClassificado: "observador"
      };
    }

    const reg = atividade[fone];

    // Reinicia contadores caso tenha mudado de dia, semana ou mês
    if (reg.diaAtual !== diaKey) {
      reg.diaAtual = diaKey;
      reg.mensagensDia = 0;
    }
    if (reg.semanaAtual !== semanaKey) {
      reg.semanaAtual = semanaKey;
      reg.mensagensSemana = 0;
    }
    if (reg.mesAtual !== mesKey) {
      reg.mesAtual = mesKey;
      reg.mensagensMes = 0;
    }

    reg.totalMensagens += 1;
    reg.mensagensDia += 1;
    reg.mensagensSemana += 1;
    reg.mensagensMes += 1;
    reg.ultimaMensagem = hoje.toISOString();
    if (webMessage.pushName) reg.nome = webMessage.pushName;

    // Regra de Classificação:
    // Se mandou 1+ mensagem hoje ou 2+ na semana: ATIVO PARTICIPATIVO!
    // Se mandou menos, é classificado como OBSERVADOR.
    if (reg.mensagensDia >= 1 || reg.mensagensSemana >= 2) {
      reg.statusClassificado = "ativo";
    } else {
      reg.statusClassificado = "observador";
    }

    salvarAtividadeMembros(atividade);

    // Sincroniza também no cadastro de membros dos grupos
    const contatos = lerContatosGrupos();
    const idx = contatos.findIndex(c => c.fone === fone);
    if (idx !== -1) {
      contatos[idx].statusModo = reg.statusClassificado;
      contatos[idx].mensagensDia = reg.mensagensDia;
      contatos[idx].mensagensSemana = reg.mensagensSemana;
      contatos[idx].mensagensMes = reg.mensagensMes;
      salvarContatosGrupos(contatos);
    }
  } catch (err) {
    infoLog(`[ActivityTracker] Erro ao registrar atividade: ${err.message}`);
  }
}

/**
 * Notifica se enviar imagem ou vídeo sem ser visualização única
 */
export async function verificarRegraVisualizacaoUnica(socket, webMessage) {
  try {
    const remoteJid = webMessage?.key?.remoteJid;
    if (!remoteJid || !remoteJid.endsWith("@g.us")) return;

    // Ignora mensagens enviadas pelo próprio bot
    if (webMessage.key.fromMe) return;

    const message = webMessage.message;
    if (!message) return;

    // Verifica se tem imagem ou vídeo
    const hasImage = !!message.imageMessage;
    const hasVideo = !!message.videoMessage;
    const isViewOnce = !!(
      message.imageMessage?.viewOnce ||
      message.videoMessage?.viewOnce ||
      message.viewOnceMessage ||
      message.viewOnceMessageV2
    );

    // Se é mídia (foto/vídeo) mas NÃO é visualização única
    if ((hasImage || hasVideo) && !isViewOnce) {
      const participant = webMessage.key.participant || remoteJid;
      const fone = participant.split("@")[0].replace(/[^0-9]/g, "");

      // Debounce de 5 minutos por grupo para não poluir
      const agora = Date.now();
      const ultimoAlerta = alertaDebounceMap.get(remoteJid) || 0;
      if (agora - ultimoAlerta < 5 * 60 * 1000) {
        return; // Já alertou recentemente neste grupo
      }
      alertaDebounceMap.set(remoteJid, agora);

      warningLog(`[Alerta Regra +18] Mídia enviada sem visualização única no grupo ${remoteJid} por +${fone}!`);

      const textoAlerta =
        `⚠️ *REGRA DE SEGURANÇA & CONTEÚDO (+18) - CLUB CASALZAUM* ⚠️\n\n` +
        `Olá família! Lembrando que aqui no WhatsApp, fotos e vídeos íntimos devem ser enviados *OBRIGATORIAMENTE em MODO VISUALIZAÇÃO ÚNICA (1x)* para preservar o sigilo e segurança do grupo.\n\n` +
        `🔞 *QUER POSTAR E ASSISTIR CONTEÚDOS ABERTOS SEM CENSURA?*\n` +
        `Todo o nosso acervo completo e trocas livres de mídias acontecem na nossa comunidade no *Telegram*:\n` +
        `👉 *Acesse o Telegram VIP:* https://t.me/+1bPY_rOD7n85YjZh\n\n` +
        `_Vamos manter o grupo seguro e no sigilo!_ 🥂✨`;

      await socket.sendMessage(remoteJid, {
        text: textoAlerta,
        mentions: [participant]
      });
    }
  } catch (err) {
    infoLog(`[ViewOnceCheck] Erro ao verificar regra de mídia: ${err.message}`);
  }
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
