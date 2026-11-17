import { PREFIX } from "../../config.js";
import { GROUP_PROFILES } from "../../templates/groupProfiles.js";
import { WarningError, InvalidParameterError } from "../../errors/index.js";
import {
  activateAntiLinkGroup,
  activateExitGroup,
  activateWelcomeGroup
} from "../../utils/database.js";

export default {
  name: "aplicar-tema",
  description: "Configura de uma vez só: Bio, Boas-vindas, Regras e Proteções do grupo escolhido",
  commands: ["aplicar-tema", "set-tema", "configurar-grupo", "tema"],
  usage: `${PREFIX}aplicar-tema (portaria | geral | casais | mulheres)`,

  handle: async ({ args, remoteJid, socket, isGroup, sendReply, sendSuccessReact, sendWaitReply }) => {
    if (!isGroup) {
      throw new WarningError("Esse comando só pode ser usado dentro de grupos!");
    }

    const tema = (args[0] || "").toLowerCase();
    const perfil = GROUP_PROFILES[tema];

    if (!perfil) {
      const opcoes = Object.keys(GROUP_PROFILES).join(", ");
      throw new InvalidParameterError(
        `Você precisa escolher um tema válido!\n\n👉 *Temas disponíveis:* \`${opcoes}\`\n\n*Exemplo:* \`${PREFIX}aplicar-tema portaria\``
      );
    }

    await sendWaitReply(`Aplicando o tema *${perfil.name}* neste grupo...`);

    try {
      // 1. Atualiza a Bio / Descrição oficial do grupo
      await socket.groupUpdateDescription(remoteJid, perfil.desc);
    } catch (_) {}

    // 2. Ativa as proteções automáticas (anti-link, welcome, exit)
    activateWelcomeGroup(remoteJid);
    activateExitGroup(remoteJid);
    activateAntiLinkGroup(remoteJid);

    await sendSuccessReact();

    const msg = 
`✨ *GRUPO CONFIGURADO DE UMA VEZ SÓ!* 🛡️

O tema *${perfil.name}* foi aplicado com sucesso:

📝 *Bio / Descrição do Grupo:* Atualizada
🛡️ *Anti-Link & Boas-Vindas:* Ativados
📌 *Mensagem Recomendada para Fixar no Topo:*

${perfil.pinned}`;

    await sendReply(msg);
  }
};
