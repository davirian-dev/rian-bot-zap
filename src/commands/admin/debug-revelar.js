export default {
  name: "debug-revelar",
  description: "Inspeciona a mensagem respondida para debugar o comando revelar",
  commands: ["debug-revelar", "dr"],
  usage: "!debug-revelar (respondendo à mídia)",
  handle: async ({ webMessage, sendReply }) => {
    const quoted = webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const info = {
      temContextInfo: !!webMessage.message?.extendedTextMessage?.contextInfo,
      temQuotedMessage: !!quoted,
      quotedKeys: quoted ? Object.keys(quoted) : [],
      quotedSummary: quoted ? JSON.stringify(quoted).slice(0, 400) : "Nenhuma mensagem respondida encontrada!"
    };
    await sendReply(`🔍 *DEBUG REVELAR:*\n\`\`\`json\n${JSON.stringify(info, null, 2)}\n\`\`\``);
  }
};
