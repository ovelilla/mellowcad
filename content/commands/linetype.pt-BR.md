---
title: "Comando LINETYPE (TIPOLINHA) no AutoCAD"
metaTitle: "Tipo de linha no AutoCAD: LINETYPE (TIPOLINHA)"
description: "Como funciona o LINETYPE do AutoCAD em português, TIPOLINHA: o tipo de linha dos novos objetos, PorCamada e por que um tracejado sai contínuo. Experimente."
figure: "Uma placa cujo furo é desenhado com HIDDEN atual e os dois eixos com CENTER, e depois o TIPOLINHA volta para PorCamada."
sourceHash: "1cae7261efc0"
---

O LINETYPE, TIPOLINHA no AutoCAD em português, define o tipo de linha com que os novos objetos são desenhados. O AutoCAD abre o Gerenciador de tipos de linha; o MellowCAD ainda não o tem, então o TIPOLINHA executa a forma de linha de comando que o AutoCAD também tem, <Command id="-LINETYPE" />. Ele mostra o tipo de linha atual, `PorCamada` no início, e volta a pedir uma opção depois de cada resposta, até que Enter o encerre. PorCamada quer dizer que cada objeto usa o tipo de linha da sua camada; um tipo de linha nomeado no lugar é o do próprio objeto. Toda a execução é um passo que o <Command id="U" /> desfaz, e digitado com um apóstrofo dentro de um comando, o seu tipo de linha vale para o que esse comando desenhar em seguida.

Todo desenho tem seis tipos de linha carregados: Continuous e, do arquivo métrico do AutoCAD acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM e DASHDOT. O padrão é aplicado em cada linha como o AutoCAD aplica: centralizado ao longo dela, com traços iguais nas duas pontas.

## Options

### ?

Lista tipos de linha em duas colunas, nome e descrição. No prompt de opções, os do acadiso.lin; no prompt do Definir, os carregados no desenho cujo nome combina com o que você digita, todos com `*`.

### Set

Pede o nome do tipo de linha e oferece o atual; digite o nome de um carregado, ou <Keyword id="BYLayer" />. Um nome que não está carregado não é encontrado, como diz o AutoCAD, e o prompt de opções volta; Enter mantém o atual.

## Missing

O Gerenciador de tipos de linha, e carregar, criar ou descrever tipos de linha: só existem os seis acima, e a lista só descreve Continuous. Uma escala de tipo de linha por objeto (CELTSCALE): só a do desenho, <Command id="LTSCALE" />. PorBloco. PSLTSCALE e MSLTSCALE, porque não há espaço do papel. Os nomes de tipo de linha do AutoCAD em português, como TRACEJADA ou CENTRO: aqui eles são em inglês em todos os idiomas. PLINEGEN: uma nova polilinha recomeça o padrão em cada vértice, a menos que a opção gerar Tipolinha do <Command id="PEDIT" /> o ative.

## Questions

### Qual é o comando LINETYPE no AutoCAD em português?

TIPOLINHA, com os atalhos `TL` e `DDLTYPE`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_LINETYPE`.

### Por que a minha linha tracejada aparece contínua?

Uma linha mais curta do que uma repetição do seu padrão é desenhada contínua, como no AutoCAD: o padrão do CENTER mede umas 51 unidades na escala padrão. Aumente ou diminua o <Command id="LTSCALE" /> para ajustar o padrão ao desenho. Confira também se o tipo de linha do objeto, ou o da camada dele quando é PorCamada, não é Continuous.

### Como mudar o tipo de linha de um objeto já desenhado?

Selecione-o e escolha o tipo de linha na linha Tipo de linha da paleta Propriedades, ou copie-o de outro objeto com o <Command id="MATCHPROP" />. O TIPOLINHA só define o tipo de linha do que for desenhado depois.

### Como mudar a escala do tipo de linha no AutoCAD?

Digite <Command id="LTSCALE" /> e o novo fator: 2 deixa cada traço duas vezes mais longo, no desenho inteiro.
