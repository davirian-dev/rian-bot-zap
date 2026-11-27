import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";

export default {
  name: "resolver-canal",
  description: "Resolve o JID interno (@newsletter) de um canal a partir do link de convite ou código.",
  commands: ["resolver-canal", "canal-link", "newsletter-id"],
  usage: `${PREFIX}resolver-canal <link ou codigo>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket, sendSuccessReply, sendWaitReply, args }) => {
    let input = (args[0] || "").trim();
    if (!input) {
      input = "0029VbEHUMvFnSz2CnO59y3L";
    }

    const codeMatch = input.match(/(?:channel\/)?([0-9A-Za-z]{20,28})/);
    const code = codeMatch ? codeMatch[1] : input;

    try {
      await sendWaitReply(`Buscando dados do canal pelo código \`${code}\`...`);
      
      let metadata;
      if (socket.newsletterMetadata) {
        metadata = await socket.newsletterMetadata("invite", code);
      } else {
        throw new WarningError("Função newsletterMetadata não suportada diretamente.");
      }

      if (!metadata || !metadata.id) {
        throw new WarningError("Canal não encontrado ou link inválido.");
      }

      await sendSuccessReply(
        `✅ *Canal Identificado!*\n\n` +
        `📌 *Nome:* ${metadata.name || "Club Casalzaum"}\n` +
        `🆔 *JID Oficial:* \`${metadata.id}\`\n\n` +
        `O JID foi detectado! Agora basta manter no .env.`
      );
    } catch (err) {
      throw new WarningError(`Erro ao resolver canal: ${err.message}`);
    }
  },
};
