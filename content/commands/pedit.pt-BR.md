---
title: "Comando PEDIT (EDITARP) no AutoCAD"
metaTitle: "Editar polilinha no AutoCAD: PEDIT (EDITARP)"
description: "Como funciona o PEDIT do AutoCAD em português, EDITARP: linhas em polilinha, Unir, Largura, AJustar, Spline, Editar vértice e Múltiplo. Experimente grátis."
figure: "Três linhas ligadas pelas extremidades: o EDITARP transforma a primeira em polilinha, une as outras duas a ela e dá a ela uma largura de 2."
sourceHash: "bdc0bf10ac09"
---

O PEDIT, EDITARP no AutoCAD em português, edita uma polilinha. Selecione uma em `Selecionar polilinha ou [Múltiplo]:` ou antes do comando; um clique duplo numa polilinha também abre o EDITARP nela. Se você selecionar uma linha, um arco ou uma spline, ele diz <Message id="objectNotPolyline" /> e pergunta se deve transformá-la em uma, Sim por padrão: a nova polilinha toma o lugar dela, com as suas propriedades. Depois ele pede uma opção de novo e de novo, cada uma aplicada na hora, até que Enter o encerre. Uma polilinha 3D tem uma lista mais curta, sem largura, sem ajuste de curva e sem geração do tipo de linha, e a sua opção de spline é <Keyword id="Spline curve" />. Esc mantém o que foi feito; toda a edição é um passo que o <Command id="U" /> desfaz.

## Options

### Multiple

Edita várias polilinhas de uma vez: selecione-as, diga se as linhas, os arcos e as splines entre elas devem ser convertidos, e cada opção é aplicada a todas. O Unir dele pede uma distância de aproximação e um <Keyword id="Jointype" />: <Keyword id="Extend" /> apara ou estende os segmentos finais até se encontrarem, <Keyword id="Add" /> cobre o espaço com um novo segmento e <Keyword id="Both" /> estende onde pode e adiciona onde não pode.

### Close

Fecha a polilinha com um segmento do último vértice ao primeiro, um arco se o último segmento for um arco. Numa polilinha fechada a opção é <Keyword id="Open" />, que tira esse segmento.

### Join

Adiciona as linhas, os arcos e as polilinhas abertas que tocam as extremidades da polilinha, ponta com ponta, e diz quantos segmentos adicionou. Nada pode ser unido a uma polilinha fechada: <Message id="cannotJoinClosedPolyline" />.

### Width

Uma largura para todos os segmentos, digitada ou medida por dois pontos; 0 tira a largura.

### Edit vertex

Põe um X no primeiro vértice e pergunta o que fazer ali: <Keyword id="Next" /> e <Keyword id="Previous" /> movem o X, <Keyword id="Move" /> move o vértice, <Keyword id="Insert" /> adiciona um depois dele, <Keyword id="Break" /> e <Keyword id="Straighten" /> guardam o vértice, você leva o X a outro e <Keyword id="Go" /> quebra a polilinha entre os dois ou deixa um único segmento reto no que há entre eles, <Keyword id="Width" /> dá ao segmento seguinte as larguras inicial e final, <Keyword id="Tangent" /> dá ao vértice uma direção para um ajuste posterior e <Keyword id="eXit" /> volta.

### Fit

Desenha uma curva suave de arcos que passa por todos os vértices, tangentes onde se encontram, como o ajuste de curva do AutoCAD. Os vértices continuam lá, e editá-los muda a curva.

### Spline

Ajusta à polilinha uma B-spline que os vértices emolduram em vez de atravessar: quadrática ou cúbica, conforme SPLINETYPE, e tão fina quanto SPLINESEGS mandar. A de uma polilinha 3D é <Keyword id="Spline curve" />. A opção Objeto do <Command id="SPLINE" /> converte essa polilinha numa spline de verdade.

### Decurve

Tira a curva do AJustar ou do Spline: de novo segmentos retos entre os vértices.

### Ltype gen

<Keyword id="ON" /> aplica o tipo de linha num único padrão ao longo de toda a polilinha, de modo que uma polilinha tracejada de segmentos curtos continua mostrando traços; <Keyword id="OFF" />, o padrão, recomeça o padrão em cada vértice.

### Reverse

Inverte a polilinha: os vértices na outra ordem, e com eles os arcos e as larguras.

### Undo

Desfaz a última opção desta execução e continua perguntando.

## Missing

PEDITACCEPT: ao selecionar uma linha, um arco ou uma spline, ele sempre pergunta antes de convertê-la. PLINECONVERTMODE: uma spline vira uma polilinha de segmentos retos, muito mais do que o AutoCAD faz, nunca de arcos. Uma polilinha ajustada aparece na paleta Propriedades como uma polilinha comum, sem o título Polilinha 2D do AutoCAD e sem a sua linha Ajustar/Suavizar. Múltiplo com só polilinhas 3D no conjunto mostra o prompt 3D, onde o AutoCAD mostra o 2D. Não há malhas para editar.

## Questions

### Qual é o comando PEDIT no AutoCAD em português?

EDITARP, com o atalho `EDP`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_PEDIT`. Um clique duplo numa polilinha também o executa.

### Como transformar linhas em polilinha no AutoCAD?

Execute o EDITARP, selecione uma das linhas e pressione Enter para transformá-la em polilinha; depois escolha <Keyword id="Join" /> e selecione as outras: as que se tocam pelas extremidades viram uma única polilinha. O <Command id="JOIN" /> faz o mesmo num passo.

### Por que o PEDIT não funciona no meu objeto?

O EDITARP edita polilinhas e oferece converter linhas, arcos e splines; qualquer outra coisa, um texto, um círculo, um bloco, é recusada e a pergunta volta. Um objeto numa camada bloqueada diz <Message id="objectOnLockedLayer" />. O Unir só adiciona objetos cujas extremidades coincidem exatamente com as da polilinha: para espaços entre elas, use <Keyword id="Multiple" /> e uma distância de aproximação.

### Como mudar a largura de uma polilinha?

Escolha <Keyword id="Width" /> e digite a largura: todos os segmentos ficam com ela. Para um só, use <Keyword id="Edit vertex" />, leve o X ao vértice onde ele começa e escolha a sua <Keyword id="Width" />.

### Como deixar uma polilinha curva?

<Keyword id="Fit" /> passa arcos por todos os vértices; <Keyword id="Spline" /> faz uma curva mais suave que os vértices emolduram. <Keyword id="Decurve" /> a deixa reta de novo.
