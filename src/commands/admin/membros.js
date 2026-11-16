/**
 * Comando: !membros
 * Gestão de Vencimentos e Cobrança de Solteiros (Club Casalzaum)
 * 
 * Permite cadastrar membros, listar vencimentos (6 meses ou 1 ano),
 * e disparar mensagens de cobrança com os links do Mercado Pago.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PREFIX } from "../../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, "../../../database/membros-club.json");

const LINKS_MERCADOPAGO = {
  "6m": "https://mpago.la/1oCKtkw",
  "1ano": "https://mpago.la/14fvgxf"
};

function lerMembros() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, "[]", "utf-8");
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data || "[]");
  } catch (e) {
    return [];
  }
}

function salvarMembros(membros) {
  fs.writeFileSync(DB_PATH, JSON.stringify(membros, null, 2), "utf-8");
}

function calcularDiasRestantes(dataVencimentoStr) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(dataVencimentoStr + "T00:00:00");
  const diffMs = venc - hoje;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function formatarData(isoStr) {
  if (!isoStr) return "--/--/----";
  const p = isoStr.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : isoStr;
}

export default {
  name: "membros",
  description: "Controle de vencimentos de passes e renovação do Club Casalzaum",
  commands: ["membros", "membro", "vencimentos"],
  usage: `${PREFIX}membros <listar | vencendo | add | cobrar | renovar | del>`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendErrorReply, sendSuccessReply, sendText, socket, remoteJid }) => {
    const subcomando = (args[0] || "listar").toLowerCase();
    const membros = lerMembros();

    // 1. Listar membros ativos e dias restantes
    if (subcomando === "listar") {
      if (membros.length === 0) {
        return await sendText("📋 *CLUB CASALZAUM - GESTÃO DE MEMBROS*\n\nNenhum membro cadastrado ainda. Use `!membros add` para cadastrar.");
      }

      let resposta = `👑 *CLUB CASALZAUM - CONTROLE DE VENCIMENTOS*\n\n`;
      membros.forEach((m, idx) => {
        const dias = calcularDiasRestantes(m.dataVencimento);
        let status = dias > 15 
          ? `🟢 Ativo (${dias} dias)` 
          : (dias >= 0 ? `🟡 *Vence em ${dias} dias!*` : `🔴 *Vencido há ${Math.abs(dias)} dias*`);

        resposta += `${idx + 1}. *${m.nome}* (+${m.fone})\n`;
        resposta += `   • Plano: ${m.planoNome}\n`;
        resposta += `   • Vencimento: ${formatarData(m.dataVencimento)}\n`;
        resposta += `   • Status: ${status}\n\n`;
      });

      resposta += `_Dica: Para cobrar quem está vencendo, use:_\n\`${PREFIX}membros cobrar <telefone>\``;
      return await sendText(resposta);
    }

    // 2. Listar apenas os que estão vencendo (< 15 dias) ou vencidos
    if (subcomando === "vencendo" || subcomando === "alertas") {
      const criticos = membros.filter(m => calcularDiasRestantes(m.dataVencimento) <= 15);

      if (criticos.length === 0) {
        return await sendSuccessReply("🎉 Nenhum membro vencendo nos próximos 15 dias! Todos com acesso em dia.");
      }

      let resposta = `⚠️ *MEMBROS VENCENDO EM BREVE OU EXPIRADOS:*\n\n`;
      criticos.forEach(m => {
        const dias = calcularDiasRestantes(m.dataVencimento);
        const aviso = dias >= 0 ? `Faltam ${dias} dias` : `Expirou há ${Math.abs(dias)} dias`;
        resposta += `• *${m.nome}* (+${m.fone})\n  Plano: ${m.planoNome} | Vence: ${formatarData(m.dataVencimento)} (${aviso})\n  Cobrar: \`${PREFIX}membros cobrar ${m.fone}\`\n\n`;
      });

      return await sendText(resposta);
    }

    // 3. Cadastrar novo membro: !membros add <telefone> <plano: 6m|1ano> <Nome Sobrenome>
    if (subcomando === "add") {
      if (args.length < 4) {
        return await sendErrorReply(
          `Formato incorreto. Use:\n\`${PREFIX}membros add <telefone> <6m|1ano> <Nome Completo>\`\n\nExemplo:\n\`${PREFIX}membros add 5571999998888 6m Lucas Silva\``
        );
      }

      const fone = args[1].replace(/\D/g, "");
      const planoTipo = args[2].toLowerCase();
      const nome = args.slice(3).join(" ").trim();

      if (!["6m", "1ano"].includes(planoTipo)) {
        return await sendErrorReply("Plano inválido! Escolha `6m` (Passe Semestral) ou `1ano` (VIP Black).");
      }

      const hoje = new Date();
      const meses = planoTipo === "1ano" ? 12 : 6;
      const venc = new Date(hoje);
      venc.setMonth(venc.getMonth() + meses);

      const novo = {
        id: "m-" + Date.now(),
        nome: nome,
        fone: fone,
        plano: planoTipo,
        planoNome: planoTipo === "1ano" ? "Membro VIP Black (1 Ano)" : "Passe Semestral (6M)",
        dataInicio: hoje.toISOString().slice(0, 10),
        dataVencimento: venc.toISOString().slice(0, 10),
        valor: planoTipo === "1ano" ? "R$ 167,00" : "R$ 97,00"
      };

      membros.push(novo);
      salvarMembros(membros);

      return await sendSuccessReply(
        `✅ Membro *${nome}* cadastrado com sucesso!\n• Plano: ${novo.planoNome}\n• Vencimento: ${formatarData(novo.dataVencimento)}`
      );
    }

    // 4. Cobrar Renovação no WhatsApp: !membros cobrar <telefone>
    if (subcomando === "cobrar") {
      const foneAlvo = (args[1] || "").replace(/\D/g, "");
      if (!foneAlvo) {
        return await sendErrorReply(`Informe o telefone. Ex: \`${PREFIX}membros cobrar 5571999998888\``);
      }

      const m = membros.find(x => x.fone.includes(foneAlvo));
      if (!m) {
        return await sendErrorReply(`Membro com telefone final ${foneAlvo} não foi encontrado.`);
      }

      const dias = calcularDiasRestantes(m.dataVencimento);
      const link = LINKS_MERCADOPAGO[m.plano] || LINKS_MERCADOPAGO["6m"];

      let msg = "";
      if (dias >= 0) {
        msg = `Fala ${m.nome}! Tudo bem? 👑\n\n` +
              `Passando para avisar que o seu acesso ao *Club Casalzaum* (${m.planoNome}) está a *${dias} dia${dias === 1 ? "" : "s"} do vencimento* (vence em ${formatarData(m.dataVencimento)}).\n\n` +
              `Para continuar ativo na nossa Comunidade do WhatsApp (12 subgrupos), encontros VIP e Telegram sem perder seu histórico, você pode renovar agora com prioridade:\n\n` +
              `👉 *Link para Renovar via PIX ou Cartão:* ${link}\n\n` +
              `Assim que pagar, envie o comprovante aqui para mantermos sua vaga garantida! 🚀`;
      } else {
        msg = `Olá ${m.nome}! Tudo bem? 👑\n\n` +
              `Notamos que o seu passe de acesso ao *Club Casalzaum* expirou recentemente.\n\n` +
              `Para regularizar seu perfil e continuar nos nossos 12 subgrupos do WhatsApp e eventos VIP, basta renovar sua adesão no link oficial:\n\n` +
              `👉 *Link para Reativação:* ${link}\n\n` +
              `Aguardamos você para reativar seu acesso!`;
      }

      // Envia a mensagem no privado do membro
      const jidDestino = `${m.fone}@s.whatsapp.net`;
      try {
        await socket.sendMessage(jidDestino, { text: msg });
        return await sendSuccessReply(`📩 Mensagem de cobrança enviada no privado de *${m.nome}* (+${m.fone})!`);
      } catch (err) {
        return await sendErrorReply(`Não foi possível enviar diretamente. Envie manualmente para +${m.fone}:\n\n${msg}`);
      }
    }

    // 5. Renovar: !membros renovar <telefone> <6m|1ano>
    if (subcomando === "renovar") {
      const foneAlvo = (args[1] || "").replace(/\D/g, "");
      const planoTipo = (args[2] || "").toLowerCase();

      const m = membros.find(x => x.fone.includes(foneAlvo));
      if (!m) {
        return await sendErrorReply(`Membro não encontrado para o telefone informado.`);
      }

      const meses = (planoTipo === "1ano" || m.plano === "1ano") ? 12 : 6;
      const baseDate = new Date(m.dataVencimento + "T00:00:00");
      const hoje = new Date();
      const inicio = baseDate > hoje ? baseDate : hoje;
      inicio.setMonth(inicio.getMonth() + meses);

      m.dataVencimento = inicio.toISOString().slice(0, 10);
      if (planoTipo === "1ano" || planoTipo === "6m") {
        m.plano = planoTipo;
        m.planoNome = planoTipo === "1ano" ? "Membro VIP Black (1 Ano)" : "Passe Semestral (6M)";
      }
      salvarMembros(membros);

      return await sendSuccessReply(`🎉 *${m.nome}* renovado com sucesso até *${formatarData(m.dataVencimento)}*!`);
    }

    // 6. Deletar membro: !membros del <telefone>
    if (subcomando === "del" || subcomando === "remover") {
      const foneAlvo = (args[1] || "").replace(/\D/g, "");
      const index = membros.findIndex(x => x.fone.includes(foneAlvo));
      if (index === -1) {
        return await sendErrorReply(`Membro não encontrado.`);
      }

      const removido = membros.splice(index, 1)[0];
      salvarMembros(membros);
      return await sendSuccessReply(`Membro *${removido.nome}* removido do controle.`);
    }

    return await sendErrorReply(`Subcomando desconhecido. Use: \`${PREFIX}membros <listar | vencendo | add | cobrar | renovar | del>\``);
  }
};
