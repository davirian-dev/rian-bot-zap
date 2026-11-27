# Workflow de Desenvolvimento com IA — Rian Bot Zap (Takeshi Bot)

Complemento ao `AGENTS.md` e `CLAUDE.md` para uso conjunto com Obsidian:

1. **Fonte da Verdade:** Leia `AGENTS.md` e os diagramas em `diagrams/` antes de alterar `src/connection.js`, middlewares ou comandos.
2. **Novos Comandos:** Siga exatamente o modelo de `src/commands/` descrito no `AGENTS.md` (separando `owner/`, `admin/` e `member/`).
3. **Persistência & Helpers:** Use sempre `src/utils/database.js` e os helpers injetados de `src/utils/loadCommonFunctions.js`.
4. **Validação Obrigatória:** Rode `npm test` / `npm run test:all` após alterar middlewares, handlers ou comandos.
