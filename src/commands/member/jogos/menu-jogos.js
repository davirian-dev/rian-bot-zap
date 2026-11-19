import path from "node:path";
import { ASSETS_DIR, PREFIX, BOT_NAME } from "../../../config.js";
import { getPrefix } from "../../../utils/database.js";
import { readMore } from "../../../utils/index.js";

export function menuJogosMessage(groupJid) {
  const p = getPrefix(groupJid);

  return `╭━━⪩ 🎮 JOGOS & DIVERSÃO ⪨━━${readMore()}
▢
▢ • ${BOT_NAME}
▢ • Plataforma Oficial de Entretenimento
▢ • Club Casalzaum
▢
╰━━─「🎲」─━━

╭━━⪩ 🔞 JOGOS +18 & MEIO LIBERAL ⪨━━
▢
▢ • ${p}garrafahot ➔ Gira a Garrafa Hot e sorteia ações quentes entre 2 membros
▢ • ${p}faria ➔ Faria ou Não Faria? Dilemas e fetiches para o grupo votar
▢ • ${p}dadoerotico ➔ Rola 2 dados combinando uma ação e uma parte do corpo
▢ • ${p}roleta-fetiches ➔ Radar de fetiches (Swing, Ménage, Tantra, Hotwife)
▢ • ${p}voceprefere ➔ O Que Você Prefere? Dilemas difíceis e escolhas picantes
▢ • ${p}drink ➔ Carta de receitas de drinks e coquetéis afrodisíacos
▢ • ${p}verdadeoudesafio ➔ Verdades picantes ou desafios para esquentar a noite
▢ • ${p}desafiohot [@membro] ➔ Desafio liberal ousado para cumprir no grupo
▢ • ${p}roleta ➔ Roleta do Casalzaum com prendas provocativas
▢ • ${p}shippar [@user1 @user2] ➔ Mede a química e compatibilidade de casal
▢ • ${p}cantada [@alguém] ➔ Cantadas infalíveis, engraçadas ou sedutoras
▢ • ${p}topfiel [@alguém] ➔ Termômetro da fidelidade e veredito do golpe
▢
╰━━─「😈」─━━

╭━━⪩ 🕹️ JOGOS EM GRUPO ⪨━━
▢
▢ • ${p}forca [letra/palavra] ➔ Jogo da Forca com boneco ASCII em tempo real!
▢ • ${p}qualmusica [nome da música] ➔ Qual é a Música com Emojis! 🎧✨
▢ • ${p}velha [1-9] ➔ Jogo da Velha contra o bot ou desafie alguém (@membro)
▢ • ${p}bola8 [pergunta] ➔ Oráculo da Bola 8 Mágica responde tudo
▢ • ${p}sortudo ➔ Sorteia um membro aleatório do grupo para destaque/prêmio
▢ • ${p}adivinhe [número] ➔ Adivinhe o número secreto de 1 a 100 com dicas
▢ • ${p}quiz [A, B, C ou D] ➔ Perguntas e curiosidades de conhecimentos gerais
▢ • ${p}ppt [pedra/papel/tesoura] ➔ Disputa de Jokenpô contra o bot
▢ • ${p}eununca ➔ Perguntas clássicas do Eu Nunca para interação
▢
╰━━─「🎯」─━━

╭━━⪩ 🎰 CASSINO & APOSTAS ⪨━━
▢
▢ • ${p}cassino [fichas] ➔ Caça-níqueis (7️⃣, 💎, cerejas) com multiplicadores
▢ • ${p}roleta-cassino [cor] [fichas] ➔ Roleta clássica (Vermelho, Preto ou Verde 14x!)
▢ • ${p}raspadinha ➔ Raspe a cartela digital da sorte e ganhe bônus
▢ • ${p}dado [1-6] ➔ Jogue o dado da sorte e teste seu palpite
▢
╰━━─「🎲」─━━

╭━━⪩ 🔥 DINÂMICAS & FLERTE ⪨━━
▢
▢ • ${p}cantada [@alguém] ➔ Manda uma cantada inteligente, engraçada ou sedutora
▢ • ${p}topfiel [@alguém] ➔ Termômetro da fidelidade e veredito do golpe
▢ • ${p}signo [seu signo] ➔ Horóscopo do dia, sorte e conselho astral
▢ • ${p}piada ➔ Conta uma piada para animar o grupo
▢ • ${p}shippar [@user1 @user2] ➔ Calcula a compatibilidade amorosa do casal
▢ • ${p}verdadeoudesafio ➔ Clássico Verdade ou Desafio
▢ • ${p}desafiohot [@membro] ➔ Desafio liberal ousado para cumprir no grupo
▢ • ${p}roleta ➔ Gira a roleta picante do meio liberal
▢ • ${p}abracar / ${p}beijar / ${p}tapa ➔ Ações de interação direta
▢
╰━━─「🌶️」─━━

💡 *Dica:* Todos os jogos são 100% gratuitos e funcionam tanto aqui no grupo quanto no privado! Divirtam-se! 🥂✨`;
}

export default {
  name: "jogos",
  description: "Aba exclusiva com todos os jogos, apostas e brincadeiras do bot",
  commands: ["jogos", "games", "brincadeiras", "diversao"],
  usage: `${PREFIX}jogos`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ remoteJid, sendSuccessReact, sendImageFromFile }) => {
    await sendSuccessReact();
    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
      `\n\n${menuJogosMessage(remoteJid)}`
    );
  }
};
