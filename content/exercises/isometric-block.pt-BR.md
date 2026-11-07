---
title: "Exercício de AutoCAD isométrico: um bloco escalonado"
metaTitle: "Exercício de desenho isométrico no AutoCAD"
description: "Desenhe um bloco escalonado em isométrico no AutoCAD com linhas e coordenadas polares nos eixos de 30°, 90° e 150°, e cote-o. Grátis, passo a passo, online."
figure: "Um bloco escalonado em isométrico, de 60 de comprimento, 40 de profundidade e 40 de altura, com as medidas cotadas ao longo das arestas."
sourceHash: "c1039d3b5e97"
---

Desenhe este bloco escalonado em isométrico, em milímetros: 60 de comprimento, 40 de profundidade e 40 de altura, com um degrau de 20 de profundidade e 20 de altura ao longo da frente. Cada aresta segue um dos eixos isométricos: 30° e 210° para o comprimento, 150° e 330° para a profundidade, 90° e 270° para a altura. O MellowCAD ainda não tem o desenho isométrico do AutoCAD, com o snap isométrico e os círculos isométricos, então as arestas são linhas digitadas com coordenadas polares, um comprimento e um ângulo.

## Steps

### Desenhe a frente do degrau [#front]

Na camada Contorno, comece o <Command id="LINE" /> em `0,0`, o canto inferior da frente: `60<30`, `20<90`, `60<210` e depois <Keyword command="LINE" id="Close" />.

### Desenhe a lateral [#side]

De novo a partir de `0,0`, a lateral esquerda: `40<150`, `40<90`, `20<330`, `20<270` e `20<330`. Enter encerra a linha na aresta da frente do degrau.

### Desenhe o topo [#top]

O resto começa em cantos já desenhados: digite `_END`, o snap ao objeto Ponto final para um só ponto, e clique no canto. A partir do canto superior direito da frente: `20<150`, `20<90`, `20<150` e `60<210`. Depois duas linhas de `60<210`, uma do pé do espelho do degrau e outra do topo dele.

### Cote o desenho [#dimensions]

Na camada Cotas, o <Command id="DIMALIGNED" /> ao longo das arestas, cada cota ao lado da sua: 60 e 40 embaixo, 40 subindo pela esquerda, 20 subindo pela direita.
