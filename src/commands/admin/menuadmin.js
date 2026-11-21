import path from "node:path";
import { ASSETS_DIR, PREFIX, BOT_NAME } from "../../config.js";
import { getPrefix } from "../../utils/database.js";
import { readMore } from "../../utils/index.js";

export function menuAdminMessage(groupJid) {
  const p = getPrefix(groupJid);

  return `╭━━⪩ 🛡️ PAINEL DOS ADMINISTRADORES ⪨━━${readMore()}
▢
▢ • ${BOT_NAME}
▢ • Gerenciamento Oficial de Moderação
▢ • Club Casalzaum
▢
╰━━─「👑」─━━

╭━━⪩ 🚪 GESTÃO & APROVAÇÃO ⪨━━
▢
▢ • ${p}revelar ➔ Revela fotos e vídeos de visualização única (1x)
▢ • ${p}configs ➔ Painel visual com status de todas as travas do grupo
▢ • ${p}aprovar ➔ Aprova e dá boas-vindas oficiais ao membro triado
▢ • ${p}enviar-portaria ➔ Envia as instruções de triagem no grupo
▢ • ${p}membros ➔ Relatório de membros e controle de vencimentos
▢ • ${p}salvar-contatos ➔ Sincroniza e exporta contatos da comunidade
▢ • ${p}link-grupo ➔ Envia o link de convite do grupo atual
▢
╰━━─「📋」─━━

╭━━⪩ 🛡️ SEGURANÇA & ANTIS (1/0) ⪨━━
▢
▢ • ${p}anti-link (1/0) ➔ Bloqueia links de outros grupos e sites
▢ • ${p}anti-call (1/0) ➔ Bloqueia ligações indesejadas no bot
▢ • ${p}anti-image (1/0) ➔ Bloqueia fotos não autorizadas
▢ • ${p}anti-video (1/0) ➔ Bloqueia vídeos pesados
▢ • ${p}anti-audio (1/0) ➔ Bloqueia áudios
▢ • ${p}anti-sticker (1/0) ➔ Bloqueia figurinhas flood
▢ • ${p}anti-document (1/0) ➔ Bloqueia arquivos e documentos
▢ • ${p}anti-payment (1/0) ➔ Bloqueia pedidos de Pix e golpes
▢ • ${p}anti-status-grupo (1/0) ➔ Bloqueia avisos de status
▢ • ${p}ativar-tudo ➔ Ativa todos os escudos de segurança de uma vez
▢
╰━━─「🔒」─━━

╭━━⪩ ⚙️ CONTROLE DO GRUPO ⪨━━
▢
▢ • ${p}fechar / ${p}abrir ➔ Fecha ou abre o grupo para apenas admins
▢ • ${p}ban [@membro] ➔ Remove o membro infrator do grupo
▢ • ${p}warn / ${p}unwarn ➔ Aplica ou remove advertência do membro
▢ • ${p}mute / ${p}unmute ➔ Silencia ou desmuta membro no bot
▢ • ${p}promover / ${p}rebaixar ➔ Altera cargo de administrador
▢ • ${p}limpar-chat ➔ Limpa mensagens recentes do chat
▢ • ${p}hidetag [texto] ➔ Marca todos os membros do grupo de forma limpa
▢ • ${p}welcome (1/0) ➔ Liga/Desliga a mensagem de boas-vindas oficial
▢ • ${p}only-admin (1/0) ➔ Restringe uso de comandos apenas a admins
▢
╰━━─「⚡」─━━

╭━━⪩ 🤖 AUTOMAÇÕES ⪨━━
▢
▢ • ${p}auto-responder (1/0) ➔ Ativa/desativa respostas automáticas
▢ • ${p}add-auto-responder ➔ Adiciona gatilho e resposta customizada
▢ • ${p}list-auto-responder ➔ Lista todas as automações salvas
▢ • ${p}delete-auto-responder ➔ Remove uma resposta automática
▢ • ${p}agendar-mensagem ➔ Programa recados e avisos para data/hora
▢
╰━━─「🤖」─━━`;
}

export default {
  name: "menuadmin",
  description: "Aba exclusiva de ferramentas administrativas e moderação",
  commands: ["menuadmin", "adminmenu", "ajudaadmin", "paineladmin"],
  usage: `${PREFIX}menuadmin`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ remoteJid, sendSuccessReact, sendImageFromFile }) => {
    await sendSuccessReact();
    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
      `\n\n${menuAdminMessage(remoteJid)}`
    );
  }
};
