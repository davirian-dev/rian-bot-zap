import { PREFIX } from "../../../config.js";

const ITENS_FETICHE = [
  { item: "Troca de Casais Completa (Full Swap)", cat: "Swing & Casais", nivel: "🔥🔥🔥🔥🔥" },
  { item: "Troca Suave / Apenas Carícias (Soft Swap)", cat: "Swing & Casais", nivel: "🔥🔥🔥" },
  { item: "Ménage Feminino (Ele + 2 Mulheres)", cat: "Menage", nivel: "🔥🔥🔥🔥" },
  { item: "Ménage Masculino (Ela + 2 Homens)", cat: "Menage", nivel: "🔥🔥🔥🔥" },
  { item: "Cuckold / Hotwife (Ver parceiro(a) com outra pessoa)", cat: "Exibicionismo & Fantasia", nivel: "🔥🔥🔥🔥🔥" },
  { item: "Voyerismo (Assistir outro casal na intimidade)", cat: "Observação", nivel: "🔥🔥🔥" },
  { item: "Exibicionismo (Ser assistido por alguém de fora)", cat: "Observação", nivel: "🔥🔥🔥🔥" },
  { item: "BDSM Leve (Vendas nos olhos, algemas e amarras suaves)", cat: "Fetiche & Dominação", nivel: "🔥🔥🔥" },
  { item: "Roleplay (Interpretar personagens na cama)", cat: "Criatividade", nivel: "🔥🔥" },
  { item: "Massagem Tântrica Nuru (Corpo a corpo com óleo deslizante)", cat: "Sensorial", nivel: "🔥🔥🔥🔥" },
  { item: "Lugar Público / Proibido (Carro, praia ou varanda)", cat: "Adrenalina", nivel: "🔥🔥🔥🔥" },
  { item: "Gangbang (Fantasia de grupo com uma pessoa no centro)", cat: "Hardcore Liberal", nivel: "🔥🔥🔥🔥🔥" }
];

export default {
  name: "roleta-fetiches",
  description: "Gira o radar de fetiches liberais e revela uma fantasia para debate",
  commands: ["roleta-fetiches", "sorteiofetiche", "fetichehot", "radarhot"],
  usage: `${PREFIX}roleta-fetiches`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact, pushName }) => {
    await sendReact("🔮");

    const f = ITENS_FETICHE[Math.floor(Math.random() * ITENS_FETICHE.length)];

    return sendReply(
      `🔮 *RADAR DE FETICHES & FANTASIAS* 🔞\n` +
      `_Club Casalzaum • Meio Liberal_\n\n` +
      `🎯 *Categoria:* ${f.cat}\n` +
      `🔥 *Intensidade:* ${f.nivel}\n` +
      `💎 *Fetiche Sorteado:*\n👉 *"${f.item}"*\n\n` +
      `💬 *Para o grupo debater:*\n` +
      `_Você ou seu casal já realizaram, pretendem realizar ou têm curiosidade nessa fantasia?_ 🥂✨`
    );
  }
};
