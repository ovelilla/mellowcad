---
title: "Comando MOVE (MOVER) no AutoCAD"
description: "Como funciona o MOVE do AutoCAD em português, MOVER (alias M), prompt a prompt: ponto base e segundo ponto, ou um deslocamento X,Y,Z. Experimente grátis."
figure: "Um círculo movido 50 para a direita: selecionado, o centro como ponto base e o segundo ponto digitado."
sourceHash: "753ca38448bf"
---

O MOVE, MOVER no AutoCAD em português, leva os objetos que você seleciona de um lugar para outro: você os seleciona, dá um ponto base e depois um segundo ponto, e eles se movem a distância e na direção que vão do primeiro ao segundo. Nada mais muda neles. Como no AutoCAD, se havia objetos selecionados antes do comando, são eles que ele move; um ponto pode ser indicado, pego com o snap ao objeto ou digitado, e enquanto você escolhe o segundo ponto o conjunto acompanha o cursor, com uma linha desde o ponto base. O movimento é um passo que o Desfazer reverte.

## Options

### Displacement

Escolhido no prompt do ponto base, ou com Enter nele, que é o padrão: pede o movimento como um vetor, `10,5` move 10 em X e 5 em Y, e propõe o último que o MOVER usou naquele desenho. No segundo ponto, Enter faz o mesmo com o ponto base: as coordenadas dele são o movimento.

## Missing

Dois dos modos de seleção do AutoCAD no prompt de objetos, Grupo e Múltiplo, e selecionar com Ctrl as faces, arestas ou vértices de um sólido para mudar sua forma. Enquanto acompanha o cursor, o conjunto tem a cor de cada objeto, mas não o tipo de linha nem a espessura de linha, e os objetos de uma referência de bloco têm todos a cor da referência.

## Questions

### Qual é o comando MOVE no AutoCAD em português?

MOVER, com o alias `M`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_MOVE`.

### Como mover um objeto uma distância exata?

Dê o ponto base e digite o movimento como segundo ponto: `50,0` o move 50 em X. Com a entrada dinâmica ligada, como no início, um ponto depois do primeiro é relativo a ele, então o histórico o escreve `@50,0`. Ou aponte o cursor para onde quer ir, com Orto ou o rastreamento polar, e digite só a distância.

### Como subir objetos em 3D?

Dê uma Z ao movimento: `0,0,5` como segundo ponto, ou como <Keyword id="Displacement" />, sobe o conjunto 5. Um ponto digitado sem Z fica na elevação atual.

### Qual a diferença entre o MOVE e o STRETCH?

O MOVER move objetos inteiros. O <Command id="STRETCH" /> move só as pontas e os vértices que ficam dentro da janela de intersecção dele, e estica os objetos a que pertencem.
