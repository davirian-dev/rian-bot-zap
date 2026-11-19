import { PREFIX } from "../../../config.js";

// Estado dos jogos de forca por chat/grupo: Map<remoteJid, GameState>
const games = new Map();

const BANCO_PALAVRAS = [
  // Frutas & Comidas
  { palavra: "BANANA", dica: "Fruta amarela e tropical" },
  { palavra: "MORANGO", dica: "Fruta vermelha e saborosa" },
  { palavra: "CHOCOLATE", dica: "Doce derivado do cacau" },
  { palavra: "PIZZA", dica: "Comida típica italiana muito pedida no sábado" },
  { palavra: "HAMBURGUER", dica: "Sanduíche com carne grelhada" },
  { palavra: "CHURRASCO", dica: "Carne assada na brasa brasileira" },

  // Animais
  { palavra: "GOLFINHO", dica: "Mamífero aquático muito inteligente" },
  { palavra: "LEOPARDO", dica: "Felino veloz e com manchas" },
  { palavra: "TARTARUGA", dica: "Animal de casco resistente e passos lentos" },
  { palavra: "CORUJA", dica: "Ave noturna símbolo da sabedoria" },

  // Tecnologia & Internet
  { palavra: "WHATSAPP", dica: "Aplicativo de mensagens mais usado no Brasil" },
  { palavra: "INTELIGENCIA", dica: "Capacidade mental e lógica" },
  { palavra: "COMPUTADOR", dica: "Máquina eletrônica de processar dados" },
  { palavra: "CELULAR", dica: "Aparelho portátil que você usa todo dia" },

  // Meio Liberal & Social (+18)
  { palavra: "MENAGE", dica: "Aventura a três com prazer compartilhado" },
  { palavra: "SWING", dica: "Troca consensual e madura entre casais" },
  { palavra: "HOTWIFE", dica: "Mulher que realiza suas vontades com apoio do parceiro" },
  { palavra: "CUCKOLD", dica: "Fetiche de ver ou saber da parceira com outro" },
  { palavra: "VOYEUR", dica: "Quem adora assistir e observar cenas quentes" },
  { palavra: "FETICHE", dica: "Desejo específico que acende o fogo na hora H" },
  { palavra: "TANTRA", dica: "Massagem corporal que expande o prazer e a energia" },
  { palavra: "LIBERAL", dica: "Estilo de vida de mente aberta e respeito mútuo" },
  { palavra: "CASALZAUM", dica: "O melhor clube liberal e comunidade do Brasil" },
  { palavra: "FANTASIA", dica: "Desejo oculto que desperta a imaginação" },
  { palavra: "NETWORKING", dica: "Conexões profissionais, collabs e parcerias" },
  { palavra: "CONEXAO", dica: "Sintonia física ou mental entre pessoas" },
  { palavra: "SEDUCAO", dica: "A arte do charme e do encanto" }
];

const FORCA_DESENHOS = [
`  +---+
  |   |
      |
      |
      |
      |
=========`,
`  +---+
  |   |
  O   |
      |
      |
      |
=========`,
`  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
`  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
`  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
`  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
`  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`
];

function formatarPalavra(palavra, letrasAcertadas) {
  return palavra
    .split("")
    .map(letra => (letrasAcertadas.has(letra) ? letra : "_"))
    .join(" ");
}

export default {
  name: "forca",
  description: "Jogo da Forca interativo e responsivo em tempo real",
  commands: ["forca", "jogodaforca", "hangman"],
  usage: `${PREFIX}forca [letra / palavra / novo / cancelar]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, remoteJid, userJid, pushName }) => {
    const subcomando = args[0]?.toUpperCase()?.trim();

    // 1. Iniciar ou reiniciar
    if (!subcomando || subcomando === "NOVO" || subcomando === "INICIAR" || subcomando === "START") {
      const item = BANCO_PALAVRAS[Math.floor(Math.random() * BANCO_PALAVRAS.length)];
      
      const novoJogo = {
        palavra: item.palavra,
        dica: item.dica,
        erros: 0,
        letrasAcertadas: new Set(),
        letrasErradas: new Set(),
        iniciadoPor: pushName || "Membro",
        maxErros: 6
      };

      games.set(remoteJid, novoJogo);
      await sendReact("🎮");

      const display = formatarPalavra(novoJogo.palavra, novoJogo.letrasAcertadas);

      return sendReply(
        `🕹️ *JOGO DA FORCA INICIADO!* 🕹️\n\n` +
        `\`\`\`${FORCA_DESENHOS[0]}\`\`\`\n\n` +
        `💡 *Dica:* ${novoJogo.dica}\n` +
        `🔤 *Palavra:* \`${display}\` (${novoJogo.palavra.length} letras)\n` +
        `❤️ *Tentativas restantes:* ${novoJogo.maxErros}\n\n` +
        `👉 *Como jogar:* Envie *${PREFIX}forca [LETRA]* para chutar uma letra.\n` +
        `🎯 Ou chute a palavra inteira: *${PREFIX}forca [PALAVRA]*\n` +
        `❌ Para cancelar: *${PREFIX}forca parar*`
      );
    }

    // 2. Parar o jogo
    if (subcomando === "PARAR" || subcomando === "CANCELAR" || subcomando === "RESET") {
      if (!games.has(remoteJid)) {
        return sendReply(`⚠️ Não há nenhum jogo da forca em andamento aqui! Digite *${PREFIX}forca* para começar.`);
      }
      const jogo = games.get(remoteJid);
      games.delete(remoteJid);
      await sendReact("⏹️");
      return sendReply(`🏳️ *Jogo da forca encerrado!*\nA palavra secreta era: *${jogo.palavra}*.`);
    }

    // 3. Verificar se há jogo ativo
    const jogo = games.get(remoteJid);
    if (!jogo) {
      return sendReply(
        `⚠️ Nenhum jogo da forca rolando no momento!\n\n` +
        `👉 Digite *${PREFIX}forca* para iniciar uma nova partida!`
      );
    }

    // 4. Chute de Palavra Completa
    if (subcomando.length > 1) {
      if (subcomando === jogo.palavra) {
        games.delete(remoteJid);
        await sendReact("🏆");
        return sendReply(
          `🎉🎉 *PARABÉNS, ${pushName || "Jogador"}! VOCÊ ACERTOU A PALAVRA INTEIRA!* 🏆✨\n\n` +
          `🎯 *Palavra:* *${jogo.palavra}*\n` +
          `💡 *Dica:* ${jogo.dica}\n\n` +
          `Vocês venceram o carrasco e salvaram o boneco! 👏🥂\n` +
          `Para jogar de novo: *${PREFIX}forca*`
        );
      } else {
        jogo.erros += 1;
        await sendReact("❌");
        if (jogo.erros >= jogo.maxErros) {
          games.delete(remoteJid);
          return sendReply(
            `💀 *ENFORCADO! VOCÊS PERDERAM!* 💀\n\n` +
            `\`\`\`${FORCA_DESENHOS[6]}\`\`\`\n\n` +
            `A palavra correta era: *${jogo.palavra}*\n` +
            `💡 Dica era: ${jogo.dica}\n\n` +
            `Bora tentar de novo? Digite *${PREFIX}forca*!`
          );
        }
        const display = formatarPalavra(jogo.palavra, jogo.letrasAcertadas);
        return sendReply(
          `❌ *Errou a palavra inteira!*\n\n` +
          `\`\`\`${FORCA_DESENHOS[jogo.erros]}\`\`\`\n\n` +
          `🔤 *Palavra:* \`${display}\`\n` +
          `❤️ *Tentativas restantes:* ${jogo.maxErros - jogo.erros}\n` +
          `❌ *Letras erradas:* ${Array.from(jogo.letrasErradas).join(", ") || "Nenhuma"}`
        );
      }
    }

    // 5. Chute de Uma Única Letra
    const letra = subcomando.charAt(0);
    if (!/[A-Z]/.test(letra)) {
      return sendReply(`⚠️ Por favor, envie uma letra válida de A a Z! Exemplo: *${PREFIX}forca A*`);
    }

    // Já chutou essa letra antes?
    if (jogo.letrasAcertadas.has(letra) || jogo.letrasErradas.has(letra)) {
      return sendReply(`⚠️ A letra *${letra}* já foi tentada antes! Tente outra.`);
    }

    if (jogo.palavra.includes(letra)) {
      jogo.letrasAcertadas.add(letra);
      await sendReact("✅");

      // Checa se completou todas as letras
      const venceu = jogo.palavra.split("").every(l => jogo.letrasAcertadas.has(l));
      if (venceu) {
        games.delete(remoteJid);
        return sendReply(
          `🎉🎉 *VITÓRIA! VOCÊS ADIVINHARAM!* 🏆✨\n\n` +
          `\`\`\`${FORCA_DESENHOS[jogo.erros]}\`\`\`\n\n` +
          `🎯 *Palavra:* *${jogo.palavra}*\n` +
          `💡 *Dica:* ${jogo.dica}\n` +
          `👤 *Letra final acertada por:* ${pushName || "Jogador"}\n\n` +
          `Excelente trabalho em equipe! 🥂\n` +
          `Para começar outra rodada: *${PREFIX}forca*`
        );
      }

      const display = formatarPalavra(jogo.palavra, jogo.letrasAcertadas);
      return sendReply(
        `✅ *Boa! A letra ${letra} existe na palavra!*\n\n` +
        `\`\`\`${FORCA_DESENHOS[jogo.erros]}\`\`\`\n\n` +
        `💡 *Dica:* ${jogo.dica}\n` +
        `🔤 *Palavra:* \`${display}\`\n` +
        `❤️ *Tentativas restantes:* ${jogo.maxErros - jogo.erros}\n` +
        `❌ *Letras erradas:* ${Array.from(jogo.letrasErradas).join(", ") || "Nenhuma"}\n\n` +
        `👉 Próximo chute: *${PREFIX}forca [LETRA]*`
      );
    } else {
      jogo.letrasErradas.add(letra);
      jogo.erros += 1;
      await sendReact("❌");

      if (jogo.erros >= jogo.maxErros) {
        games.delete(remoteJid);
        return sendReply(
          `💀 *ENFORCADO! FIM DE JOGO!* 💀\n\n` +
          `\`\`\`${FORCA_DESENHOS[6]}\`\`\`\n\n` +
          `A letra *${letra}* não existe na palavra!\n` +
          `🎯 A palavra secreta era: *${jogo.palavra}*\n` +
          `💡 Dica era: ${jogo.dica}\n\n` +
          `Não desanime! Digite *${PREFIX}forca* para tentar outra rodada!`
        );
      }

      const display = formatarPalavra(jogo.palavra, jogo.letrasAcertadas);
      return sendReply(
        `❌ *Ops! A letra ${letra} NÃO está na palavra!*\n\n` +
        `\`\`\`${FORCA_DESENHOS[jogo.erros]}\`\`\`\n\n` +
        `💡 *Dica:* ${jogo.dica}\n` +
        `🔤 *Palavra:* \`${display}\`\n` +
        `❤️ *Tentativas restantes:* ${jogo.maxErros - jogo.erros}\n` +
        `❌ *Letras erradas:* ${Array.from(jogo.letrasErradas).join(", ")}\n\n` +
        `👉 Próximo chute: *${PREFIX}forca [LETRA]*`
      );
    }
  }
};
