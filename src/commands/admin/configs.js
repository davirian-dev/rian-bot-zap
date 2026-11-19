import { PREFIX } from "../../config.js";
import {
  isActiveAntiLinkGroup,
  isActiveAutoResponderGroup,
  isActiveWelcomeGroup
} from "../../utils/database.js";

export default {
  name: "configs",
  description: "Exibe o painel visual com o status (✅ Ativo / ❌ Desativado) de todas as proteções do grupo",
  commands: ["configs", "config", "status-seguranca", "painel-seguranca"],
  usage: `${PREFIX}configs`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ remoteJid, sendReply, sendSuccessReact, isGroup }) => {
    if (!isGroup) {
      return sendReply(`⚠️ O comando *${PREFIX}configs* deve ser executado dentro de um grupo para ver as proteções ativas dele!`);
    }

    await sendSuccessReact();

    const antiLink = isActiveAntiLinkGroup(remoteJid);
    const autoResp = isActiveAutoResponderGroup(remoteJid);
    const welcome = isActiveWelcomeGroup(remoteJid);

    const f = (status) => (status ? "✅ Ativado" : "❌ Desativado");

    return sendReply(
      `╭━━⪩ 🛡️ STATUS DE SEGURANÇA ⪨━━\n` +
      `▢\n` +
      `▢ • ${antiLink ? "✅" : "❌"} *Anti-Link:* ${f(antiLink)}\n` +
      `▢ • ✅ *Anti-Golpe / Pix (171):* ✅ Ativado (Blindagem Ativa)\n` +
      `▢ • ✅ *Anti-Chamadas:* ✅ Ativado (Bloqueio Automático)\n` +
      `▢ • ${welcome ? "✅" : "❌"} *Boas-Vindas Oficial:* ${f(welcome)}\n` +
      `▢ • ${autoResp ? "✅" : "❌"} *Auto-Responder:* ${f(autoResp)}\n` +
      `▢ • 🔒 *Anti-Flood / Spam:* ✅ Ativado\n` +
      `▢\n` +
      `╰━━─「🔒」─━━\n\n` +
      `💡 *Como alterar:*\n` +
      `Digite *${PREFIX}anti-link 1* para ativar ou *0* para desativar.\n` +
      `Digite *${PREFIX}welcome 1* para ligar as boas-vindas oficiais.`
    );
  },
};
