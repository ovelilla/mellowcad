---
title: "Exercício de AutoCAD: mesa redonda com cadeiras"
metaTitle: "Projeto para treinar no AutoCAD: mesa e cadeiras"
description: "Desenhe uma mesa redonda com seis cadeiras no AutoCAD: uma cadeira e uma matriz polar em volta do centro da mesa, e as cotas, passo a passo. Grátis online."
figure: "Uma mesa redonda de 120 com seis cadeiras, em planta, cotada em centímetros."
sourceHash: "1e307bf5e17a"
---

Desenhe uma mesa redonda de 120 com seis cadeiras, em centímetros: cada cadeira com um assento de 44 por 40, de cantos arredondados com raio 4, e um encosto de 8 de profundidade, com a frente a 8 da borda da mesa. Desenhe uma cadeira acima da mesa e deixe uma matriz polar posicionar as seis. A escala das cotas do desenho já está ajustada para centímetros.

## Steps

### Desenhe a mesa [#table]

Na camada Contorno, o <Command id="CIRCLE" /> em `0,0`, com <Keyword command="CIRCLE" id="Diameter" /> `120`.

### Desenhe uma cadeira [#chair]

O assento, acima da mesa: o <Command id="RECTANG" /> com <Keyword command="RECTANG" id="Fillet" /> de `4`, de `-22,68` até `44,40` a partir dali. Depois o encosto, com a concordância de volta a `0`, de `-22,108` até `44,8` a partir dali. O <Command id="RECTANG" /> mantém o raio de concordância até você mudá-lo.

### Faça a matriz das cadeiras [#array]

<Command id="ARRAYPOLAR" />: selecione o assento e o encosto, pressione Enter, indique o centro da mesa, `0,0`, e depois <Keyword command="ARRAYPOLAR" id="Items" />, `6`. Cada cadeira gira ao ser posicionada, então as seis ficam de frente para a mesa.

### Cote o desenho [#dimensions]

Na camada Cotas, o <Command id="DIMDIAMETER" /> na mesa, colocado dentro dela, e o <Command id="DIMLINEAR" /> para a largura da cadeira de cima, 44, e para a profundidade dela com o encosto, 48.
