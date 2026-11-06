---
title: "Explodir no AutoCAD: comando EXPLODIR (EXPLODE)"
metaTitle: "Explodir no AutoCAD: comando EXPLODIR"
description: "Como funciona o EXPLODE do AutoCAD em português, EXPLODIR (alias X): polilinha em linhas e arcos, um bloco nos seus objetos, um texto em linhas. Experimente."
figure: "Um retângulo, uma única polilinha, explodido em quatro linhas, e depois uma delas apagada sozinha."
sourceHash: "479cf1cd58d9"
---

O EXPLODIR, EXPLODE no AutoCAD em inglês, desfaz um objeto composto nos objetos de que ele é feito. Selecione os objetos e pressione Enter: uma polilinha vira linhas e arcos sobre o seu eixo, uma referência de bloco os objetos do seu bloco, um nível abaixo, um texto multilinha um texto de uma linha para cada linha que ele mostra, e uma hachura de padrão as linhas do seu padrão. Cada peça mantém a camada e as propriedades do objeto; as de um bloco, as suas próprias. Uma polilinha com largura a perde, e o EXPLODIR avisa. Linhas, círculos, arcos, textos de uma linha e cotas não podem ser explodidos: são recusados ao serem selecionados, e uma spline, uma elipse ou uma hachura sólida ao fechar a seleção. A explosão é um passo que o Desfazer reverte.

## Missing

As cotas, que o AutoCAD explode em linhas, pontas de seta e texto e o MellowCAD recusa. Uma hachura cujo padrão não vem incluído aqui é recusada como uma sólida, e o texto multilinha explodido fica onde a fonte o desenha, um tantinho fora do lugar do AutoCAD.

## Questions

### Qual é o comando EXPLODE no AutoCAD em português?

EXPLODIR, com o alias `X`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_EXPLODE`.

### Como desfazer um explodir no AutoCAD?

Digite <Command id="U" /> ou pressione Ctrl+Z logo em seguida: a explosão é um único passo de desfazer. Mais tarde, o <Command id="JOIN" /> volta a fazer uma única polilinha de linhas e arcos que se tocam pelas pontas, e o <Command id="BLOCK" /> volta a fazer um bloco com os objetos.

### Dá para explodir um texto no AutoCAD?

Um texto multilinha, sim: cada linha vira um texto de uma linha. O texto de uma linha já é a menor peça, e o EXPLODIR o recusa.

### Como explodir um bloco no AutoCAD?

Selecione a referência de bloco e pressione Enter: ela vira os objetos do seu bloco, onde a referência os desenhava. Um bloco dentro dela continua sendo um bloco: exploda-o de novo. Os atributos voltam como as suas definições, sem os valores.
