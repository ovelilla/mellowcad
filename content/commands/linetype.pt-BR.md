---
title: "Comando LINETYPE (TIPOLINHA) no AutoCAD"
metaTitle: "Tipo de linha no AutoCAD: LINETYPE (TIPOLINHA)"
description: "Como funciona o LINETYPE do AutoCAD em português, TIPOLINHA: carregar tipos de linha do acadiso.lin, o atual, PorCamada e por que um tracejado sai contínuo."
figure: "Uma placa cujo furo é desenhado com HIDDEN atual e os dois eixos com CENTER, e depois o TIPOLINHA volta para PorCamada."
sourceHash: "d15530a865c1"
---

O LINETYPE, TIPOLINHA no AutoCAD em português, define o tipo de linha com que os novos objetos são desenhados. O AutoCAD abre o Gerenciador de tipos de linha; o MellowCAD ainda não o tem, então o TIPOLINHA executa a forma de linha de comando que o AutoCAD também tem, <Command id="-LINETYPE" />. Ele mostra o tipo de linha atual, `PorCamada` no início, e volta a pedir uma opção depois de cada resposta, até que Enter o encerre. PorCamada quer dizer que cada objeto usa o tipo de linha da sua camada; um tipo de linha nomeado no lugar é o do próprio objeto. Toda a execução é um passo que o <Command id="U" /> desfaz, e digitado com um apóstrofo dentro de um comando, o seu tipo de linha vale para o que esse comando desenhar em seguida.

Um desenho tem os seus próprios tipos de linha, salvos com ele e no seu DXF. Um novo tem seis: Continuous e, do arquivo métrico do AutoCAD acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM e DASHDOT; os outros são carregados do acadiso.lin, e um DXF traz os seus, também ISO e complexos, cujo texto, como o `GAS` do GAS_LINE, é desenhado ao longo da linha. O padrão é aplicado em cada linha como o AutoCAD aplica: centralizado ao longo dela, com traços iguais nas duas pontas, na escala do <Command id="LTSCALE" /> e na escala do tipo de linha do próprio objeto, que o <Command id="CHPROP" /> e a paleta Propriedades definem e que o CELTSCALE dá aos novos objetos.

## Options

### ?

Lista tipos de linha em duas colunas, nome e descrição. No prompt de opções, ele pergunta qual arquivo listar, o acadiso.lin por padrão ou o acad.lin, o arquivo do AutoCAD em polegadas, e lista os tipos de linha dele na ordem do arquivo; no prompt do Definir, os carregados no desenho cujo nome combina com o que você digita, todos com `*`, em ordem alfabética.

### Load

Pergunta quais tipos de linha carregar, um nome ou vários separados por vírgulas, curingas também (`DASH*`), e depois em qual arquivo procurar, o acadiso.lin no início e depois o último em que você procurou. Cada um encontrado é carregado e informado, na ordem do arquivo; sobre um já carregado ele pergunta antes, e <Keyword id="Yes" />, o padrão, o carrega de novo. Um nome que o arquivo não tem, ou um arquivo que não seja o acadiso.lin nem o acad.lin, é informado.

### Set

Pede o nome do tipo de linha e oferece o atual; digite o nome de um carregado, ou <Keyword id="BYLayer" />. Um que o acadiso.lin tem é carregado antes, como faz o AutoCAD; qualquer outro não é encontrado, como diz o AutoCAD, e o prompt de opções volta. Enter mantém o atual.

## Missing

O Gerenciador de tipos de linha, e criar tipos de linha ou carregá-los de um arquivo seu. As formas dos tipos de linha complexos como BATTING ou ZIGZAG, desenhadas como os vãos que elas ocupam. PorBloco. PSLTSCALE e MSLTSCALE, porque não há espaço do papel. O acadiso.lin do AutoCAD de cada idioma, cujos nomes o AutoCAD em português ou em espanhol carrega (TRACEJADA, TRAZOS): o Carregar lê o acadiso.lin em inglês em todos os idiomas, embora um desenho feito com eles abra com os seus. PLINEGEN: uma nova polilinha recomeça o padrão em cada vértice, a menos que a opção gerar Tipolinha do <Command id="PEDIT" /> o ative.

## Questions

### Qual é o comando LINETYPE no AutoCAD em português?

TIPOLINHA, com os atalhos `TL` e `DDLTYPE`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_LINETYPE`.

### Por que a minha linha tracejada aparece contínua?

Uma linha mais curta do que uma repetição do seu padrão é desenhada contínua, como no AutoCAD: o padrão do CENTER mede umas 51 unidades na escala padrão. Aumente ou diminua o <Command id="LTSCALE" /> para ajustar o padrão ao desenho. Confira também se o tipo de linha do objeto, ou o da camada dele quando é PorCamada, não é Continuous.

### Como mudar o tipo de linha de um objeto já desenhado?

Selecione-o e escolha o tipo de linha na linha Tipo de linha da paleta Propriedades, ou copie-o de outro objeto com o <Command id="MATCHPROP" />. O TIPOLINHA só define o tipo de linha do que for desenhado depois.

### Como mudar a escala do tipo de linha no AutoCAD?

Digite <Command id="LTSCALE" /> e o novo fator: 2 deixa cada traço duas vezes mais longo, no desenho inteiro.

### Como carregar um tipo de linha no AutoCAD?

O AutoCAD carrega um no Gerenciador de tipos de linha. Aqui, digite `-TIPOLINHA`, escolha <Keyword id="Load" />, digite o nome do tipo de linha, como `HIDDEN2` ou `ACAD_ISO02W100`, e pressione Enter para procurá-lo no acadiso.lin. O <Keyword id="Set" /> carrega um que o acadiso.lin tem ao torná-lo atual.
