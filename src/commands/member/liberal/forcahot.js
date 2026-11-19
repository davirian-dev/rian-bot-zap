import { PREFIX } from "../../../config.js";

const BANCO_FORCA_HOT = [
  // Práticas & Meio Liberal
  { palavra: "MENAGE", dica: "Aventura a três pessoas com prazer compartilhado" },
  { palavra: "SWING", dica: "A prática clássica de troca consensual entre casais" },
  { palavra: "HOTWIFE", dica: "Esposa autorizada pelo marido a viver aventuras e fantasias" },
  { palavra: "CUCKOLD", dica: "Fetiche de ver ou saber da parceira com outro homem" },
  { palavra: "VOYEUR", dica: "Quem sente tesão e prazer em apenas observar e assistir" },
  { palavra: "EXIBICIONISMO", dica: "Prazer em ser visto ou filmado na intimidade" },
  { palavra: "TANTRA", dica: "Massagem corporal profunda focada na energia e no orgasmo" },
  { palavra: "FETICHE", dica: "Desejo ou fixação específica que desperta muito tesão" },
  { palavra: "SEDUCAO", dica: "O jogo do charme, olhar e conquista no meio liberal" },
  { palavra: "FANTASIA", dica: "Cenário dos sonhos que esquenta a mente na hora H" },
  { palavra: "AFINIDADE", dica: "Conexão de energia que deve acontecer antes de qualquer encontro" },
  { palavra: "CUMPLICIDADE", dica: "A base fundamental de qualquer casal liberal de respeito" },
  { palavra: "MOTEL", dica: "O local clássico de refúgio com hidro e privacidade" },
  { palavra: "GANGBANG", dica: "Fantasia em grupo com foco em realizar os desejos de uma pessoa" }
];

export default {
  name: "forcahot",
  description: "Jogo da Forca +18 temático com palavras do universo swing e meio liberal",
  commands: ["forcahot", "forcaliberal", "hotforca"],
  usage: `${PREFIX}forcahot [letra/palavra]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact, remoteJid, pushName }) => {
    // Redireciona com aviso ou roda diretamente
    const sub = args[0];
    if (!sub) {
      const item = BANCO_FORCA_HOT[Math.floor(Math.random() * BANCO_FORCA_HOT.length)];
      await sendReact("🔞");
      return sendReply(
        `🔞 *DESAFIO DA FORCA HOT (+18)* 😈\n\n` +
        `💡 *Dica Liberal:* ${item.dica}\n` +
        `🔤 *Tamanho da Palavra:* ${item.palavra.length} letras\n\n` +
        `👉 Para jogar a forca completa com o boneco e chutes dinâmicos, use:\n` +
        `*${PREFIX}forca* no grupo!`
      );
    }
  }
};
