---
title: "Exercício de AutoCAD 3D: uma polia"
metaTitle: "Exercício de AutoCAD 3D: polia por revolução"
description: "Modele uma polia no AutoCAD 3D: a meia seção como polilinha fechada, girada em torno do eixo Y até virar um sólido, passo a passo. Pratique 3D online grátis."
figure: "A meia seção da polia ao lado do eixo, com as distâncias ao eixo cotadas."
model: "A polia como sólido, vista do sudeste no estilo visual Conceitual."
sourceHash: "f9c2a81b39fe"
---

Modele esta polia girando a meia seção dela em torno do eixo, em milímetros: um furo de 20, um cubo de 30 de comprimento e 40 de diâmetro, uma alma de 10 de espessura e um aro de 24 de largura, de 90 a 110 de diâmetro, centrados no cubo. A seção é desenhada como distâncias ao eixo, que segue o eixo Y para cima, então cada diâmetro é desenhado como a metade dele.

## Steps

### Desenhe a meia seção [#profile]

Na camada Contorno, uma só polilinha fechada com o <Command id="PLINE" />, a partir de `10,0`, cada ponto seguinte um passo a partir do último: `10,0`, `0,10`, `25,0`, `0,-7`, `10,0`, `0,24`, `-10,0`, `0,-7`, `-25,0`, `0,10` e `-10,0`, e depois <Keyword command="PLINE" id="Close" />.

### Gire a vista [#view]

O <Command id="-VIEW" /> com <Keyword command="VIEW" id="SEiso" /> mostra a peça do sudeste e de cima; o <Command id="VSCURRENT" /> com <Keyword command="VSCURRENT" id="Conceptual" /> sombreia as faces, o que mostra melhor uma peça torneada.

### Faça a revolução [#revolve]

<Command id="REVOLVE" />: selecione a seção e pressione Enter, depois <Keyword command="REVOLVE" id="Y" />: o eixo Y é o da polia. Enter aceita o ângulo padrão, uma volta inteira. O <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> a enquadra, e uma escala de 0.8x deixa uma margem em volta.
