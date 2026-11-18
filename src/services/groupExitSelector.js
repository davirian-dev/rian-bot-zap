/**
 * Mapeador Inteligente de Mensagens de Saída por Subgrupo - Club Casalzaum
 *
 * Cada grupo possui seu contexto de despedida:
 * - Portaria: A pessoa não concluiu a triagem ou preferiu sair antes da verificação. Mensagem educada e respeitosa, deixando as portas abertas.
 * - Geral: Membro saiu da comunidade principal.
 * - Casais & Solteiras: Espaço de resenha liberal.
 * - Casadas e Solteiras (Clube Delas): Espaço feminino.
 * - Festas & Eventos: Eventos presenciais.
 * - Criadores & Network: Collabs e mídias.
 * - Salvador & Região: Cantinho baiano.
 * - 40+ Liberal: Maturidade e discrição.
 * - Contos Eróticos: Relatos e fetiches.
 * - Prévias VIP +18: Amostras exclusivas.
 */

export function obterMensagemSaidaGrupo(grupoNome) {
  const g = (grupoNome || "").toLowerCase();

  // 1. 🔑 PORTARIA & RECEPÇÃO SEGURA
  if (g.includes("portaria")) {
    return (
`🚪 @member acabou de sair da Portaria.
Não completou a triagem ou preferiu não prosseguir com a verificação. Se decidir retornar no futuro para fazer a triagem com segurança, as portas estarão abertas! 🥂`
    );
  }

  // 2. 🥂 GERAL | CLUB CASALZAUM (COMUNIDADE PRINCIPAL)
  if (g.includes("geral") && !g.includes("prévia") && !g.includes("previa")) {
    return (
`👋 @member acabou de sair do Grupo Geral.
Agradecemos pelos momentos de resenha e respeito compartilhados com a família Club Casalzaum! Até uma próxima oportunidade. ✨🥂`
    );
  }

  // 3. 🔥 CASAIS & SOLTEIRAS | CLUB CASALZAUM
  if (g.includes("casais & solteiras") || g.includes("casais e solteiras")) {
    return (
`🌶️ @member deixou o grupo Casais & Solteiras.
Esperamos que tenha aproveitado as conexões e conversas por aqui. Sucesso nos novos encontros e caminhos! 🥂✨`
    );
  }

  // 4. 👑 CASADAS E SOLTEIRAS | CLUBE DELAS
  if (g.includes("casadas e solteiras") || g.includes("delas") || g.includes("mulheres")) {
    return (
`🌸 @member se despediu do Clube Delas.
Foi um prazer ter você no nosso cantinho feminino de cumplicidade e liberdade! Estaremos sempre por aqui caso queira voltar. 🥂💕`
    );
  }

  // 5. 🥳 FESTAS & EVENTOS | CLUB CASALZAUM
  if (g.includes("festa") || g.includes("evento")) {
    return (
`🍾 @member saiu do grupo de Festas & Eventos.
Perdeu as novidades dos próximos encontros presenciais e resenhas VIP! Quem sabe em um próximo evento a gente se encontra. 🎉✨`
    );
  }

  // 6. 💲 CRIADORES & NETWORK | CLUB CASALZAUM
  if (g.includes("criador") || g.includes("network")) {
    return (
`🎬 @member saiu do grupo Criadores & Network.
Desejamos muito sucesso nos seus projetos, mídias e produções! Portas abertas para futuras collabs. 🚀`
    );
  }

  // 7. 📍 SALVADOR & REGIÃO | CLUB CASALZAUM
  if (g.includes("salvador") || g.includes("região") || g.includes("regiao")) {
    return (
`☀️ @member deixou o grupo Salvador & Região.
Axé e tudo de bom! Nos vemos pelas praias e noites de Salvador e Bahia! 🌴🥂`
    );
  }

  // 8. 40+ LIBERAL | CLUB CASALZAUM
  if (g.includes("40+") || g.includes("quarenta")) {
    return (
`🌟 @member deixou o grupo 40+ Liberal.
Agradecemos a discrição e a maturidade nos papos por aqui. Até uma próxima! 🥂`
    );
  }

  // 9. 💬 CONTOS ERÓTICOS | CLUB CASALZAUM
  if (g.includes("conto") || g.includes("erótico") || g.includes("erotico")) {
    return (
`📖 @member saiu do Contos Eróticos.
A história continua para quem fica! Valeu pelas interações e relatos compartilhados. 🔥`
    );
  }

  // 10. 🔞 PRÉVIA VIP +18
  if (g.includes("prévia") || g.includes("previa")) {
    return (
`🔞 @member saiu do Prévia VIP +18.
Perdeu as prévias e bastidores exclusivos de Davi & Mari! Volte quando quiser esquentar o clima. 🔥`
    );
  }

  // DEFAULT (OUTROS SUBGRUPOS / COMUNIDADE AVISOS)
  return (
`👋 @member acabou de sair do grupo...
Agradecemos a passagem e o respeito! As portas do Club Casalzaum continuam abertas para quem busca conexões reais e liberdade. 🥂✨`
  );
}
