---
title: "Exercício de AutoCAD: uma junta"
metaTitle: "Exercício de AutoCAD para iniciantes: junta"
description: "Desenhe uma junta no AutoCAD: placa arredondada, furo central, quatro furos copiados de um, linhas de centro e cotas, passo a passo. Pratique grátis online."
figure: "A junta, de 120 por 80, cotada."
sourceHash: "dc5c0e2b45b8"
---

Desenhe esta junta, em milímetros: uma placa de 120 por 80 com os cantos arredondados, de raio 10, um furo central de 40 e quatro furos de 10 com os centros a 12 das bordas, além das linhas de centro do furo central e das cotas. Tudo é digitado: o primeiro ponto de um comando fica nas coordenadas que você digita, e cada ponto seguinte é medido a partir do último. O contorno, as linhas de centro e as cotas vão cada um na sua própria camada.

## Steps

### Desenhe o contorno [#outline]

No controle de camada, torne atual a camada Contorno. O <Command id="RECTANG" /> desenha a placa de uma vez: escolha <Keyword command="RECTANG" id="Fillet" /> e digite o raio, `10`, depois o primeiro canto, `0,0`, e o outro canto, `120,80`, medido a partir do primeiro.

### Desenhe o furo central [#bore]

Com o <Command id="CIRCLE" />, dê o centro no meio da placa, `60,40`, escolha <Keyword command="CIRCLE" id="Diameter" /> e digite `40`.

### Copie os furos [#holes]

Desenhe um furo, um círculo em `12,12` com <Keyword command="CIRCLE" id="Diameter" /> de `10`, e copie-o com o <Command id="COPY" />: selecione o círculo, pressione Enter, use o centro dele, `12,12`, como ponto base e digite onde fica cada cópia a partir dali: `96,0`, depois `96,56` e depois `0,56`. Enter encerra as cópias.

### Desenhe as linhas de centro [#centreLines]

Torne atual a camada Linhas de centro. Duas linhas com o <Command id="LINE" /> se cruzam no centro do furo central e passam 6 além da borda dele: de `60,14`, `0,52` para cima; de `34,40`, `52,0` na horizontal. Enter encerra cada uma.

### Cote o desenho [#dimensions]

Torne atual a camada Cotas. O <Command id="DIMLINEAR" /> pede dois pontos e depois onde fica a linha de cota: o comprimento, de `0,10` até `120,0` a partir dele, colocado embaixo; a altura, à direita; o espaçamento entre os furos, 96 e 56. Um ponto digitado nos prompts dele não toca nenhum objeto, então cada uma dessas cotas é criada não associativa, como a linha de comando avisa. Com o <Command id="DIMDIAMETER" />, selecione um círculo e posicione o diâmetro dele: o do furo central e depois o de um dos furos.
