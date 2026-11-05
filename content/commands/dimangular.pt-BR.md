---
title: "Comando DIMANGULAR (COTAANG) no AutoCAD"
metaTitle: "Cota angular no AutoCAD: DIMANGULAR (COTAANG)"
description: "Como cotar um ângulo com o DIMANGULAR do AutoCAD, COTAANG em português (atalho CANG): duas linhas, um arco, um círculo ou três pontos. Experimente grátis."
figure: "Duas linhas que se encontram a 30 graus: cada linha selecionada e depois o arco de cota colocado entre elas."
sourceHash: "30943abd60f6"
---

O DIMANGULAR, COTAANG no AutoCAD em português, cota um ângulo com um arco como linha de cota. O que você seleciona primeiro decide o resto, como no AutoCAD: uma linha pede uma segunda linha, também dois segmentos de uma mesma polilinha; um arco é medido de ponta a ponta em torno do centro; um círculo, do ponto onde você o selecionou até um segundo ponto que você especifica; e Enter pede, em vez disso, o vértice do ângulo e depois os dois pontos finais. Em seguida você coloca o arco, e onde o coloca escolhe o ângulo medido: entre duas linhas, o dos quatro setores que o contém; nos outros casos, o ângulo ou, do outro lado dos seus lados, o ângulo maior que 180°. A linha de comando diz a medida em graus, e o comando termina.

## Options

### Text

Pede o texto a escrever no lugar da medida, que ele oferece como padrão: Enter mantém a medida. No que você digita, `<>` representa a medida.

### Angle

Pede o ângulo do texto, que passa a ser desenhado nesse ângulo em vez de ao longo do arco de cota. 0 o devolve ao arco.

## Missing

A opção de texto multilinha: o texto de uma cota é uma linha só, definida com <Keyword id="Text" /> na linha de comando. Quadrante, que prende a cota a um setor para que o texto possa ir fora dele. Unidades angulares que não sejam graus decimais (DIMAUNIT). Uma cota angular não pode ser encadeada nem espaçada: <Command id="DIMCONTINUE" />, <Command id="DIMBASELINE" /> e <Command id="DIMSPACE" /> só aceitam cotas lineares e alinhadas. Uma linha ou um arco dentro de uma referência de bloco não pode ser selecionado. Entre duas linhas, a cota guarda os pontos onde o arco dela as cruzava, não as linhas: movido depois, o arco mantém as linhas de extensão a partir dali, enquanto o AutoCAD mede de novo sobre as linhas. Uma cota não é associativa: ela não acompanha os objetos que mede.

## Questions

### Qual é o comando DIMANGULAR no AutoCAD em português?

COTAANG, com os aliases `CANG` e `DIMANG`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_DIMANGULAR`.

### Como cotar um ângulo maior que 180 graus?

Pressione Enter no primeiro prompt, especifique o vértice e os dois pontos finais e coloque o arco fora do ângulo entre eles: ele mede o ângulo maior, 360° menos o outro. Com um arco ou um círculo funciona do mesmo jeito. Entre duas linhas, o ângulo é sempre menor que 180°.

### Como cotar o ângulo de um arco?

Selecione o arco no primeiro prompt: o centro dele é o vértice e as pontas, as origens das linhas de extensão, então a próxima pergunta já é onde colocar a cota.

### Por que o COTAANG diz que as linhas são paralelas?

Duas linhas paralelas, ou a mesma linha selecionada duas vezes, não formam ângulo nenhum: <Message id="dimLinesParallel" />, e o comando termina.

### Como mudar as casas decimais de uma cota angular?

No estilo de cota: o <Command id="DIMSTYLE" /> (`EC`) o abre na paleta Estilos, onde quem as define é a precisão angular de Unidades primárias, 0 no ISO-25. Todas as cotas angulares desse estilo acompanham.
