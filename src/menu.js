/**
 * Menu do bot
 *
 * @author Dev Gui
 */
import pkg from "../package.json" with { type: "json" };
import { BOT_NAME } from "./config.js";
import { getPrefix } from "./utils/database.js";
import { readMore } from "./utils/index.js";

export function menuMessage(groupJid) {
  const date = new Date();

  const prefix = getPrefix(groupJid);

  return `╭━━⪩ BEM VINDO! ⪨━━${readMore()}
▢
▢ • ${BOT_NAME}
▢ • Data: ${date.toLocaleDateString("pt-br")}
▢ • Hora: ${date.toLocaleTimeString("pt-br")}
▢ • Prefixo: ${prefix}
▢ • Versão: ${pkg.version}
▢
╰━━─「🪐」─━━

╭━━⪩ 🧭 NAVEGAÇÃO RÁPIDA ⪨━━
▢
▢ • ${prefix}menu ➔ Menu completo de membros
▢ • ${prefix}jogos ➔ Aba exclusiva de Jogos, Cassino e Brincadeiras
▢ • ${prefix}menuadmin ➔ Aba exclusiva da Moderação e Segurança
▢
╰━━─「🧭」─━━

╭━━⪩ 👑 CLUB CASALZAUM ⪨━━
▢
▢ • ${prefix}triagem (Menu de entrada e cadastro)
▢ • ${prefix}planos (Valores de adesão e chave PIX)
▢ • ${prefix}regras (Regra de Ouro do PV e Sigilo)
▢ • ${prefix}site (Links oficiais, site e redes)
▢ • ${prefix}ebooks (Biblioteca de e-books e manuais)
▢ • ${prefix}grupos (Ecossistema dos 12 subgrupos)
▢ • ${prefix}roteiro (Dicas de motéis e privacidade)
▢ • ${prefix}legenda (Gerador de legendas e posts VIP)
▢ • ${prefix}membros (Admin: Controle de vencimentos 6M e 1 Ano)
▢
╰━━─「👑」─━━

╭━━⪩ 🔞 CASALZAUM OFC (VENDAS VIP) ⪨━━
▢
▢ • ${prefix}vip (Cardápio completo de conteúdos sem censura)
▢ • ${prefix}pix10 (PIX rápido de R$ 10 para 1 vídeo avulso)
▢ • ${prefix}pix69 (PIX de R$ 69,90 para o VIP Telegram Vitalício)
▢ • ${prefix}webhooks (Central de Webhooks e fluxos de redes sociais)
▢
╰━━─「🔞」─━━

╭━━⪩ 🎮 JOGOS & BRINCADEIRAS (NOVO!) ⪨━━
▢
▢ 👉 *Dica:* Digite *${prefix}jogos* para ver o guia completo!
▢
▢ • ${prefix}forca (Jogo da Forca interativo em tempo real)
▢ • ${prefix}velha (Jogo da Velha contra bot ou @membro)
▢ • ${prefix}adivinhe (Adivinhe o número de 1 a 100)
▢ • ${prefix}quiz (Desafio de conhecimentos gerais A, B, C, D)
▢ • ${prefix}ppt (Pedra, Papel ou Tesoura / Jokenpô)
▢ • ${prefix}eununca (Clássico Eu Nunca para votação)
▢ • ${prefix}cassino (Caça-níqueis apostando fichas virtuais)
▢ • ${prefix}roleta-cassino (Roleta Vermelho, Preto ou Verde 14x!)
▢ • ${prefix}raspadinha (Raspe a cartela digital da sorte)
▢ • ${prefix}cantada (Manda uma cantada ou xaveca alguém)
▢ • ${prefix}signo (Horóscopo do dia e conselho astral)
▢ • ${prefix}topfiel (Termômetro da fidelidade / golpista)
▢ • ${prefix}piada (Conta uma piada engraçada)
▢ • ${prefix}verdadeoudesafio (Verdade ou Desafio liberal)
▢ • ${prefix}desafiohot (Desafio liberal ousado)
▢ • ${prefix}shippar (Calcula química de casal)
▢ • ${prefix}roleta (Gira roleta liberal)
▢ • ${prefix}dado / ${prefix}beijar / ${prefix}abracar / ${prefix}tapa
▢
╰━━─「🎡」─━━

╭━━⪩ 🤖 INTELIGÊNCIA ARTIFICIAL ⪨━━
▢
▢ • ${prefix}deepseek (Conversa profunda com DeepSeek)
▢ • ${prefix}gemini (IA Google Gemini)
▢ • ${prefix}gpt-5-mini (IA rápida e conversacional)
▢ • ${prefix}flux (Criação de imagens profissionais por IA)
▢ • ${prefix}ia-sticker (Cria figurinhas exclusivas por IA)
▢ • ${prefix}transcrever (Transcreve áudio para texto)
▢ • ${prefix}tts (Transforma texto em áudio de voz)
▢ • ${prefix}vozlula (Áudio com voz de IA do Lula)
▢ • ${prefix}vozbolsonaro (Áudio com voz de IA do Bolsonaro)
▢ • ${prefix}vozes (Lista de vozes de famosos disponíveis)
▢
╰━━─「🚀」─━━

╭━━⪩ 📥 DOWNLOADS ⪨━━
▢
▢ • ${prefix}play-audio (Baixa áudio e música)
▢ • ${prefix}play-video (Baixa vídeo do YouTube)
▢ • ${prefix}instagram (Baixa mídias do Instagram)
▢ • ${prefix}tik-tok (Baixa vídeos do TikTok sem marca)
▢ • ${prefix}facebook (Baixa vídeos do Facebook)
▢ • ${prefix}pinterest (Baixa fotos/vídeos do Pinterest)
▢ • ${prefix}xtwitter (Baixa vídeos do X / Twitter)
▢ • ${prefix}yt-mp3 (Converte YouTube para MP3)
▢ • ${prefix}yt-mp4 (Baixa YouTube em MP4)
▢
╰━━─「🎶」─━━

╭━━⪩ 🛠️ FERRAMENTAS & UTILITÁRIOS ⪨━━
▢
▢ • ${prefix}clima [cidade] (Previsão do tempo e temperatura)
▢ • ${prefix}dolar (Cotação em tempo real de Dólar, Euro e Bitcoin)
▢ • ${prefix}letra [música] (Busca letra completa de qualquer música)
▢ • ${prefix}sticker (Cria figurinha de foto/vídeo)
▢ • ${prefix}to-image (Converte figurinha de volta para foto)
▢ • ${prefix}to-gif (Converte figurinha animada em GIF)
▢ • ${prefix}to-mp3 (Extrai áudio de qualquer vídeo)
▢ • ${prefix}removebg (Remove fundo de imagem)
▢ • ${prefix}attp / ${prefix}ttp (Figurinhas animadas de texto)
▢ • ${prefix}brat / ${prefix}bratvid (Efeito Brat)
▢ • ${prefix}cep (Consulta endereço por CEP)
▢ • ${prefix}perfil (Exibe suas estatísticas no grupo)
▢ • ${prefix}ping (Verifica latência e tempo de resposta)
▢
╰━━─「🚀」─━━

╭━━⪩ 🎨 CANVAS & EFEITOS ⪨━━
▢
▢ • ${prefix}procurado (Cartaz de Procurado / Wanted com a foto)
▢ • ${prefix}lula (Efeito e montagem petista)
▢ • ${prefix}bolsonaro (Efeito e montagem Bolsonaro)
▢ • ${prefix}blur / ${prefix}contraste / ${prefix}inverter / ${prefix}gray
▢ • ${prefix}pixel / ${prefix}cadeia / ${prefix}rip / ${prefix}espelhar
▢
╰━━─「❇」─━━

╭━━⪩ 🛡️ MODERAÇÃO & ADMIN ⪨━━
▢
▢ 👉 *Área restrita:* Digite *${prefix}menuadmin* para abrir todas as ferramentas!
▢
╰━━─「⭐」─━━`;
}
