# Como contribuir com Rastro Curto

O objetivo é comparar o comportamento de duas capturas HAR sem divulgar dados das requisições. Preserve a saída estritamente agregada: **nunca inclua URL, cookies, cabeçalhos, corpo, nome de arquivo, endereço IP ou horários na exportação**.

## Verificação local
- \`node --test\` — valida status, limites, dados inválidos e privacidade da saída.
- \`python -m http.server 8000\` — abre a interface localmente.
- Instale Playwright conforme \`README.md\` e rode \`python smoke.py\` para os fluxos em Chromium e Firefox.

## Pull requests
Explique o problema, a solução e quais testes foram executados. Inclua um teste que falhe sem a correção, quando aplicável. Use **apenas dados fictícios**; não inclua arquivos HAR reais ou amostras que tenham sido somente parcialmente anonimizadas.
