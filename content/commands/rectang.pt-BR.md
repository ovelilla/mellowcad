---
title: "Retângulo no AutoCAD: comando RETANGULO (RECTANG)"
metaTitle: "Retângulo no AutoCAD: comando RETANGULO"
description: "Como o RECTANG do AutoCAD em português, RETANGULO (alias RET), desenha um retângulo: dois cantos, Dimensões, Área e Rotação, com concordância ou chanfro."
figure: "Dois retângulos por dois cantos, o segundo digitado em relação ao primeiro: um com Concordância 8 e o seguinte com Chanfro 8."
sourceHash: "a5d4e90c06aa"
---

O RETANGULO, RECTANG no AutoCAD em inglês, desenha um retângulo a partir de dois cantos opostos, indicados ou digitados: `0,0` e depois `100,50`, relativo ao primeiro com a entrada dinâmica, faz um de 100 por 50. É uma única polilinha fechada de quatro vértices, na camada atual. As opções do primeiro prompt definem como os retângulos seguintes são desenhados, e cada uma mantém o seu valor pelo resto da sessão: o próximo RETANGULO diz na primeira linha as que estão valendo. A sua opção de largura dá a cada lado uma largura de polilinha. Enquanto você posiciona o outro canto, o retângulo acompanha o cursor; com a entrada dinâmica ativada, você pode digitar o comprimento, Tab e a largura.

## Options

### Chamfer

Pede uma primeira e uma segunda distância de chanfro, e corta cada canto com elas: oito vértices. Uma distância de 0 o desativa. Substitui a concordância.

### Elevation

Pede a altura em que o retângulo é desenhado, o seu Z.

### Fillet

Pede um raio e arredonda cada canto com ele. Um raio de 0 o desativa. Substitui o chanfro.

### Thickness

Pede uma espessura: o retângulo se ergue essa altura, como uma parede, numa vista 3D.

### Area

No outro canto: pede a área, depois se você vai dar o <Keyword id="Length" /> ou a <Keyword id="Width" />, e depois esse lado. O outro lado é calculado, contando os cantos, e o retângulo é criado na hora.

### Dimensions

No outro canto: pede o comprimento e a largura, e depois um ponto que define para que lado do primeiro canto fica o retângulo.

### Rotation

No outro canto: pede o ângulo em que o retângulo é girado, digitado ou como um ponto a partir do primeiro canto, ou dois pontos com <Keyword id="Pick" />. O ângulo vale pela sessão.

## Missing

Um comprimento ou largura de 0 em <Keyword id="Area" />, que aqui não desenha nada e no AutoCAD desenha uma polilinha quebrada. Depois de uma resposta recusada no prompt de rotação, o MellowCAD repete o prompt inteiro, onde o AutoCAD não escreve mais nada.

## Questions

### Qual é o comando do retângulo no AutoCAD em português?

RETANGULO, com o alias `RET`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_RECTANG`.

### Como fazer um retângulo com medidas no AutoCAD?

Dê o primeiro canto e digite o outro em relação a ele: `100,50` com a entrada dinâmica ativada, como ao começar, ou `@100,50` sem ela, o faz com 100 de comprimento e 50 de largura. Ou escolha <Keyword id="Dimensions" /> e digite os dois lados.

### Como fazer um retângulo com cantos arredondados?

Escolha <Keyword id="Fillet" /> no primeiro prompt e digite o raio; depois dê os dois cantos.

### Por que o retângulo sai com os cantos arredondados ou cortados?

O RETANGULO mantém a concordância e o chanfro pela sessão, então um retângulo desenhado depois de um com eles também os leva: a primeira linha dele o diz. Escolha <Keyword id="Fillet" /> e digite `0` para voltar a desenhar cantos vivos.

### O retângulo é uma polilinha no AutoCAD?

Sim: uma única polilinha fechada. O <Command id="EXPLODE" /> a divide em quatro linhas, e o <Command id="OFFSET" /> a desloca inteira.
