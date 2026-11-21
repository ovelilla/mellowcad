---
title: "Comando MINSERT (INSERIRM) no AutoCAD"
metaTitle: "Comando MINSERT (INSERIRM) no AutoCAD"
description: "Como o MINSERT do AutoCAD, INSERIRM em português, insere um bloco em linhas e colunas como um só objeto, o que pergunta e por que EXPLODIR o recusa."
figure: "Um assento transformado em bloco e depois colocado pelo INSERIRM em três linhas de cinco: um só objeto."
sourceHash: "d43a50bbc8fe"
---

INSERIRM (MINSERT em inglês) insere várias vezes um bloco definido no desenho, em linhas e colunas, como um só objeto. Pergunta o mesmo que <Command id="-INSERT" /> — o nome do bloco (Enter aceita o oferecido, o último bloco inserido), o ponto de inserção, os fatores de escala X e Y e o ângulo de rotação —, depois o número de linhas e o de colunas (Enter é 1) e depois a distância entre linhas e a distância entre colunas. Só são pedidas as distâncias de que as contagens precisam, e uma linha de uma coluna é uma referência de bloco comum. Um bloco com atributos pede os valores por último, uma vez, e todas as cópias os mostram.

As linhas vão ao longo do eixo Y do bloco e as colunas ao longo do seu eixo X, ambos girados pela rotação; as distâncias estão em unidades do desenho, seja qual for a escala, e uma negativa coloca as cópias para baixo ou para a esquerda. Na distância entre linhas, dois pontos especificam em vez disso uma célula unitária: a largura é a distância entre colunas e a altura a distância entre linhas. O resultado é o bloco InserirM do AutoCAD: move, copia, gira, escala e espelha como um só, <Command id="LIST" /> acrescenta as linhas e colunas, e a paleta Propriedades as mostra como Colunas, Espaçamento entre colunas, Linhas e Espaçamento entre linhas, que podem ser digitadas. <Command id="EXPLODE" /> o conta como minserido e o deixa inteiro, como faz o AutoCAD. Um DXF o abre e o salva como o próprio AutoCAD.

## Options

### ?

No nome do bloco: lista os blocos do desenho, como faz <Command id="BLOCK" />, e termina.

### Scale

No ponto de inserção: pede um só fator para os dois eixos e volta a pedir o ponto. Depois do ponto, os fatores X e Y não são pedidos.

### Rotate

No ponto de inserção: pede o ângulo, que gira cada cópia e a matriz inteira, e volta a pedir o ponto. Depois do ponto, a rotação não é pedida.

## Missing

No ponto de inserção, pontoBase, X, Y e Z, e na escala X, Canto e XYZ, como faltam ao -INSERIR; o `~` que abre um arquivo de desenho; os blocos anotativos, que não existem aqui. Uma cota linear seleciona o INSERIRM inteiro, não um objeto de uma das cópias. As linhas Anotativo, Unidade do bloco e Fator de unidade da paleta Propriedades.

## Questions

### O que é o comando MINSERT no AutoCAD?

Inserção múltipla: coloca um bloco numa matriz retangular de linhas e colunas, como um só objeto. Mude depois as contagens ou o espaçamento na paleta Propriedades.

### Como explodir um bloco inserido com MINSERT?

Não é possível: <Command id="EXPLODE" /> diz que ele foi minserido e o mantém, no AutoCAD como aqui, mesmo com linhas e colunas em 1. Insira o bloco de novo com <Command id="-INSERT" />, ou coloque as cópias com <Command id="ARRAYRECT" />, cuja matriz explode em seus itens.

### Como se chama o MINSERT no AutoCAD em português?

INSERIRM. Não tem atalho nem botão na faixa de opções, então digite o nome inteiro; `_MINSERT` funciona em qualquer idioma do AutoCAD.

### Qual a diferença entre MINSERT e MATRIZ?

O MINSERT repete um bloco como uma só referência que não pode ser explodida. <Command id="ARRAYRECT" /> repete quaisquer objetos como uma matriz associativa, com alças para mudar contagens e espaçamento, que <Command id="EXPLODE" /> explode.
