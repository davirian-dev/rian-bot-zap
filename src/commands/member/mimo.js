import { PREFIX } from "../../config.js";

export default {
  name: "mimo",
  description: "Mandar um Mimo ou Pix Anônimo para Davi & Mari com 100% de Sigilo",
  commands: ["mimo", "mimos", "pixanonimo", "livepix", "doar", "doacao", "apoiar", "presente"],
  usage: `${PREFIX}mimo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🎁");

    const mensagem = 
`🎁 *PIX ANÔNIMO & MIMOS • DAVI & MARI* 🥂🔞

Quer apoiar o casal, mandar um drink, pagar um mimo pra Mari ou fortalecer o projeto com *100% de anonimato e sigilo absoluto*?

Pelo nosso canal oficial do **LivePix**, ninguém vê seu nome, seu CPF ou seus dados bancários!

✨ *VANTAGENS DO LIVEPIX:*
🛡️ *Anonimato Total:* Seus dados bancários e CPF não aparecem para ninguém.
💬 *Mensagem Personalizada:* Você pode deixar um recado secreto ou carinhoso junto com o Pix.
⚡ *Instantâneo:* Qualquer valor a partir de R$ 1,00 via QR Code ou Copia e Cola.

🔗 *Acesse agora para mandar seu mimo:*
👉 https://livepix.gg/casalzaumofc

_Agradecemos de coração pelo carinho e apoio de quem fortalece a nossa caminhada!_ ❤️‍🔥`;

    await sendReply(mensagem);
  },
};
