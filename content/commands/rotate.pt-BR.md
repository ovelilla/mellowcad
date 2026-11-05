---
title: "Comando ROTATE (ROTAC) no AutoCAD"
description: "Como funciona o ROTATE do AutoCAD em português, ROTAC (alias RO), prompt a prompt: ponto base e ângulo, Cópia e Referência. Experimente grátis online."
figure: "Um retângulo girado 30° em torno do canto com Cópia: o original fica."
sourceHash: "0e5ae021e108"
---

O ROTATE, ROTAC no AutoCAD em português, gira os objetos que você seleciona em torno de um ponto base: você os seleciona, dá o ponto base e depois o ângulo, digitado ou indicado como um ponto cuja direção a partir do ponto base é o ângulo. A primeira linha dele diz qual sentido é positivo, o anti-horário por padrão (ANGDIR), e onde fica o 0 (ANGBASE). Enter no ângulo repete a última rotação, 0 num desenho novo. Os objetos giram em torno de um eixo paralelo ao Z do UCS que passa pelo ponto base, então em 3D eles mantêm a altura. A rotação é um passo que o Desfazer reverte.

## Options

### Copy

Gira uma cópia e deixa os objetos onde estavam, dizendo <Message id="rotatingCopy" />. Depois pede o ângulo de novo.

### Reference

Gira de um ângulo que você tem para o que você quer: pede o ângulo de referência (digitado, ou dois pontos que o medem) e depois o novo ângulo, e gira a diferença. Para deixar horizontal uma aresta inclinada, indique as duas pontas dela como referência e digite 0.

### Points

No novo ângulo da Referência: o novo ângulo é o de uma linha entre dois pontos que você indica, então os objetos se alinham com uma aresta já desenhada.

## Missing

Enquanto você dá o ângulo, o conjunto girado acompanha o cursor com a cor de cada objeto, mas não com o tipo de linha nem a espessura de linha.

## Questions

### Qual é o comando ROTATE no AutoCAD em português?

ROTAC, com o alias `RO`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_ROTATE`.

### Como girar um objeto para alinhá-lo com outro?

Escolha <Keyword id="Reference" />, indique dois pontos da aresta do objeto, escolha <Keyword id="Points" /> e indique dois pontos da linha com a qual ele deve ficar alinhado.

### Como girar um objeto e manter o original?

Escolha <Keyword id="Copy" /> antes de dar o ângulo: a cópia gira e o original fica.

### Por que o ROTATE gira para o outro lado?

Um ângulo positivo gira no sentido anti-horário, como diz o ANGDIR na primeira linha. Digite um ângulo negativo, `-30`, para girar no sentido horário.
