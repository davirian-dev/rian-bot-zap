import { PREFIX } from "../../config.js";

export default {
  name: "grupos",
  description: "Lista dos 12 subgrupos temáticos da comunidade Club Casalzaum",
  commands: ["grupos", "grupo", "subgrupos", "comunidade"],
  usage: `${PREFIX}grupos`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🔥");

    const mensagem = 
`👑 *ECOSSISTEMA DE 12 SUBGRUPOS • CLUB CASALZAUM* 🔞

Nossa comunidade é setorizada para garantir foco, conforto e privacidade para cada momento:

🔑 *1. Portaria & Triagem:* Onde todos iniciam e passam pelo crivo anti-fake.
👑 *2. Casadas e Solteiras:* Espaço 100% exclusivo para mulheres sem interferência masculina.
🔥 *3. Casais & Solteiras:* Conversas diretas, afinidades e conexões reais.
🍷 *4. 40+ Liberal:* Para casais e pessoas maduras que prezam por conversas de alto nível.
🥂 *5. Geral:* A resenha principal do clube, debates leves e apresentações.
📍 *6. Salvador & Região:* Encontros e rolês focados na Bahia.
🥳 *7. Festas & Eventos:* Camarotes, baladas liberais e viagens em grupo.
💬 *8. Contos Eróticos:* Espaço para compartilhar fantasias e experiências reais.
💲 *9. Criadores & Network:* Divulgação autorizada de Privacy, OnlyFans e Close Friends.
🏷️ *10. Promoções & Ofertas:* Cupons de descontos em motéis, pousadas e sex shops parceiros.
🚗 *11. Carona & Encontros VIP:* Logística de caronas para eventos com pessoas verificadas.
🎓 *12. Iniciantes & 1ª Vez:* Acolhimento e orientação para quem nunca viveu o meio liberal.

---
⚠️ *COMO ACESSAR OS SUBGRUPOS:*
Para receber o link de entrada nos subgrupos, você deve ter a triagem aprovada!
👉 Digite *${PREFIX}triagem* para iniciar sua verificação.`;

    await sendReply(mensagem);
  },
};
