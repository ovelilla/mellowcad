---
title: "Comando MEDIDA (MEASURE) no AutoCAD"
description: "Como funciona o MEASURE do AutoCAD em português, MEDIDA (alias ME): pontos ou blocos a cada comprimento ao longo de um objeto, a partir da ponta escolhida."
figure: "Uma polilinha de 190 medida a cada 15 a partir da ponta selecionada: doze pontos, o último a 10 da outra ponta."
sourceHash: "3975c3873eff"
---

O MEASURE, MEDIDA no AutoCAD em português, marca um objeto a cada certo comprimento. Selecione uma linha, um arco, um círculo, uma elipse, um arco elíptico, uma polilinha, uma polilinha 3D ou uma spline, e informe o comprimento, digitado ou com dois pontos: o MEDIDA põe um objeto de ponto a cada esse comprimento ao longo do objeto, até onde couber um, e encerra. Ele não mede uma distância para você nem corta o objeto. Começa pela ponta mais próxima de onde você selecionou, então selecione perto da ponta a partir da qual quer medir; o que sobra fica na outra ponta, e quando o comprimento cabe um número inteiro de vezes, a outra ponta também recebe um ponto. Um círculo começa no seu ponto de 0° e segue no sentido anti-horário, onde quer que seja selecionado; uma polilinha fechada começa no seu primeiro vértice.

Os pontos são desenhados como diz o estilo de ponto do desenho, um ponto minúsculo por padrão: escolha antes uma figura visível com o <Command id="PTYPE" /> ou com o PDMODE. Os pontos ficam sobre o objeto, na camada atual com a cor, o tipo de linha e a espessura de linha atuais; tudo é um passo que o <Command id="U" /> desfaz, e os pontos são o conjunto de seleção Anterior. Um comprimento maior que o objeto recebe <Message id="objectNotThatLong" />, e um tão curto que faria mais de 32767 pontos, <Message id="objectTooLong" />; nenhum dos dois cria nada. Qualquer outro objeto recebe <Message id="cannotMeasureObject" />. O menu suspenso Pontos das ferramentas de Desenhar também inicia o MEDIDA.

## Options

### Block

Em vez de pontos, referências de um bloco que já esteja no desenho: informe o nome, depois se cada uma se alinha com o objeto, <Keyword id="Yes" /> (o padrão) ou <Keyword id="No" />, e depois o comprimento. Alinhada, cada referência gira com o objeto no seu lugar, ao longo da linha ou tangente a um arco, seja qual for a ponta de onde a medida começa; sem alinhar, todas mantêm o X do UCS. Um nome sem bloco por trás é recusado e pedido de novo.

## Missing

Para que lado corre uma polilinha fechada selecionada depois da sua metade: aqui ela é medida para trás a partir do primeiro vértice, como o AutoCAD mede uma elipse ou uma spline fechadas, mas o que o AutoCAD faz com uma polilinha não foi verificado. Os pontos de um círculo começam sempre ao longo do X do UCS, onde o AutoCAD os começa no ângulo do snap, SNAPANG, que o MellowCAD não tem.

## Questions

### Qual é o comando de medida no AutoCAD em português?

MEDIDA, com o alias `ME`, o mesmo do inglês. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_MEASURE`.

### O MEDIDA serve para medir distâncias?

Não: ele põe pontos a um comprimento que você dá. Para medir a distância entre dois pontos, use o <Command id="DIST" />; para o comprimento de um objeto, o <Command id="LIST" /> ou o <Command id="AREA" />.

### De qual ponta o MEDIDA começa?

Da ponta mais próxima do ponto onde você selecionou o objeto. Selecione-o perto da ponta a partir da qual quer medir o primeiro comprimento.

### Por que não vejo os pontos que o MEDIDA criou?

Eles são desenhados como pontos minúsculos, o estilo de ponto padrão. Abra o <Command id="PTYPE" /> e escolha uma cruz ou um círculo, ou defina PDMODE como `3`: todos os pontos mudam de uma vez.

### Qual é a diferença entre MEDIDA e DIVIDIR?

O <Command id="DIVIDE" /> divide um objeto num número de partes iguais; o MEDIDA avança por ele num comprimento dado e deixa o que sobra na outra ponta.
