---
title: "Comando CHAMFER (CHANFRO) no AutoCAD"
description: "Como funciona o CHAMFER do AutoCAD em português, CHANFRO (alias CHA), prompt a prompt: duas distâncias, duas linhas ou uma polilinha, múlTiplo e Shift."
figure: "Quatro linhas, depois Distância 10 para as duas e múlTiplo: dois cantos chanfrados e dois que ficam vivos."
sourceHash: "e43c5b72ffc8"
---

O CHAMFER, CHANFRO no AutoCAD em português, corta o canto entre duas linhas com um chanfro reto. Selecione a primeira linha e depois a segunda: cada uma é aparada ou estendida até o chanfro, a primeira pela primeira distância e a segunda pela segunda, e o chanfro as une. Funciona com duas linhas, com dois trechos retos de uma polilinha, ou com uma linha e uma polilinha, que ele une numa única polilinha. Como no AutoCAD, a primeira linha dele diz as distâncias atuais, que ficam salvas no desenho; com as duas em 0, como ao começar, ele faz um canto vivo, as linhas se encontrando. Enquanto você seleciona a segunda linha, o canto que ele faria aparece sobre as linhas.

## Options

### Undo

Desfaz o último chanfro desta execução, e com ele uma mudança das distâncias.

### Polyline

Pede uma polilinha 2D e chanfra todos os cantos dela; depois diz quantas linhas foram chanfradas e por que alguma não foi.

### Distance

Pede a primeira e a segunda distância do chanfro. A segunda propõe a primeira, então Enter nela faz o chanfro igual, a 45 graus num canto em esquadro.

### Multiple

Volta a pedir uma primeira linha depois de cada chanfro, até Enter ou Esc.

## Missing

Ângulo, que define o chanfro por uma distância e um ângulo, Método e Aparar: o CHANFRO sempre trabalha com duas distâncias e sempre apara as linhas. No AutoCAD o chanfro toma a escala do tipo de linha da segunda linha; aqui não.

## Questions

### Qual é o comando CHAMFER no AutoCAD em português?

CHANFRO, com o alias `CHA`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_CHAMFER`.

### Como fazer um chanfro de 45 graus no AutoCAD?

Escolha <Keyword id="Distance" />, digite a distância e pressione Enter na segunda: num canto em esquadro, duas distâncias iguais dão um chanfro de 45 graus.

### Qual a diferença entre CHAMFER e FILLET?

O CHANFRO une duas linhas com um chanfro reto; o <Command id="FILLET" />, com um arco tangente às duas. Os dois aparam ou estendem as linhas até ele, e os dois fazem um canto vivo com 0 ou com o Shift pressionado ao selecionar a segunda linha.

### Por que o chanfro não funciona?

Ele diz por quê: <Message id="chamferDistanceTooLarge" /> quando uma distância passa do fim da sua linha, <Message id="linesParallel" /> com linhas paralelas, e <Message id="chamferRequiresLines" /> com um arco ou um círculo. Com as duas distâncias em 0 ele faz um canto, não um chanfro.

### Como chanfrar todos os cantos de um retângulo?

Um retângulo é uma polilinha: escolha <Keyword id="Polyline" /> e selecione-o, e todos os cantos são chanfrados com as distâncias atuais.
