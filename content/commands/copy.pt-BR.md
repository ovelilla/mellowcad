---
title: "Comando COPY (COPIAR) no AutoCAD"
description: "Como funciona o COPY do AutoCAD em português, COPIAR (aliases CO e CP), prompt a prompt: um ponto base e quantas cópias você colocar. Experimente grátis."
figure: "Um círculo copiado três vezes em X a partir do mesmo ponto base, e depois Enter."
sourceHash: "e74bbdabf97c"
---

O COPY, COPIAR no AutoCAD em português, coloca cópias dos objetos que você seleciona: você os seleciona, dá um ponto base e depois um segundo ponto para cada cópia. Como no AutoCAD, cujo modo de cópia é Múltiplo por padrão, ele continua pedindo mais uma até você pressionar Enter ou escolher Sair, cada cópia medida a partir do mesmo ponto base. As cópias mantêm a camada, a cor e todas as outras propriedades dos objetos. Se havia objetos selecionados antes do comando, são eles que ele copia, e enquanto você coloca uma cópia o conjunto acompanha o cursor.

## Options

### Displacement

Escolhido no prompt do ponto base, ou com Enter nele: pede um deslocamento como vetor, `30,0` coloca uma cópia 30 em X, e encerra. Propõe o último que o COPIAR usou naquele desenho.

### Exit

Encerra o comando, como o Enter depois de colocada uma cópia.

### Undo

Desfaz a última cópia colocada. Desfazer a primeira diz <Message id="commandCompletelyUndone" /> e volta a pedir o segundo ponto.

## Missing

O modo Único do COPYMODE (copiar uma vez e encerrar) não é oferecido: o COPIAR é sempre Múltiplo, então o prompt do ponto base só lista <Keyword id="Displacement" />. A opção Matriz do segundo ponto, a fileira de cópias equidistantes do AutoCAD, também não é oferecida.

## Questions

### Qual é o comando COPY no AutoCAD em português?

COPIAR, com os aliases `CO` e `CP`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_COPY`.

### Como fazer várias cópias de uma vez?

Continue colocando: cada ponto que você dá é mais uma cópia a partir do mesmo ponto base, até o Enter. Para cópias em linhas, colunas ou em volta de um centro, o <Command id="ARRAY" /> as faz de uma vez.

### Como copiar um objeto a uma distância exata?

Dê o ponto base e digite o segundo ponto como a distância: `30,0` o copia 30 em X, porque a entrada dinâmica lê a partir do primeiro um ponto que vem depois. Ou aponte o cursor para onde quer ir, com Orto ou o rastreamento polar, e digite só a distância.

### Por que o COPY não tem a opção Matriz?

O MellowCAD ainda não a oferece. Para uma fileira de cópias equidistantes, o <Command id="ARRAYRECT" /> com uma linha faz o mesmo e as mantém como uma matriz editável.
