import { PREFIX } from "../../config.js";
import { gemini } from "../../services/spider-x-api.js";

export default {
  name: "legenda",
  description: "Gerador de legendas e ideias de posts para criadoras e casais liberais",
  commands: ["legenda", "legendas", "caption", "bio", "post"],
  usage: `${PREFIX}legenda [tema da foto ou vídeo]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendWaitReply, sendReact, fullArgs }) => {
    await sendReact("✍️");

    if (fullArgs && fullArgs.trim().length > 0) {
      await sendWaitReply();

      try {
        const prompt = `Você é um especialista em marketing de conteúdo sensual, discreto e envolvente para casais liberais e criadoras (+18 no Instagram, Privacy, OnlyFans e Telegram VIP). Crie 3 opções de legendas para o seguinte tema: "${fullArgs}". Uma opção deve ser misteriosa/poética, uma provocante/direta e uma com chamada para ação (CTA) para o canal VIP. Mantenha elegância, sem termos vulgares proibidos pelo algoritmo do Instagram.`;
        
        const resposta = await gemini(prompt);
        await sendReply(`✨ *SUGESTÕES DE LEGENDAS VIP:*\n\n${resposta}\n\n👑 _Club Casalzaum Creators_`);
        return;
      } catch (err) {
        // Fallback caso a API externa oscile
      }
    }

    const mensagem = 
`✍️ *GERADOR DE LEGENDAS & ENGAGEMENT • CLUB CASALZAUM* 🔞

Crie legendas que atraem curiosidade e assinantes sem risco de banimento no Instagram:

🔥 *Exemplo 1 (Misteriosa):*
_"O que acontece a dois é bom, mas o que compartilhamos no nosso universo secreto é inesquecível... ✨ Link na bio para os íntimos."_

🥂 *Exemplo 2 (Casal Liberal):*
_"Nossa cumplicidade não tem limites quando a sintonia é perfeita. Quem aí também ama viver momentos intensos a dois? 🍷"_

🔞 *Exemplo 3 (Chamada VIP / Privacy):*
_"O que o feed não mostra, o nosso canal exclusivo revela sem filtros. Vem conferir a prévia de hoje... 🤫 Link no perfil."_

---
💡 *Dica:* Para gerar legendas personalizadas para sua foto, digite:
*${PREFIX}legenda [descreva sua foto]*
_Exemplo: ${PREFIX}legenda foto de lingerie vermelha na hidro do motel_`;

    await sendReply(mensagem);
  },
};
