import axios from "axios";
import { PREFIX } from "../../../config.js";

export default {
  name: "clima",
  description: "Consulta a previsão do tempo e temperatura em tempo real de qualquer cidade",
  commands: ["clima", "tempo", "temperatura", "previsao"],
  usage: `${PREFIX}clima [nome da cidade]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact }) => {
    const cidade = args.join(" ").trim();

    if (!cidade) {
      return sendReply(`⚠️ Por favor, informe o nome da cidade!\nExemplo: *${PREFIX}clima Salvador* ou *${PREFIX}clima São Paulo*`);
    }

    await sendReact("🌤️");

    try {
      // API pública rápida Open-Meteo com Geocoding gratuito sem necessidade de token
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;
      const { data: geoData } = await axios.get(geoUrl, { timeout: 6000 });

      if (!geoData?.results || geoData.results.length === 0) {
        return sendReply(`❌ Não consegui encontrar informações para a cidade: *${cidade}*. Verifique a grafia e tente novamente!`);
      }

      const local = geoData.results[0];
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;
      const { data: weatherData } = await axios.get(weatherUrl, { timeout: 6000 });

      const current = weatherData.current;
      const temp = Math.round(current.temperature_2m);
      const sensacao = Math.round(current.apparent_temperature);
      const umidade = current.relative_humidity_2m;
      const vento = Math.round(current.wind_speed_10m);

      let condicao = "Céu Aberto / Ensolarado ☀️";
      const code = current.weather_code;
      if (code >= 1 && code <= 3) condicao = "Parcialmente Nublado ⛅";
      else if (code >= 45 && code <= 48) condicao = "Nevoeiro / Neblina 🌫️";
      else if (code >= 51 && code <= 67) condicao = "Chuva Leve / Chuvisco 🌧️";
      else if (code >= 71 && code <= 77) condicao = "Queda de Neve ❄️";
      else if (code >= 80 && code <= 82) condicao = "Pancadas de Chuva 🌦️";
      else if (code >= 95) condicao = "Tempestade com Trovões ⛈️";

      return sendReply(
        `🌤️ *PREVISÃO DO TEMPO - ${local.name.toUpperCase()}* 📍\n` +
        `_${local.admin1 ? local.admin1 + ", " : ""}${local.country}_\n\n` +
        `🌡️ *Temperatura Atual:* ${temp}°C\n` +
        `🔥 *Sensação Térmica:* ${sensacao}°C\n` +
        `💧 *Umidade do Ar:* ${umidade}%\n` +
        `💨 *Velocidade do Vento:* ${vento} km/h\n` +
        `🌈 *Condição:* ${condicao}\n\n` +
        `_Dados meteorológicos atualizados em tempo real!_ ⏰`
      );
    } catch (err) {
      return sendReply(`❌ Ocorreu um erro ao consultar o clima no momento. Tente novamente em instantes.`);
    }
  }
};
