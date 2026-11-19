import axios from "axios";
import { PREFIX } from "../../../config.js";

export default {
  name: "letra",
  description: "Busca a letra completa de qualquer música nacional ou internacional",
  commands: ["letra", "lyrics", "letras", "musica"],
  usage: `${PREFIX}letra [artista / nome da música]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendReact }) => {
    const busca = args.join(" ").trim();

    if (!busca) {
      return sendReply(`⚠️ Informe o nome da música e/ou artista!\nExemplo: *${PREFIX}letra Casalzaum* ou *${PREFIX}letra Hungria Lembranças*`);
    }

    await sendReact("🎶");

    try {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(busca)}`;
      // Tenta pesquisa na API de letras
      const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(busca)}`, { timeout: 8000 });

      if (!data || data.length === 0) {
        return sendReply(`❌ Nenhuma letra encontrada para "*${busca}*". Tente digitar o nome do artista junto.`);
      }

      const musica = data[0];
      const letra = musica.plainLyrics || musica.syncedLyrics;

      if (!letra) {
        return sendReply(`❌ Letra instrumental ou não disponível para "*${musica.trackName}*".`);
      }

      // Trunca se passar de 3500 caracteres para não estourar limite do zap
      const letraFormatada = letra.length > 3000 ? letra.substring(0, 3000) + "\n\n...(continua)" : letra;

      return sendReply(
        `🎵 *${musica.trackName.toUpperCase()}* 🎤\n` +
        `👤 *Artista:* ${musica.artistName}\n` +
        `💿 *Álbum:* ${musica.albumName || "Single"}\n\n` +
        `────────────────────\n` +
        `${letraFormatada}\n` +
        `────────────────────`
      );
    } catch (err) {
      return sendReply(`❌ Não consegui localizar a letra da música solicitada. Tente com outro termo.`);
    }
  }
};
