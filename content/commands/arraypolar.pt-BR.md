---
title: "Comando ARRAYPOLAR (MATRIZPOLAR) no AutoCAD"
metaTitle: "Array polar no AutoCAD: comando ARRAYPOLAR"
description: "Como funciona o ARRAYPOLAR do AutoCAD em português, MATRIZPOLAR, prompt a prompt: o centro, os itens, o ângulo de preenchimento e a rotação. Experimente grátis."
figure: "Um furo de um flange em matriz em volta do centro do flange: 8 itens numa volta completa."
sourceHash: "efed541dea7f"
---

O ARRAYPOLAR, MATRIZPOLAR no AutoCAD em português, copia uma seleção em volta de um ponto central, como um só objeto de matriz. Ele pede os objetos, diz o tipo e se a matriz é associativa, pede o ponto central e mostra a matriz na hora: 6 itens numa volta completa, cada um girado conforme dá a volta. Depois, um só prompt a edita ao vivo até o Enter criá-la, com as opções ou com as alças da visualização, como no AutoCAD. Os objetos selecionados passam a ser o primeiro item.

## Options

### ASsociative

<Keyword id="Yes" />, o padrão, cria um só objeto de matriz, que as alças e a paleta Propriedades alteram depois; <Keyword id="No" /> cria cópias independentes ao lado dos objetos selecionados. A resposta vale pela sessão, também para o <Command id="ARRAYRECT" /> e o <Command id="ARRAYPATH" />.

### Items

A quantidade de itens, de 1 a 32767; o ângulo que ocupam é mantido.

### Angle between

O ângulo de um item ao seguinte. O ângulo de preenchimento passa a ser esse número de passos, no mesmo sentido, e uma volta completa quando chegam a 360°.

### Fill angle

O ângulo que os itens ocupam, positivo no sentido anti-horário e negativo no horário; a quantidade de itens é mantida. Numa volta completa, os itens ficam a uma volta dividida pela quantidade; em menos, o último cai no fim do ângulo.

### ROTate items

<Keyword id="Yes" />, o padrão, gira cada item conforme ele contorna o centro; <Keyword id="No" /> só o move, então todos ficam orientados como o primeiro.

### eXit

Cria a matriz e encerra o comando, como o Enter.

## Missing

O ponto base; o eixo de rotação, para uma matriz em volta de um eixo no espaço; <Keyword id="ROWs" /> e Níveis, para anéis de itens e cópias empilhadas em Z; Expressão, que liga um valor aos parâmetros do desenho. Os menus das alças da matriz (raio, quantidade de itens, ângulo de preenchimento…) e o Ctrl para percorrê-los.

## Questions

### Como fazer um array polar?

Digite <Command id="ARRAYPOLAR" />, selecione os objetos, pressione Enter e indique o ponto central; ou digite `MA` para o <Command id="ARRAY" /> e escolha <Keyword command="ARRAY" id="POlar" /> depois dos objetos. Então escolha <Keyword id="Items" /> para definir quantos são, e pressione Enter para criá-la.

### Como fazer um array em só uma parte do círculo?

Escolha <Keyword id="Fill angle" /> e digite o ângulo: 180 distribui os itens em meio círculo no sentido anti-horário, e -180 no horário. A quantidade de itens é mantida, o primeiro e o último nas pontas do ângulo.

### Como evitar que os itens girem?

Escolha <Keyword id="ROTate items" /> e responda <Keyword id="No" />: cada item é movido em volta do centro sem girar.

### Como mudar o raio de um array polar?

Selecione a matriz e arraste a alça quadrada do ponto base para perto ou para longe do centro: a distância ao centro é o novo raio. Ou digite de novo o Raio na paleta Propriedades.
