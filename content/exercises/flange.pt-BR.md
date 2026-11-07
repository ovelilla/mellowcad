---
title: "Exercício de AutoCAD: um flange"
metaTitle: "Desenho para praticar no AutoCAD: flange"
description: "Desenhe um flange no AutoCAD: furo com rasgo de chaveta aparado, oito furos em matriz polar, linhas de centro e diâmetros, passo a passo. Grátis online."
figure: "O flange, de 140 de diâmetro, com o rasgo de chaveta, os oito furos e os diâmetros."
sourceHash: "32f94d57ae25"
---

Desenhe este flange, em milímetros: 140 de diâmetro, um furo central de 60 com um rasgo de chaveta de 16 de largura cujo topo fica a 36 do centro, oito furos de 14 num círculo de furação de 110, e as linhas de centro. O rasgo de chaveta é um retângulo aparado no furo central; os furos são um círculo e uma matriz polar.

## Steps

### Desenhe os círculos [#circles]

Na camada Contorno, dois círculos em `0,0`, cada um pelo <Keyword command="CIRCLE" id="Diameter" />: `140` e `60`.

### Abra o rasgo de chaveta [#keyway]

O <Command id="RECTANG" /> de `-8,20` até `16,16` a partir dali: ele cruza o furo central. O <Command id="TRIM" /> apara um objeto onde os outros o cruzam: selecione o arco do furo entre os lados do retângulo e depois o lado de baixo do retângulo, dentro do furo. O que sobra é o rasgo de chaveta, com os dois lados e o topo.

### Faça a matriz dos furos [#holes]

Um furo no círculo de furação: um círculo em `55<22.5`, a 55 da origem e a 22,5°, com <Keyword command="CIRCLE" id="Diameter" /> de `14`. <Command id="ARRAYPOLAR" />: selecione-o, pressione Enter e indique o centro, `0,0`; <Keyword command="ARRAYPOLAR" id="ASsociative" /> e <Keyword command="ARRAYPOLAR" id="No" /> deixam oito círculos independentes, que uma cota pode selecionar, e <Keyword command="ARRAYPOLAR" id="Items" />, `8`, os distribui pela volta inteira. Depois, na camada Linhas de centro, o círculo de furação em `0,0`, com diâmetro `110`.

### Desenhe as linhas de centro [#centreLines]

Ainda na camada Linhas de centro, duas linhas com o <Command id="LINE" /> pelo centro, de 156 de comprimento: de `-78,0`, `156,0` na horizontal; de `0,-78`, `0,156` para cima.

### Cote o desenho [#dimensions]

Na camada Cotas, o <Command id="DIMDIAMETER" /> no furo central, num furo, no círculo de furação e no contorno, cada um selecionado onde nenhuma cota o cruza ainda, e depois o <Command id="DIMLINEAR" /> ao longo do topo do rasgo de chaveta: 16.
