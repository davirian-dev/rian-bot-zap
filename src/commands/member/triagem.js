import { PREFIX } from "../../config.js";

export default {
  name: "triagem",
  description: "Menu de triagem e acesso à Portaria do Club Casalzaum",
  commands: ["triagem", "entrar", "acesso", "cadastro", "portaria"],
  usage: `${PREFIX}triagem`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendSuccessReact }) => {
    await sendSuccessReact();

    const linkPortaria = "https://chat.whatsapp.com/CuqFrtYkz2B9KWlPhTcAcI";

    const mensagem = 
`👑 *CLUB CASALZAUM - PORTARIA & TRIAGEM OFICIAL* 🔞
_Comunidade Privada • Meio Liberal & Criadores_

Bem-vindo(a) ao processo de seleção do Club Casalzaum! Para mantermos um ambiente seguro, respeitoso e blindado contra fakes, escolha o seu perfil:

1️⃣ *CASAL LIBERAL (Isento de Taxa)*
Entrada 100% gratuita. Exige envio de foto simples com a data de hoje para verificação anti-fake.

2️⃣ *MULHER SOLTEIRA (Isento de Taxa)*
Entrada 100% gratuita com triagem anti-fake.

3️⃣ *CRIADORA DE CONTEÚDO (+18)*
Acesso gratuito para divulgação autorizada e parcerias.

4️⃣ *HOMEM SOLTEIRO (Vagas Limitadas)*
Acesso mediante taxa de adesão/mensalidade (Pix 71936181632) + triagem.
👉 Digite *${PREFIX}pix10* ou *${PREFIX}pix69*.

🚪 *LINK OFICIAL DA PORTARIA (GRUPO DE ESPERA):*
👉 ${linkPortaria}

📜 *REGRAS DO CLUBE*
👉 Digite *${PREFIX}regras* para ler as diretrizes de segurança.

---
_Entre na portaria acima e envie sua mensagem ou foto de verificação para a moderação aprovar!_`;

    await sendReply(mensagem);
  },
};
