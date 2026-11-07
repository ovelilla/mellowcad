---
title: "Exercício de AutoCAD: um suporte em L"
metaTitle: "Exercício de AutoCAD 2D: um suporte em L"
description: "Desenhe um suporte em L no AutoCAD com coordenadas relativas: o contorno, uma concordância, dois furos e cotas de linha de base, passo a passo, para iniciantes."
figure: "O suporte em L, de 100 por 80, cotado a partir do canto inferior esquerdo."
sourceHash: "5c7cd5d57c92"
---

Desenhe este suporte, em milímetros: 100 de comprimento, uma base de 20 de altura e uma aba vertical de 30 de largura e 80 de altura, o canto interno arredondado com raio 10, um furo de 8 na base e um de 10 na aba vertical, cada um centrado na sua parte do L. O contorno é uma só sequência do <Command id="LINE" />, cada ponto digitado como o deslocamento a partir do último, e todas as cotas partem do canto inferior esquerdo.

## Steps

### Desenhe o contorno [#outline]

Na camada Contorno, comece o <Command id="LINE" /> em `0,0` e digite cada ponto como um passo a partir do último: `100,0`, `0,20`, `-70,0`, `0,60` e `-30,0`. <Keyword command="LINE" id="Close" /> desenha o último lado de volta ao início e encerra o comando.

### Arredonde o canto interno [#fillet]

<Command id="FILLET" />: escolha <Keyword command="FILLET" id="Radius" />, digite `10` e selecione as duas linhas que se encontram no canto interno, o topo da base e o lado da aba vertical.

### Desenhe os furos [#holes]

Dois círculos com o <Command id="CIRCLE" />, cada um pelo <Keyword command="CIRCLE" id="Diameter" />: `8` em `80,10`, na base, e `10` em `15,65`, na aba vertical.

### Cote o desenho [#dimensions]

Na camada Cotas, o <Command id="DIMLINEAR" /> de `0,0` até o furo da base, `80,10`, colocado embaixo: 80. O <Command id="DIMBASELINE" /> continua a partir da mesma primeira linha de extensão: digite a extremidade direita, `#100,0`, em que # mede a partir da origem, e depois Enter duas vezes para encerrá-lo. O mesmo subindo pelo lado esquerdo: até o furo de cima e depois até o topo, `#0,80`. O <Command id="DIMRADIUS" /> na concordância e o <Command id="DIMDIAMETER" /> em cada furo completam a cotagem.
