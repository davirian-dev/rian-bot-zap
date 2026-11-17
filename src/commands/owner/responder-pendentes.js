import { PREFIX } from "../../config.js";
import { processPendingConversations, responderContatosZapZap } from "../../services/pendingResponder.js";

export default {
  name: "responder-pendentes",
  description: "Faz a varredura no WhatsApp e responde com a IA quem estiver sem resposta (pulando fotos, áudios e comprovantes)",
  commands: ["responder-pendentes", "responder", "pendentes", "varrer"],
  usage: `${PREFIX}responder`,

  handle: async ({ socket, sendReply, sendReact }) => {
    await sendReact("⏳");
    await sendReply("🔍 *Iniciando varredura e resposta das conversas pendentes...*\n\n_A IA analisará o contexto de cada cliente e responderá apenas texto/triagem, preservando fotos e comprovantes para você!_");

    try {
      // 1. Processa a lista das conversas que estavam pendentes na tela
      const totalEnviados = await responderContatosZapZap(socket);

      // 2. Dispara a rotina geral caso haja novas do Baileys
      await processPendingConversations(socket, [], []);

      await sendReact("✅");
      await sendReply(`✅ *Varredura concluída!*\n\nForam respondidos *${totalEnviados} cliente(s)* pendentes com sucesso com a nova inteligência humanizada!`);
    } catch (err) {
      await sendReact("❌");
      await sendReply(`⚠️ Erro ao processar pendências: ${err.message}`);
    }
  },
};
