# Política de segurança e privacidade

## Escopo
O Rastro Curto é uma ferramenta de análise **local** de capturas HAR. A aplicação lê os arquivos no navegador e produz somente contagens agregadas por família de status HTTP e faixas de duração. O arquivo de origem não é carregado para um servidor pela aplicação atual.

**Atenção:** arquivos HAR originais podem conter tokens, cookies, URLs privadas, informações de clientes, dados pessoais e conteúdo de requisições. **Nunca publique um HAR real em issue, pull request ou fórum público.** Mesmo o boletim agregado revela volume e distribuição das requisições; confira seu conteúdo antes de compartilhar.

## Reportar um problema
Abra a aba **Security** do repositório e use o mecanismo de relato privado do GitHub se estiver habilitado. Se não estiver disponível, registre uma issue sem detalhes exploráveis ou dados sensíveis, usando somente um exemplo inteiramente fictício. Não publique credenciais, cookies, URLs internas ou capturas reais.

## Atualizações
A branch `main` é a versão mantida. O projeto não promete prazo fixo de resposta nem certificação independente. O código do navegador aplica uma política de segurança de conteúdo (CSP), mas isso não substitui a proteção dos arquivos originais.
