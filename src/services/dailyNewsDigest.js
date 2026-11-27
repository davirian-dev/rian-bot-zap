import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import OpenAI from "openai";
import { getRawMediaUploadData, uploadWithNodeHttp } from "../../node_modules/baileys/lib/Utils/messages-media.js";
import { encodeNewsletterMessage, generateMessageIDV2 } from "../../node_modules/baileys/lib/Utils/generics.js";
import { DEFAULT_ORIGIN } from "../../node_modules/baileys/lib/Defaults/index.js";
import { WAProto } from "../../node_modules/baileys/lib/Types/index.js";
import { getActiveSocket } from "../connection.js";
import { errorLog, infoLog, warningLog } from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.resolve(__dirname, "../../database/daily-digest-state.json");
const DB_PATH = "C:\\Projetos\\portal-noticias-liberal\\backend\\data\\noticias.db";

function queryNoticiasFromDb(limit = 20, maxAgeDays = 14) {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const rows = db
      .prepare("SELECT * FROM noticias WHERE status = 'published' ORDER BY id DESC LIMIT ?")
      .all(limit * 3);
    db.close();

    const cutoffMs = Date.now() - maxAgeDays * 86_400_000;
    const recent = (rows || [])
      .map((r) => {
        const ts = Date.parse(r.published_date || "") || 0;
        return { ...r, _pubTs: ts };
      })
      .filter((r) => r._pubTs >= cutoffMs)
      .sort((a, b) => b._pubTs - a._pubTs);

    return recent.slice(0, limit);
  } catch (err) {
    warningLog(`DailyDigest: Falha ao ler banco SQLite: ${err.message}`);
    return [];
  }
}

export async function buildTopicStyleNewsletter(limit = 4) {
  const rows = queryNoticiasFromDb(15);
  let items = rows.filter((n) => n.image_url && n.image_url.startsWith("http"));
  if (items.length === 0) {
    items = rows;
  }

  if (items.length === 0) {
    return {
      imageUrl: null,
      caption: await generateClubCasalzaumDigest(),
    };
  }

  const mainItem = items[0];
  const selectedItems = items.slice(0, limit);

  const lines = [
    "🔥 *Club Casalzaum News • Universo Liberal, Festas & Creators*",
    "Edição Matinal",
    "",
    "⭐ *Notícia em Destaque*",
    `📝 *${mainItem.title}*`,
    mainItem.summary,
    `🔗 ${mainItem.original_url}`,
    "",
    "---",
    "",
  ];

  const grouped = {};
  for (const item of selectedItems.slice(1)) {
    const cat = item.category || "Geral";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  for (const [catName, catItems] of Object.entries(grouped)) {
    let icon = "💬";
    if (catName.includes("Salvador")) icon = "📍";
    else if (catName.includes("Brasil")) icon = "🇧🇷";
    else if (catName.includes("Mundo")) icon = "🌍";
    else if (catName.includes("Criadores")) icon = "💎";
    else if (catName.includes("Eventos")) icon = "🥂";
    else if (catName.includes("Comportamento")) icon = "✨";

    lines.push(`${icon} *${catName}*`);
    for (const it of catItems) {
      lines.push(`📝 *${it.title}*`);
      lines.push(it.summary);
      lines.push(`🔗 ${it.original_url}`);
      lines.push("");
    }
  }

  lines.push("📢 *Acompanhe tudo em tempo real no nosso Canal Oficial:*");
  lines.push("👉 https://whatsapp.com/channel/0029VbEHUMvFnSz2CnO59y3L");
  lines.push("");
  lines.push("_Club Casalzaum • Liberdade com elegância_");

  return {
    imageUrl: mainItem.image_url,
    caption: lines.join("\n"),
  };
}

function getTodayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

function getCurrentTimeBR() {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    }
  } catch {
    // ignore
  }
  return { lastSentDate: null };
}

function saveState(state) {
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    warningLog(`DailyDigest: não foi possível salvar estado: ${err.message}`);
  }
}

export async function generateClubCasalzaumDigest() {
  const apiKey = process.env.OPENAI_API_KEY;
  const today = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "long",
  }).format(new Date());

  const footer = [
    "",
    "📢 *Acompanhe tudo em tempo real no nosso Canal:*",
    "👉 https://whatsapp.com/channel/0029VbEHUMvFnSz2CnO59y3L",
    "",
    "_Club Casalzaum • Liberdade com elegância_",
  ].join("\n");

  if (apiKey) {
    try {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content:
              "Você é o editor de notícias e engajamento da comunidade Club Casalzaum (meio liberal, swing, não-monogamia ética, festas e encontros de casais). Escreva em português do Brasil, tom leve, elegante, respeitoso e envolvente, sem conteúdo explícito/pornográfico.",
          },
          {
            role: "user",
            content: `Crie a mensagem diária de hoje (${today}) exatamente no estilo de boletim de grupo de WhatsApp:

NA EDIÇÃO DE HOJE
🔥 [Manchete/tendência sobre o meio liberal ou relacionamentos abertos]
🥂 [Novidade sobre eventos, baladas liberais ou viagens de casais]
💬 [Dica prática de etiqueta, consentimento ou comunicação no meio]
✨ [Curiosidade ou tendência de comportamento entre casais]
💡 Pergunta do dia: [uma pergunta leve para gerar conversa no grupo]
🧠 Você Sabia? [um fato interessante sobre o universo liberal/não-monogâmico]

Mantenha cada linha curta, direta e com no máximo 1-2 linhas por tópico. Não adicione rodapé com link, apenas o corpo.`,
          },
        ],
      });

      const text = completion.choices?.[0]?.message?.content?.trim();
      if (text) return `${text}\n${footer}`;
    } catch (err) {
      warningLog(`DailyDigest: erro na OpenAI, usando fallback: ${err.message}`);
    }
  }

  const baseText = [
    "NA EDIÇÃO DE HOJE",
    "🔥 Comunicação clara continua sendo o maior diferencial dos casais mais respeitados no meio",
    "🥂 Fim de semana chegando: vale alinhar expectativas e limites antes de qualquer rolê",
    "💬 Regra de ouro: 'não' é resposta completa, sem precisar de justificativa",
    "✨ Cresce a busca por eventos intimistas e festas temáticas com foco em conexão",
    "💡 Pergunta do dia: O que não pode faltar para uma noite ser perfeita para o casal?",
    "🧠 Você Sabia? Combinar sinais discretos entre o casal evita qualquer saia justa em festas",
  ].join("\n");

  return `${baseText}\n${footer}`;
}

export async function resolveChannelCodeToJid(socket, code = "0029VbEHUMvFnSz2CnO59y3L") {
  try {
    if (socket && typeof socket.newsletterMetadata === "function") {
      const metadata = await socket.newsletterMetadata("invite", code);
      if (metadata && metadata.id) {
        infoLog(`DailyDigest: Canal Club Casalzaum resolvido com sucesso -> ${metadata.id}`);
        return metadata.id;
      }
    }
  } catch (err) {
    warningLog(`DailyDigest: Não foi possível resolver o código do canal (${code}): ${err.message}`);
  }
  return null;
}

function waitForMessageAck(socket, msgId, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      socket.ws?.off?.("CB:ack", onAck);
      resolve({ ok: true, timeout: true });
    }, timeoutMs);

    const onAck = (node) => {
      if (node?.attrs?.id !== msgId) return;
      clearTimeout(timer);
      socket.ws?.off?.("CB:ack", onAck);
      if (node.attrs.error) {
        resolve({ ok: false, error: node.attrs.error, node });
      } else {
        resolve({ ok: true, serverId: node.attrs.server_id, node });
      }
    };

    socket.ws?.on?.("CB:ack", onAck);
  });
}

export async function sendDigestToTarget(socket, jid, digestData) {
  const isNewsletter = jid.endsWith("@newsletter");
  const hasImage = Boolean(digestData.imageUrl && digestData.imageUrl.startsWith("http"));

  if (isNewsletter && hasImage) {
    let tempFilePath = null;
    try {
      const { filePath, fileSha256, fileLength } = await getRawMediaUploadData(
        { url: digestData.imageUrl },
        "image",
      );
      tempFilePath = filePath;

      const token = fileSha256
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const uploadInfo = await socket.refreshMediaConn(false);
      let uploadRes = null;
      for (const { hostname } of uploadInfo.hosts || []) {
        const auth = encodeURIComponent(uploadInfo.auth);
        const uploadUrl = `https://${hostname}/newsletter/newsletter-image/${token}?auth=${auth}&token=${token}`;
        try {
          const res = await uploadWithNodeHttp({
            url: uploadUrl,
            filePath,
            headers: { "Content-Type": "application/octet-stream", Origin: DEFAULT_ORIGIN },
            timeoutMs: 30_000,
          });
          if (res && (res.url || res.direct_path)) {
            uploadRes = res;
            break;
          }
        } catch {
          // try next CDN host
        }
      }

      if (uploadRes) {
        const msg = WAProto.Message.fromObject({
          imageMessage: WAProto.Message.ImageMessage.fromObject({
            url: uploadRes.url,
            directPath: uploadRes.direct_path,
            mimetype: "image/jpeg",
            caption: digestData.caption,
            fileSha256,
            fileLength,
          }),
        });
        const bytes = encodeNewsletterMessage(msg);
        const msgId = generateMessageIDV2(socket.user?.id);
        const ackPromise = waitForMessageAck(socket, msgId);

        await socket.sendNode({
          tag: "message",
          attrs: {
            to: jid,
            id: msgId,
            type: "media",
            ...(uploadRes.handle ? { media_id: uploadRes.handle } : {}),
          },
          content: [{ tag: "plaintext", attrs: { mediatype: "image" }, content: bytes }],
        });

        const ack = await ackPromise;
        if (ack.ok) {
          return { ok: true, withImage: true, serverId: ack.serverId, msgId };
        }
        warningLog(`DailyDigest: newsletter image ACK error=${ack.error}, tentando fallback texto`);
      }
    } catch (imgErr) {
      warningLog(`DailyDigest: falha ao enviar imagem para canal (${imgErr.message}), usando texto`);
    } finally {
      if (tempFilePath) {
        await fsp.unlink(tempFilePath).catch(() => {});
      }
    }

    const res = await socket.sendMessage(jid, { text: digestData.caption });
    return { ok: true, withImage: false, msgId: res?.key?.id };
  }

  if (hasImage) {
    try {
      const res = await socket.sendMessage(jid, {
        image: { url: digestData.imageUrl },
        caption: digestData.caption,
      });
      return { ok: true, withImage: true, msgId: res?.key?.id };
    } catch (imgErr) {
      warningLog(`DailyDigest: falha ao enviar imagem para grupo (${imgErr.message}), usando texto`);
    }
  }

  const res = await socket.sendMessage(jid, { text: digestData.caption });
  return { ok: true, withImage: false, msgId: res?.key?.id };
}

let digestIntervalStarted = false;

export function startDailyNewsDigest(socket) {
  if (digestIntervalStarted) return;
  digestIntervalStarted = true;

  const rawTargets =
    process.env.DAILY_DIGEST_JIDS || process.env.CLUB_CASALZAUM_GROUP_JID || "";
  let targetJids = rawTargets
    .split(",")
    .map((j) => j.trim())
    .filter(Boolean);
  const targetTime = process.env.DAILY_DIGEST_TIME || "08:00";

  // Auto-resolução do canal Club Casalzaum caso ainda não esteja na lista
  const defaultChannelCode = process.env.DAILY_DIGEST_CHANNEL_CODE || "0029VbEHUMvFnSz2CnO59y3L";
  if (defaultChannelCode && !targetJids.some((j) => j.endsWith("@newsletter"))) {
    resolveChannelCodeToJid(socket, defaultChannelCode).then((resolvedJid) => {
      if (resolvedJid && !targetJids.includes(resolvedJid)) {
        targetJids.push(resolvedJid);
        infoLog(`DailyDigest: Canal adicionado à lista de disparos: ${resolvedJid}`);
      }
    });
  }

  if (targetJids.length === 0 && !defaultChannelCode) {
    infoLog(
      "DailyDigest: DAILY_DIGEST_JIDS / CLUB_CASALZAUM_GROUP_JID não definido no .env — envio automático em espera.",
    );
    return;
  }

  infoLog(
    `DailyDigest: agendado diariamente a partir das ${targetTime} (BRT) para ${targetJids.length} destino(s): ${targetJids.join(", ")}`,
  );

  const runDailyCheck = async () => {
    try {
      const nowTime = getCurrentTimeBR();
      if (nowTime < targetTime) return;

      const todayKey = getTodayKey();
      const state = loadState();
      if (state.lastSentDate === todayKey) return;

      const liveSocket = getActiveSocket() || socket;
      if (!liveSocket?.user) return;

      const digestData = await buildTopicStyleNewsletter(4);
      let anySent = false;

      for (const jid of targetJids) {
        try {
          const result = await sendDigestToTarget(liveSocket, jid, digestData);
          infoLog(`DailyDigest: boletim diário enviado para ${jid} (imagem=${result.withImage})`);
          anySent = true;
        } catch (sendErr) {
          errorLog(`DailyDigest: falha ao enviar para ${jid}: ${sendErr.message}`);
        }
      }

      if (anySent) {
        saveState({ lastSentDate: todayKey, sentAt: new Date().toISOString() });
      }
    } catch (err) {
      errorLog(`DailyDigest: falha ao enviar boletim: ${err.message}`);
    }
  };

  setTimeout(runDailyCheck, 8_000);
  setInterval(runDailyCheck, 30_000);
}
