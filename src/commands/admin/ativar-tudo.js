import { PREFIX } from "../../config.js";
import {
  activateAntiLinkGroup,
  activateExitGroup,
  activateWelcomeGroup,
  isActiveGroup,
} from "../../utils/database.js";
import { WarningError } from "../../errors/index.js";

export default {
  name: "ativar-tudo",
  description: "Ativa todas as melhores funções do grupo de uma só vez (Welcome, Exit, Anti-link)",
  commands: ["ativar-tudo", "setup-grupo", "blindar-grupo", "iniciar-grupo"],
  usage: `${PREFIX}ativar-tudo`,

  handle: async ({ remoteJid, isGroup, sendReply, sendSuccessReact }) => {
    if (!isGroup) {
      throw new WarningError("Esse comando só pode ser usado dentro de grupos!");
    }

    await sendSuccessReact();

    // Ativa todas as funções essenciais no banco de dados do grupo
    activateWelcomeGroup(remoteJid);
    activateExitGroup(remoteJid);
    activateAntiLinkGroup(remoteJid);

    const msg = 
`🚀 *SETUP COMPLETO ATIVADO COM SUCESSO!* 🛡️✨

O grupo agora está 100% configurado e protegido pelo *Takeshi Bot*:

✅ *Boas-Vindas Oficiais:* Ativado (/welcome 1)
✅ *Aviso de Saída:* Ativado (/exit 1)
✅ *Anti-Link Inteligente:* Ativado (/anti-link 1)
✅ *Sistema de Advertências (Warn):* Ativo

👑 *O grupo está pronto para receber os membros com segurança total!*`;

    await sendReply(msg);
  }
};
