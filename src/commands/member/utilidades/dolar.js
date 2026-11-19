import axios from "axios";
import { PREFIX } from "../../../config.js";

export default {
  name: "dolar",
  description: "Consulta a cotação oficial em tempo real do Dólar, Euro e Bitcoin",
  commands: ["dolar", "cotacao", "euro", "btc", "moeda"],
  usage: `${PREFIX}dolar`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("💵");

    try {
      const url = "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL";
      const { data } = await axios.get(url, { timeout: 6000 });

      const usd = data.USDBRL;
      const eur = data.EURBRL;
      const btc = data.BTCBRL;

      const formatarValor = (val) => parseFloat(val).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      return sendReply(
        `📈 *COTAÇÃO DE MOEDAS EM TEMPO REAL* 💵\n\n` +
        `🇺🇸 *Dólar Comercial (USD):*\n` +
        `• Compra: *R$ ${formatarValor(usd.bid)}*\n` +
        `• Variação Hoje: ${parseFloat(usd.pctChange) >= 0 ? "🟢 +" : "🔴 "}${usd.pctChange}%\n\n` +
        `🇪🇺 *Euro (EUR):*\n` +
        `• Compra: *R$ ${formatarValor(eur.bid)}*\n` +
        `• Variação Hoje: ${parseFloat(eur.pctChange) >= 0 ? "🟢 +" : "🔴 "}${eur.pctChange}%\n\n` +
        `🪙 *Bitcoin (BTC):*\n` +
        `• Valor: *R$ ${formatarValor(btc.bid)}*\n` +
        `• Variação Hoje: ${parseFloat(btc.pctChange) >= 0 ? "🟢 +" : "🔴 "}${btc.pctChange}%\n\n` +
        `_Fonte oficial: Banco Central & Mercados Financeiros_ 🏦`
      );
    } catch (err) {
      return sendReply(`❌ Não foi possível carregar as cotações financeiras agora. Tente em alguns instantes.`);
    }
  }
};
