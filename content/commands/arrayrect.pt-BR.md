---
title: "Comando ARRAYRECT (MATRIZRETANG) no AutoCAD"
metaTitle: "Array retangular no AutoCAD: comando ARRAYRECT"
description: "Como funciona o ARRAYRECT do AutoCAD em português, MATRIZRETANG, prompt a prompt: colunas, linhas e níveis, espaçamento, associativa ou não. Experimente grátis."
figure: "Um quadrado e seu círculo em 5 colunas e 3 linhas, a 16 e 14: primeiro a quantidade, depois o espaçamento."
sourceHash: "c8c8d747d0c9"
---

O ARRAYRECT, MATRIZRETANG no AutoCAD em português, copia uma seleção em colunas e linhas, e em níveis se você quiser, como um só objeto de matriz. Ele pede os objetos, diz o tipo e se a matriz é associativa, e a mostra na hora: 4 colunas ao longo do eixo X do UCS e 3 linhas ao longo do Y, afastadas uma vez e meia o tamanho da seleção. Depois, um só prompt a edita ao vivo até o Enter criá-la, com as opções ou com as alças da visualização, como no AutoCAD: clique numa das setas e depois onde ela deve ficar, ou digite um número, para definir uma quantidade ou um espaçamento. O Esc também cria a matriz. Os objetos selecionados passam a ser o primeiro item.

## Options

### ASsociative

<Keyword id="Yes" />, o padrão, cria um só objeto de matriz: as alças e a paleta Propriedades o alteram depois, e o <Command id="EXPLODE" /> o divide nos seus itens. <Keyword id="No" /> cria cópias independentes ao lado dos objetos selecionados. A resposta vale pela sessão, também para o <Command id="ARRAYPOLAR" /> e o <Command id="ARRAYPATH" />.

### COUnt

A quantidade de colunas e depois a de linhas, de 1 a 32767 cada uma.

### Spacing

A distância entre colunas e depois entre linhas; negativa, para a esquerda ou para baixo. Ou <Keyword id="Unit cell" />: os dois cantos de um retângulo cujos lados são as duas distâncias.

### COLumns

A quantidade de colunas e a distância entre elas.

### Rows

A quantidade de linhas, a distância entre elas e a elevação que cada linha sobe em relação à anterior.

### Levels

Cópias empilhadas ao longo do eixo Z do UCS: a quantidade de níveis e depois a distância entre eles, ou com <Keyword id="Total" /> a distância do primeiro nível ao último.

### eXit

Cria a matriz e encerra o comando, como o Enter.

## Missing

O ponto base; <Keyword id="Total" /> nas distâncias entre colunas e entre linhas (<Keyword id="Levels" /> tem); Expressão, que liga um valor aos parâmetros do desenho. ARRAYEDIT e ARRAYCLOSE, que editam a origem de uma matriz ou substituem os itens. Os menus das alças da matriz (quantidade de colunas, espaçamento total, ângulo do eixo…) e o Ctrl para percorrê-los, então um espaçamento total ou um ângulo do eixo não podem ser definidos por uma alça; uma alça também não escreve as suas linhas na linha de comando. Na paleta, as coordenadas X e Y do ponto base não podem ser digitadas de novo.

## Questions

### Como fazer um array retangular?

Digite <Command id="ARRAYRECT" />, que não tem alias, ou `MA` para o <Command id="ARRAY" /> e Enter na pergunta dele, já que a retangular é o padrão. Selecione os objetos e pressione Enter: a matriz é desenhada na hora, pronta para editar.

### Como definir a distância entre linhas e colunas?

Escolha <Keyword id="Spacing" /> e digite a distância entre colunas e depois entre linhas; uma negativa vai para a esquerda ou para baixo. Com <Keyword id="Unit cell" />, dois cantos dão as duas de uma vez. Ou arraste as setas da segunda coluna e da segunda linha.

### Como deixar as cópias como objetos separados?

Escolha <Keyword id="ASsociative" /> e responda <Keyword id="No" /> antes de pressionar Enter: cada cópia é um objeto próprio. Uma matriz associativa pode ser dividida nos seus itens depois com o <Command id="EXPLODE" />.

### Como fazer um array 3D?

Escolha <Keyword id="Levels" />: as linhas e colunas são copiadas para cima ao longo do eixo Z do UCS, quantos níveis você disser, à distância que você der. <Keyword id="Rows" /> também pede uma elevação, que sobe cada linha em relação à anterior.
