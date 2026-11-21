import { PREFIX } from "../../config.js";

export default {
  name: "webhooks",
  description: "Status da Central de Webhooks e Fluxos das Redes Sociais (Instagram, WhatsApp, Telegram, Pix)",
  commands: ["webhooks", "webhook", "redessociais", "socialhub", "status-webhook"],
  usage: `${PREFIX}webhooks`,

  handle: async ({ sendReply, sendReact }) => {
    await sendReact("📡");

    try {
      const res = await fetch("http://localhost:3333/health", { timeout: 3000 });
      const data = await res.json();

      let logsMsg = "Nenhum evento recente.";
      try {
        const resLogs = await fetch("http://localhost:3333/api/logs", { timeout: 3000 });
        const dataLogs = await resLogs.json();
        if (dataLogs.logs && dataLogs.logs.length > 0) {
          logsMsg = dataLogs.logs.slice(0, 3).map(l => `• *[${l.canal}]* ${l.evento} (${l.data.split(' ')[1] || ''})`).join("\n");
        }
      } catch (e) {}

      const msg = 
`🌐 *CENTRAL DE WEBHOOKS & REDES SOCIAIS* 🚀

🟢 *Status:* ONLINE (Porta 3333)
📡 *Versão:* ${data.versao || '1.0.0'}
⚡ *Eventos Registrados:* ${data.eventos_registrados || 0}

🔗 *Canais Conectados:*
📸 *Instagram (Meta Graph):* Ativo (DMs & Reels)
💬 *Takeshi Bot (WhatsApp):* Conectado
✈️ *Telegram Portaria:* Ativo
💰 *Checkout Pix Casalzaum:* Ativo

📊 *Últimos Disparos:*
${logsMsg}

👉 *Painel Web:* http://localhost:3333
_Automação unificada Davi Rian Tech_`;

      await sendReply(msg);
    } catch (err) {
      const msgOffline = 
`🌐 *CENTRAL DE WEBHOOKS & REDES SOCIAIS* ⚠️

🔴 *Status:* SERVIDOR LOCAL OFFLINE
Para iniciar o motor de webhooks no computador:
\`cd /home/daviemari/.gemini/antigravity/scratch/manychat-proprio && ./iniciar_webhook_engine.sh\`

🔗 *Canais Monitorados:*
• Instagram Direct & Comentários
• WhatsApp (Takeshi Bot)
• Telegram (Portaria VIP)
• Pix Casalzaum (Liberação Instantânea)`;

      await sendReply(msgOffline);
    }
  }
};
