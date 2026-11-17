/**
 * Comando: !salvar-contatos / !salvar-membros
 * Varre todos os grupos onde o bot está e salva a lista de contatos
 * no banco de dados e no Painel do Club Casalzaum.
 */

import { PREFIX } from "../../config.js";
import { sincronizarTodosGrupos, lerContatosGrupos } from "../../services/groupMembersSaver.js";

export default {
  name: "salvar-contatos",
  description: "Varre e salva todos os contatos e membros dos grupos no painel",
  commands: ["salvar-contatos", "salvar-membros", "sincronizar-grupos"],
  usage: `${PREFIX}salvar-contatos`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendText, sendSuccessReply, sendErrorReply, socket }) => {
    try {
      await sendText("⏳ *Iniciando varredura dos grupos...* Mapeando participantes e salvando contatos...");

      const resultado = await sincronizarTodosGrupos(socket);
      const todos = lerContatosGrupos();

      const resposta = 
        `✅ *VARREDURA & CAPTURA DE GRUPOS CONCLUÍDA!* 🎉\n\n` +
        `📊 *Resumo da Sincronização:*\n` +
        `• Grupos verificados: *${resultado.totalGrupos}*\n` +
        `• Novos membros adicionados: *${resultado.novos}*\n` +
        `• Total geral de contatos mapeados: *${todos.length}*\n\n` +
        `💾 Todos os números foram salvos no banco de dados e sincronizados com o Painel Web do Club Casalzaum!`;

      await sendSuccessReply(resposta);
    } catch (err) {
      await sendErrorReply(`❌ Erro ao salvar contatos dos grupos: ${err.message}`);
    }
  },
};
