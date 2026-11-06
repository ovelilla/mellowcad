---
title: "Comando STRETCH (ESTICAR) no AutoCAD"
description: "Como funciona o STRETCH do AutoCAD em português, ESTICAR (alias E): uma janela de intersecção, ponto base e segundo ponto, e por que às vezes ele só move."
figure: "Um retângulo e um círculo esticados 40 para a direita com uma janela de intersecção sobre o lado direito: os cantos dentro dela se movem, e o círculo com eles."
sourceHash: "de8671fb4290"
---

O STRETCH, ESTICAR no AutoCAD em português, move a parte do desenho que uma janela de intersecção pega e estica o que a liga ao resto. Selecione com uma janela de intersecção, arrastada da direita para a esquerda, ou um polígono de intersecção, sobre as pontas e os vértices a mover; depois dê um ponto base e um segundo ponto, como no <Command id="MOVE" />. O que a janela pega se move essa distância: as pontas de uma linha, os vértices de uma polilinha, as pontas de um arco, o contorno de uma hachura, as origens de uma cota. O que fica inteiro dentro dela se move inteiro; um círculo, um texto ou uma referência de bloco se move quando o centro ou o ponto de inserção fica dentro. Objetos selecionados um a um, ou com Janela, também se movem inteiros. O estiramento é um passo que o Desfazer reverte.

## Options

### Displacement

Escolhido no prompt do ponto base, ou com Enter nele, que é o padrão: pede o movimento como um vetor, `40,0` estica 40 em X. No segundo ponto, Enter faz o mesmo com o ponto base: as coordenadas dele são o movimento.

## Missing

Um arco elíptico com uma ponta dentro da janela, que o AutoCAD deforma: aqui ele se move inteiro se o centro estiver dentro, senão fica. Uma hachura não associativa pega em parte, que o AutoCAD deixa onde está. O texto de uma cota no lugar padrão fica quando só ele é pego.

## Questions

### Qual é o comando STRETCH no AutoCAD em português?

ESTICAR, com o alias `E`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_STRETCH`.

### Por que o STRETCH só move os objetos?

Porque o objeto inteiro fica dentro da janela, ou você o selecionou clicando nele: o ESTICAR move esses inteiros. Arraste uma janela de intersecção, da direita para a esquerda, só sobre as pontas que você quer mover.

### Como esticar uma distância exata?

Dê o ponto base e digite o movimento: `40,0` estica 40 em X, relativo ao ponto base com a entrada dinâmica ativada. Ou aponte o cursor para onde quer ir, com Orto ou o rastreamento polar, e digite só a distância.

### Dá para esticar um bloco no AutoCAD?

Uma referência de bloco se move inteira quando o ponto de inserção fica dentro da janela, e fica onde está quando não: o interior dela não estica. Use antes o <Command id="EXPLODE" /> para esticar as peças.
