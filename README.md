# Rastro Curto

**O site ficou mais rápido depois da correção?** Compare duas capturas de rede e baixe um boletim curto para anexar ao chamado. O arquivo exportado contém apenas contagens por faixa de duração e família HTTP.

[Abrir a ferramenta](https://ykauttiz.github.io/rastro-curto/) · [Testes de integração](https://github.com/ykauttiz/rastro-curto/actions/workflows/test.yml)

## Experimente em um minuto

Clique em **Experimentar com um caso fictício**. Cada captura tem seis requisições. Na linha **2.000 ms ou mais**, a contagem passa de duas para zero. Em **5xx**, passa de uma para zero. Clique em **Baixar boletim .txt** e confira o resultado antes de compartilhar.

## Use suas capturas

1. Na aba Rede das ferramentas de desenvolvimento, grave a tarefa e exporte um HAR. Repita o mesmo fluxo e mantenha aparelho, cache e conexão comparáveis.
2. Abra a primeira gravação em A. Use B se quiser comparar. O limite é 12 MiB e 50 mil entradas por arquivo.
3. Leia Δ como a contagem de B menos a de A. Um resultado negativo na faixa mais lenta indica menos requisições nessa faixa. O tempo de cada entrada pode se sobrepor ao de outra.
4. Para recomeçar, clique em **Limpar a sessão**. Apenas a preferência de tema persiste no navegador.

## Para quem serve

Para suporte e QA que precisam informar quantas requisições demoraram ou falharam. O boletim permite discutir uma mudança sem anexar a captura inteira. Ele perde deliberadamente a identidade de cada requisição. Investigar a causa, identificar uma rota ou depurar um cabeçalho exige outra etapa. As contagens também podem revelar volume de atividade.

## Como os dados são tratados

O navegador lê o arquivo localmente. O código constrói dois histogramas a partir de **entry.time** e **entry.response.status**. Nomes de arquivos, URLs, cookies, datas, cabeçalhos e corpos ficam fora da saída. Duração negativa ou ausente entra em **Sem medição**. Status zero ou ausente entra em **Desconhecido**. Entradas repetidas contam como novas observações. O boletim é texto simples, sem formato HAR. Sem dependências de produção, telemetria ou servidor de upload.

## Segurança, privacidade e escopo

Arquivos HAR **originais** podem registrar tokens, cookies, URLs internas e dados pessoais. Não os publique no GitHub nem os compartilhe em tickets públicos. A saída gerada pelo Rastro Curto **não é uma versão sanitizada do HAR**: é apenas um resumo de contagens. Até as contagens podem revelar volume de atividade. Leia a [política de segurança](SECURITY.md) e as [orientações de contribuição](CONTRIBUTING.md).

Os testes de navegador agora executam também a largura de 375 px, verificam que o tema “Sistema” acompanha o dispositivo e iniciam o servidor a partir da pasta do próprio script, independentemente do diretório de trabalho.

## Executar e contribuir

Na pasta do projeto, execute `python -m http.server 8000` e abra `http://localhost:8000`. O núcleo fica em `core.js`, a interação e a exportação em `app.js`. Rode `node --test` para verificar a agregação. Para executar os testes de interface, instale `playwright==1.55.0`, execute `python -m playwright install chromium firefox` e depois `python smoke.py`. Para reportar um problema, use uma captura fictícia e informe as contagens esperadas.

## Por que este projeto existe

Pesquisa de 22 de novembro de 2026. A Atlassian orienta clientes a gravar a rede durante um problema. O Chrome documenta quais cabeçalhos sensíveis omite por padrão. Cloudflare e BugTape oferecem limpeza de arquivos HAR para continuar investigando as requisições. Aqui, a saída atende a uma pergunta mais restrita e permite comparar duas gravações só pelas contagens. A utilidade desse formato em chamados reais ainda precisa ser avaliada com equipes de suporte.

[Guia de suporte da Atlassian](https://confluence.atlassian.com/kb/generating-har-files-and-analyzing-web-requests-720420612.html) · [Exportação no Chrome](https://developer.chrome.com/docs/devtools/network/reference/#save-as-har) · [Cloudflare HAR Sanitizer](https://har-sanitizer.pages.dev/) · [BugTape](https://bugtape.ai/tools/har-sanitizer/)
