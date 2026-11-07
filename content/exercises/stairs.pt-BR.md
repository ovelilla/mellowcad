---
title: "Exercício de AutoCAD: escada em planta baixa"
metaTitle: "Exercício de planta baixa no AutoCAD: escada"
description: "Desenhe uma escada reta em planta baixa no AutoCAD: dez degraus com uma linha e uma matriz retangular, a seta de subida e as cotas. Grátis, passo a passo."
figure: "Uma escada reta em planta baixa, de 280 por 100 centímetros, com a seta apontando a subida."
sourceHash: "ff6e60262cd9"
---

Desenhe uma escada reta em planta baixa, em centímetros: 280 de comprimento e 100 de largura, dez degraus com piso de 28 e a seta que indica a subida. A escala das cotas do desenho já está ajustada para uma planta em centímetros, então as cotas ficam legíveis nesse tamanho. A linha de um degrau é desenhada; uma matriz retangular posiciona as outras.

## Steps

### Desenhe o contorno [#outline]

Na camada Contorno, o contorno do lance com o <Command id="RECTANG" />, de `0,0` a `280,100`.

### Desenhe o primeiro degrau [#tread]

A linha do primeiro degrau, com o <Command id="LINE" />: de `28,0`, `0,100` para cima, e Enter.

### Faça a matriz dos degraus [#array]

O <Command id="ARRAYRECT" /> copia a linha ao longo do lance: selecione-a e pressione Enter, depois escolha <Keyword command="ARRAYRECT" id="COUnt" />, `9` colunas e `1` linha, e <Keyword command="ARRAYRECT" id="Spacing" />, `28` entre as colunas e `1` entre as linhas, o que não faz diferença com uma linha só. <Keyword command="ARRAYRECT" id="eXit" /> a mantém como uma matriz associativa, que se edita depois pelas alças.

### Desenhe a seta [#arrow]

Com o <Command id="PLINE" />, comece em `14,50` e siga ao longo do lance até `226,0` a partir dali; depois <Keyword command="PLINE" id="Width" />, `10` no início e `0` no fim, e um último segmento de `24,0`: a ponta da seta. Enter encerra o comando.

### Cote o desenho [#dimensions]

Na camada Cotas, o <Command id="DIMLINEAR" /> três vezes: o comprimento embaixo, a largura à direita e um degrau, 28, em cima.
