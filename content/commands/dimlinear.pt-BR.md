---
title: "Cotas no AutoCAD: comando COTALINEAR (DIMLINEAR)"
metaTitle: "Cota linear no AutoCAD: COTALINEAR (DIMLINEAR)"
description: "Como cotar no AutoCAD em português com o COTALINEAR (DIMLINEAR, atalho CLI): duas origens ou um objeto e a linha, horizontal ou vertical. Experimente grátis."
figure: "Um retângulo cotado duas vezes: o lado de cima pelos dois cantos, o da direita com Enter e selecionando-o."
sourceHash: "e48a0a6f18c9"
---

O DIMLINEAR, COTALINEAR no AutoCAD em português, mede a distância entre dois pontos em X ou em Y e a desenha como uma cota: duas linhas de extensão, uma linha de cota com as suas setas e a medida acima dela. Você especifica a origem da primeira e da segunda linha de extensão e depois a localização da linha de cota, e onde você a coloca escolhe a direção, como no AutoCAD: acima ou abaixo dos dois pontos, ele mede na horizontal; ao lado deles, na vertical. Se você pressionar Enter no primeiro prompt, seleciona uma linha, um arco, um segmento de polilinha ou um círculo: as duas pontas dele, ou o diâmetro do círculo, são as origens. A linha de comando diz então a medida, e o comando termina.

A cota é desenhada no estilo de cota atual, ISO-25 num desenho novo: vírgula decimal e sem zeros à direita, como nos desenhos métricos do AutoCAD. <Command id="DIMHORIZONTAL" />, <Command id="DIMVERTICAL" /> e <Command id="DIMROTATED" />, só digitados, são o COTALINEAR com a direção fixa.

## Options

### Text

Pede o texto a escrever no lugar da medida, que ele oferece como padrão: Enter mantém a medida. No que você digita, `<>` representa a medida, então `<> mm` a escreve seguida da unidade.

### Angle

Pede o ângulo do texto, que passa a ser desenhado nesse ângulo em vez de ao longo da linha de cota. 0 o devolve à linha.

### Horizontal

Mede em X onde quer que você coloque a linha de cota, que fica horizontal; o prompt então oferece só <Keyword id="Text" /> e <Keyword id="Angle" />.

### Vertical

Mede em Y onde quer que você coloque a linha de cota, que fica vertical.

### Rotated

Pede o ângulo da linha de cota, `0` por padrão, e mede ao longo dele a distância entre as origens. Num lado inclinado, o ângulo do próprio lado dá o seu comprimento, como faz o <Command id="DIMALIGNED" />.

## Missing

A opção de texto multilinha: o texto de uma cota é uma linha só, definida com <Keyword id="Text" /> na linha de comando, nunca no editor de texto. Com um ângulo definido em <Keyword id="Angle" />, o AutoCAD centraliza o texto sobre a linha de cota; aqui ele fica acima dela, como sem ângulo. Uma cota não é associativa: ela não acompanha o objeto que mede.

## Questions

### Qual é o comando DIMLINEAR no AutoCAD em português?

COTALINEAR, com os aliases `CLI` e `DIMLIN`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_DIMLINEAR`.

### Quais são os comandos de cota do AutoCAD?

<Command id="DIMLINEAR" /> para distâncias horizontais e verticais, <Command id="DIMALIGNED" /> para uma distância ao longo de um lado inclinado, <Command id="DIMRADIUS" /> e <Command id="DIMDIAMETER" /> para arcos e círculos, <Command id="DIMANGULAR" /> para ângulos, <Command id="DIMCONTINUE" /> e <Command id="DIMBASELINE" /> para cadeias de cotas, <Command id="DIMSPACE" /> para igualar o espaçamento entre elas e <Command id="DIMSTYLE" /> para a aparência. O DIM do AutoCAD, que faz qualquer tipo de cota num só prompt, e o QDIM, que cota vários objetos de uma vez (os nomes em inglês), ainda não estão no MellowCAD.

### Por que a cota não acompanha o objeto quando eu o altero?

Porque as cotas do MellowCAD ainda não são associativas, como diz <Message id="nonAssociativeDimension" />: uma cota guarda os pontos que recebeu. Estique os dois juntos: pegue a ponta que você move e a origem da cota que está nela numa janela de intersecção do <Command id="STRETCH" />, e a medida é calculada de novo; ou arraste a alça da origem até o novo lugar.

### Como mudar o tamanho do texto e das setas da cota?

No estilo de cota, como no AutoCAD: o <Command id="DIMSTYLE" /> (`EC`) abre os estilos de cota, aqui na paleta Estilos, onde o AutoCAD tem o Gerenciador de estilos de cota. Ali se definem a altura do texto, o tamanho da seta, a escala global e as casas decimais do estilo atual, e todas as cotas desse estilo acompanham.
