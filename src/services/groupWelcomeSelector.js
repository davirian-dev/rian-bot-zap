/**
 * Mapeador Inteligente de Mensagens de Boas-Vindas por Subgrupo - Club Casalzaum
 * Cada grupo possui sua identidade própria:
 * - Portaria: Recepção segura, aguardar aprovação, foto/áudio anti-fake. (Apresentação NÃO é aqui, é no Geral).
 * - Geral: Apresentação OBRIGATÓRIA (copiar e colar a ficha pronta), resenha e interação.
 * - Casais & Solteiras: Conexões, conversas liberais e afinidades.
 * - Casadas e Solteiras: Espaço 100% feminino e acolhedor.
 * - Festas & Eventos: Encontros presenciais e resenhas VIP.
 * - Criadores & Network: Collabs, mídias e parcerias.
 * - Salvador & Região: Encontros locais na Bahia.
 * - 40+ Liberal: Maturidade e discrição.
 * - Contos Eróticos: Relatos, fantasias e fetiches.
 * - Prévias VIP +18: Amostras autorizadas e novidades exclusivas.
 */

export function obterMensagemBoasVindasGrupo(grupoNome) {
  const g = (grupoNome || "").toLowerCase();

  // 1. 🔑 PORTARIA & RECEPÇÃO SEGURA (SALA DE ESPERA)
  if (g.includes("portaria")) {
    return (
`🔑 *BEM-VINDO(A) À PORTARIA DO CLUB CASALZAUM!* 🔞

Olá @member! Seja muito bem-vindo(a) à nossa recepção segura! 🛡️✨

⏳ *SALA DE ESPERA TEMPORÁRIA:*
Este é o nosso grupo de recepção segura e acolhedora. Para mantermos a comunidade 100% blindada contra perfis falsos e invasores de privacidade, você só precisa de **1 passo rápido** para ter seu acesso liberado ao grupo principal:

👉 **Envie sua confirmação anti-fake:**
• Uma foto simples fazendo o sinal de legal (👍) com a data de hoje escrita em um papelzinho **OU**
• Um áudio curtinho de 5 segundos dizendo o seu nome e a sua cidade.

💬 *ONDE ENVIAR:*
Você pode enviar sua confirmação **aqui mesmo no grupo** OU, se preferir total discrição, pode enviar **diretamente no privado (PV) da moderação / Davi & Mari**!

⚠️ *LEMBRETE SOBRE A SUA APRESENTAÇÃO:*
A sua apresentação oficial **NÃO é feita aqui na Portaria**! Assim que a moderação validar seu anti-fake, você receberá a entrada no **Grupo Geral dentro da Comunidade**, onde você colará sua apresentação para todos os membros te conhecerem e te darem as boas-vindas!

Aguarde um instante que a moderação já está atendendo você! 🥂`
    );
  }

  // 2. 🥂 GERAL | CLUB CASALZAUM (GRUPO PRINCIPAL DENTRO DA COMUNIDADE)
  if (g.includes("geral") && !g.includes("prévia") && !g.includes("previa")) {
    return (
`👑 *BEM-VINDO(A) AO GRUPO GERAL DO CLUB CASALZAUM!* 🔞

Olá @member! Que alegria ter você aqui dentro da nossa Comunidade Principal! 🥂✨

📣 *HORA DA SUA APRESENTAÇÃO OBRIGATÓRIA:*
Este é o grupo oficial de apresentações e resenha aberta!
👉 **Cole aqui agora no grupo o texto da sua apresentação** que você copiou no site da triagem!

Caso não tenha copiado, envie respondendo este modelo rápido:
• *Quem sou/somos:* (Casal, Mulher Solteira ou Single)
• *Cidade/Estado:*
• *Experiência no meio:* (Iniciante, curioso ou experiente)
• *Objetivo no Club:* (Amizades, resenha, festas ou encontros)
• *Regra do seu PV:* (Liberado ou Apenas com permissão no grupo)

📌 *REGRAS DE CONVIVÊNCIA:*
1. Respeito mútuo absoluto e sem julgamentos.
2. Invasão de PV sem autorização dá banimento imediato.
3. Proibido links externos e desrespeito.

Sinta-se em casa e boa resenha com a família Casalzaum! 😈🔥`
    );
  }

  // 3. 🔥 CASAIS & SOLTEIRAS | CLUB CASALZAUM
  if (g.includes("casais & solteiras") || g.includes("casais e solteiras")) {
    return (
`🔥 *BEM-VINDO(A) AO CASAIS & SOLTEIRAS!* 🌶️

Olá @member! Chegando no espaço mais quente e respeitoso da comunidade!
Aqui casais liberais e mulheres solteiras interagem com cumplicidade, liberdade e afinidade.

📌 *Dica de Ouro:*
Afinidades acontecem na resenha com consentimento mútuo. Jamais invada o PV de ninguém sem autorização prévia conquistada aqui no grupo! Divirta-se! 🥂✨`
    );
  }

  // 4. 👑 CASADAS E SOLTEIRAS | CLUBE DELAS
  if (g.includes("casadas e solteiras") || g.includes("delas") || g.includes("mulheres")) {
    return (
`👑 *BEM-VINDA AO CLUBE DELAS!* 💕✨

Olá @member! Este é um espaço 100% exclusivo e seguro para mulheres casadas e solteiras da comunidade.
Aqui conversamos abertamente sobre tudo: empoderamento, dicas, segurança, experiências e cumplicidade feminina, sem interferência masculina! Sinta-se totalmente livre e em casa! 🌸🥂`
    );
  }

  // 5. 🥳 FESTAS & EVENTOS | CLUB CASALZAUM
  if (g.includes("festa") || g.includes("evento")) {
    return (
`🥳 *BEM-VINDO(A) AO GRUPO DE FESTAS & EVENTOS VIP!* 🍾✨

Olá @member! Aqui organizamos nossos encontros presenciais, resenhas exclusivas, aniversários e as noites liberais do Club Casalzaum!
Fique atento(a) aos avisos fixados com locais, datas e confirmações de presença com a moderação! 🎉🥂`
    );
  }

  // 6. 💲 CRIADORES & NETWORK | CLUB CASALZAUM
  if (g.includes("criador") || g.includes("network")) {
    return (
`🎬 *BEM-VINDO(A) AO CRIADORES & NETWORK!* 💼👑

Olá @member! Espaço dedicado a parcerias, troca de experiências, collabs de gravação e networking de altíssimo nível entre criadores de conteúdo e membros entusiastas.
Foque em colaborações profissionais e conexões de valor! 🚀`
    );
  }

  // 7. 📍 SALVADOR & REGIÃO | CLUB CASALZAUM
  if (g.includes("salvador") || g.includes("região") || g.includes("regiao")) {
    return (
`📍 *BEM-VINDO(A) AO SALVADOR & REGIÃO!* ☀️🌴

Olá @member! O cantinho baiano da nossa comunidade!
Aqui concentramos os membros de Salvador, Lauro de Freitas, Litoral Norte e cidades vizinhas para resenhas locais, encontros reais e amizades pertinho de casa! Axé e bem-vindo(a)! 🥂`
    );
  }

  // 8. 40+ LIBERAL | CLUB CASALZAUM
  if (g.includes("40+") || g.includes("quarenta")) {
    return (
`🥂 *BEM-VINDO(A) AO 40+ LIBERAL!* 🌟

Olá @member! Espaço dedicado a casais e singles com mais maturidade, discrição e experiência de vida no meio liberal.
Resenha elegante, conversas de alto nível e total sigilo. Aproveite! 🥂`
    );
  }

  // 9. 💬 CONTOS ERÓTICOS | CLUB CASALZAUM
  if (g.includes("conto") || g.includes("erótico") || g.includes("erotico")) {
    return (
`📖 *BEM-VINDO(A) AO CONTOS ERÓTICOS!* ✍️🔥

Olá @member! O espaço da comunidade para soltar a imaginação.
Compartilhe seus relatos reais, fetiches, fantasias e leia as melhores histórias dos membros do Clube. Conteúdo envolvente com respeito mútuo! 🔥`
    );
  }

  // 10. PRÉVIA VIP +18 | GERAL
  if (g.includes("prévia") || g.includes("previa")) {
    return (
`🔞 *BEM-VINDO(A) AO PRÉVIA VIP +18!* 🔥

Olá @member! Aqui são postadas amostras autorizadas, bastidores e novidades exclusivas de Davi & Mari e criadores parceiros.
Lembre-se: respeito às mídias e sigilo absoluto (proibido prints)! 😈✨`
    );
  }

  // DEFAULT (COMUNIDADE GERAL / AVISOS)
  return (
`👑 *BEM-VINDO(A) AO CLUB CASALZAUM!* 🔞

Olá @member! É uma alegria enorme ter você na nossa comunidade oficial! 🥂✨
Lembre-se de respeitar todos os membros e colar a sua apresentação oficial no **Grupo Geral** para interagir com todo mundo! Abraços, Davi & Mari.`
  );
}
