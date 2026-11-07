---
title: "Exercício de AutoCAD: um terreno"
metaTitle: "Exercício de AutoCAD civil: área de um terreno"
description: "Desenhe um terreno no AutoCAD pelos comprimentos e ângulos dos lados, com coordenadas polares, depois calcule a área e cote-o. Grátis, passo a passo, online."
figure: "Um terreno de cinco lados, em metros, com cada lado e um ângulo cotados."
sourceHash: "f5542a75eef7"
---

Desenhe este terreno, em metros, pelos comprimentos e direções dos lados: 40 a 0°, 30 a 80°, 35 a 155° e 25 a 230°, e depois de volta ao início. Calcule a área e o perímetro, e cote cada lado e o ângulo no segundo vértice. Coordenadas polares, um comprimento e um ângulo, desenham cada lado a partir do fim do anterior. A escala das cotas do desenho já está ajustada para metros.

## Steps

### Desenhe o contorno do terreno [#boundary]

Na camada Contorno, comece o <Command id="PLINE" /> em `0,0` e digite cada lado pelo comprimento e pelo ângulo: `40<0`, `30<80`, `35<155` e `25<230`, cada um medido a partir do último ponto. <Keyword command="PLINE" id="Close" /> desenha o quinto lado e fecha o contorno: um só objeto, que o <Command id="AREA" /> pode medir.

### Calcule a área [#area]

Execute o <Command id="AREA" />, escolha <Keyword command="AREA" id="Object" /> e selecione o contorno: a linha de comando dá a área, em metros quadrados, e o perímetro.

### Cote o desenho [#dimensions]

Na camada Cotas, execute o <Command id="DIMALIGNED" /> e pressione Enter no primeiro prompt: ele então pede um objeto, e um clique num lado cota esse lado, paralelo a ele. Coloque cada cota do lado de fora do terreno. O <Command id="DIMANGULAR" /> nos dois lados que se encontram em `40,0` dá o ângulo entre eles, 100°.
