import { PREFIX } from "../../config.js";

export default {
  name: "regras",
  description: "Regulamento oficial do Club Casalzaum",
  commands: ["regras", "regulamento", "normas"],
  usage: `${PREFIX}regras`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("📜");

    const mensagem = 
`📜 *REGULAMENTO OFICIAL - CLUB CASALZAUM* 🔞
_Grupo Privado • Relacionamentos, Encontros e Meio Liberal_

🚫 *1. A REGRA DE OURO: O PRIVADO (PV)*
É ESTRITAMENTE PROIBIDO invadir o privado (PV) de qualquer membro sem ter recebido autorização explícita lá no grupo principal.
👉 *Consequência:* Banimento imediato (na hora), sem segunda chance e sem estorno da taxa.

🔒 *2. SEGURANÇA E TRIAGEM (ANTI-FAKE)*
Ninguém entra sem foto com data e placa. A moderação atua para garantir que 100% dos perfis sejam pessoas reais.

🤝 *3. CONSENTIMENTO E RESPEITO*
O "Não" é absoluto. Assédio, insistência, grosseria ou envio de fotos íntimas não solicitadas geram expulsão sumária.

🤫 *4. SIGILO E PRIVACIDADE ABSOLUTA*
O que acontece no clube, fica no clube. Proibido tirar prints, gravar telas ou expor a identidade e fotos de qualquer participante.

---
_A permanência no clube confirma que você leu, compreendeu e aceitou todas as regras._`;

    await sendReply(mensagem);
  },
};
