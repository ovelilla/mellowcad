---
title: "Comando DIMALIGNED (COTAALIN) no AutoCAD"
metaTitle: "Cota alinhada no AutoCAD: DIMALIGNED (COTAALIN)"
description: "Como funciona o DIMALIGNED do AutoCAD em português, COTAALIN (atalho COA): cotar um lado inclinado com duas origens ou um objeto. Experimente grátis online."
figure: "O lado inclinado de um triângulo cotado no seu comprimento: as duas pontas e depois onde vai a linha."
sourceHash: "243f7657ed7d"
---

O DIMALIGNED, COTAALIN no AutoCAD em português, mede a distância real entre dois pontos: a linha de cota fica paralela à linha que os une, seja qual for o ângulo, enquanto o <Command id="DIMLINEAR" /> só mede em X ou em Y. Os prompts são os do <Command id="DIMLINEAR" />: a origem da primeira e da segunda linha de extensão, ou Enter e a seleção de uma linha, um arco ou um segmento de polilinha para usar as duas pontas, e depois a localização da linha de cota, de um lado ou do outro. Um círculo selecionado dá o diâmetro que passa pelo ponto onde foi selecionado. A linha de comando diz a medida, e o comando termina.

## Options

### Text

Pede o texto a escrever no lugar da medida, que ele oferece como padrão: Enter mantém a medida. No que você digita, `<>` representa a medida.

### Angle

Pede o ângulo do texto, que passa a ser desenhado nesse ângulo em vez de ao longo da linha de cota. 0 o devolve à linha.

## Missing

A opção de texto multilinha: o texto de uma cota é uma linha só, definida com <Keyword id="Text" /> na linha de comando, nunca no editor de texto. Com um ângulo definido em <Keyword id="Angle" />, o AutoCAD centraliza o texto sobre a linha de cota; aqui ele fica acima dela, como sem ângulo. Uma cota não é associativa: ela não acompanha o objeto que mede.

## Questions

### Qual é o comando DIMALIGNED no AutoCAD em português?

COTAALIN, com os aliases `COA` e `DIMALI`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_DIMALIGNED`.

### Qual a diferença entre cota linear e cota alinhada?

Num lado inclinado, o <Command id="DIMLINEAR" /> dá a largura ou a altura dele, conforme a linha de cota seja horizontal ou vertical; o COTAALIN dá o comprimento, com a linha paralela ao lado. Num lado em X ou em Y, os dois dão o mesmo número.

### Como cotar uma linha inclinada no AutoCAD?

Com o COTAALIN: pressione Enter no primeiro prompt, selecione a linha e coloque a cota do lado que quiser. Ou indique as duas pontas com o snap ao objeto Ponto final, para que as origens fiquem exatas.

### Como escrever o meu próprio texto numa cota?

Escolha <Keyword id="Text" /> antes de colocá-la e digite o texto: `<>` representa a medida, então `<> mm` a escreve seguida da unidade, e Enter sem digitar nada deixa só a medida. Depois de colocada, quem a muda é Sobrepor texto, na paleta Propriedades.
