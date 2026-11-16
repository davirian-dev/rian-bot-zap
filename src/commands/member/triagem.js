import { PREFIX } from "../../config.js";

export default {
  name: "triagem",
  description: "Menu de triagem e acesso ao Club Casalzaum",
  commands: ["triagem", "entrar", "acesso", "cadastro"],
  usage: `${PREFIX}triagem`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendSuccessReact }) => {
    await sendSuccessReact();

    const mensagem = 
`👑 *CLUB CASALZAUM - TRIAGEM OFICIAL* 🔞
_Comunidade Privada • Meio Liberal & Criadores_

Bem-vindo(a) ao processo de seleção do Club Casalzaum! Para mantermos um ambiente seguro, respeitoso e blindado contra fakes, escolha o seu perfil:

1️⃣ *CASAL LIBERAL (Isento de Taxa)*
Entrada 100% gratuita. Exige envio de foto simples com a data de hoje para verificação anti-fake.

2️⃣ *MULHER SOLTEIRA (Isento de Taxa)*
Entrada 100% gratuita com triagem anti-fake.

3️⃣ *CRIADORA DE CONTEÚDO (+18)*
Acesso gratuito para divulgação autorizada e parcerias.

4️⃣ *HOMEM SOLTEIRO (Vagas Limitadas)*
Acesso mediante taxa de adesão/mensalidade + triagem com foto.
👉 Digite *${PREFIX}planos* para ver os valores e a chave PIX.

📜 *REGRAS DO CLUBE*
👉 Digite *${PREFIX}regras* para ler a Regra de Ouro (Proibido invasão de PV).

---
_Envie sua resposta ou sua foto de verificação com a data de hoje aqui no chat para a moderação aprovar!_`;

    await sendReply(mensagem);
  },
};
