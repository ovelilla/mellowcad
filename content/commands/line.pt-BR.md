---
title: "Comando LINE (LINHA) no AutoCAD"
description: "Como funciona o LINE do AutoCAD em português, LINHA (alias L), prompt a prompt: pontos indicados ou digitados, Desfazer e Fechar. Experimente grátis."
figure: "Um triângulo: o primeiro ponto digitado, os dois seguintes a partir do último ponto, e depois Fechar."
sourceHash: "5065fc1817a1"
---

O LINE, LINHA no AutoCAD em português, desenha segmentos retos, cada um um objeto próprio: você dá o primeiro ponto e depois cada ponto seguinte, até o Enter. Um ponto é indicado, pego com o snap ao objeto ou digitado. Como no AutoCAD com a entrada dinâmica ligada, um ponto digitado depois do primeiro é medido a partir do anterior, então `80,0` desenha 80 em X e o histórico o escreve `@80,0`; um número sozinho é uma distância na direção do cursor, e `<30` fixa o ponto seguinte a 30°. Enter ou o botão direito no primeiro ponto continuam a partir do fim da última linha, polilinha ou arco, tangente a um arco e pedindo só o comprimento. Quantos segmentos ele desenhar, um único U desfaz o comando inteiro.

## Options

### Undo

Desfaz o último segmento e volta a perguntar a partir do ponto anterior. Quando não resta segmento, diz <Message id="allLineSegmentsUndone" /> e volta a pedir o primeiro ponto.

### Close

Oferecido a partir do segundo segmento: desenha o último segmento de volta ao primeiro ponto e encerra o comando, fechando a figura.

## Missing

Tangente ou Perpendicular digitadas no primeiro ponto esperam o seguinte (um snap adiado), como no AutoCAD, mas só sobre linhas, círculos e arcos, não sobre um segmento de polilinha, uma elipse ou uma spline, e duas Perpendiculares adiadas não são resolvidas.

## Questions

### Qual é o comando LINE no AutoCAD em português?

LINHA, com o alias `L`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_LINE`.

### Como desenhar uma linha com ângulo e comprimento?

Dê o primeiro ponto e digite o seguinte como comprimento e ângulo: `@100<30` desenha 100 a 30°. Ou ligue o rastreamento polar, siga a guia dele nesse ângulo e digite só o comprimento.

### Como continuar a partir da última linha que desenhei?

Execute o LINHA e pressione Enter no primeiro ponto: ele começa no fim da última linha, polilinha ou arco. A partir de um arco, a linha segue tangente a ele e o LINHA pede só o comprimento. Quando não há de onde continuar, ele diz <Message id="noLineOrArcToContinue" />.

### Por que minha linha é feita de pedaços separados?

Cada segmento que o LINHA desenha é uma linha própria, como no AutoCAD. Para um único objeto, desenhe com o <Command id="PLINE" /> ou junte as linhas depois com o <Command id="JOIN" />.
