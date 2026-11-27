import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";

export default {
  name: "list-newsletters",
  description: "Lista os canais/newsletters em que o bot é dono ou inscrito com seus respectivos IDs JID.",
  commands: ["list-newsletters", "canais", "list-canais", "canal-id"],
  usage: `${PREFIX}list-newsletters`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket, sendSuccessReply, sendWaitReply }) => {
    try {
      if (!socket.newsletterSubscribedList) {
        throw new WarningError("Esta versão do Baileys não suporta listar canais diretamente por função nativa.");
      }

      await sendWaitReply("Buscando lista de canais...");
      const newsletters = await socket.newsletterSubscribedList();

      if (!newsletters || newsletters.length === 0) {
        await sendSuccessReply("Nenhum canal encontrado onde o bot esteja inscrito ou seja admin.");
        return;
      }

      const lista = newsletters
        .map((n) => `📌 *${n.name || "Sem nome"}*\n🆔 \`${n.id}\`\nPapel: ${n.viewer_metadata?.role || "Inscrito"}`)
        .join("\n\n");

      await sendSuccessReply(`📢 *Canais Encontrados:*\n\n${lista}\n\nCopie o ID (\`...@newsletter\`) e adicione no seu .env em \`DAILY_DIGEST_JIDS\`.`);
    } catch (err) {
      throw new WarningError(`Não foi possível listar os canais: ${err.message}`);
    }
  },
};
