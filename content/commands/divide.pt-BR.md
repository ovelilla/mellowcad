---
title: "Dividir em partes iguais no AutoCAD: comando DIVIDIR (DIVIDE)"
metaTitle: "Dividir em partes iguais no AutoCAD: DIVIDIR"
description: "Como funciona o DIVIDE do AutoCAD em português, DIVIDIR (alias DIV): pontos ou blocos em partes iguais de uma linha, um círculo, um arco ou uma polilinha."
figure: "PDMODE 3 para que os pontos apareçam como cruzes; depois uma linha dividida em 5 e um círculo em 6, que começa no seu ponto de 0°."
sourceHash: "6f3c52078466"
---

O DIVIDE, DIVIDIR no AutoCAD em português, marca um objeto em partes iguais. Selecione uma linha, um arco, um círculo, uma elipse, um arco elíptico, uma polilinha, uma polilinha 3D ou uma spline, clicando nele ou digitando um ponto sobre ele, e informe o número de segmentos, de 2 a 32767: o DIVIDIR põe um objeto de ponto em cada divisão e encerra. Ele não corta o objeto, que continua inteiro. Um objeto aberto dividido em 5 recebe 4 pontos, a partir do seu início; um fechado recebe 5, o início entre eles: um círculo a partir do seu ponto de 0°, no sentido anti-horário, e uma polilinha fechada a partir do seu primeiro vértice. Os pontos ficam sobre o objeto, na sua altura, na camada atual com a cor, o tipo de linha e a espessura de linha atuais.

Os pontos são desenhados como diz o estilo de ponto do desenho, e o padrão é um ponto minúsculo que se esconde sob a linha: escolha antes uma figura visível com o <Command id="PTYPE" /> ou com o PDMODE. A divisão inteira é um passo que o <Command id="U" /> desfaz, e os seus pontos são o conjunto de seleção Anterior, prontos para apagar ou mover. Qualquer outro objeto, um texto ou uma referência de bloco, recebe <Message id="cannotDivideObject" />, e o comando termina. O menu suspenso Pontos das ferramentas de Desenhar também inicia o DIVIDIR.

## Options

### Block

Em vez de pontos, referências de um bloco que já esteja no desenho: informe o nome, depois se cada uma se alinha com o objeto, <Keyword id="Yes" /> (o padrão) ou <Keyword id="No" />, e depois o número de segmentos. Alinhada, cada referência gira com o objeto no seu lugar, ao longo da linha ou tangente a um arco; sem alinhar, todas mantêm o X do UCS. Um nome sem bloco por trás é recusado e pedido de novo. Os atributos variáveis do bloco ficam de fora, como no AutoCAD.

## Missing

Uma hélice, que o MellowCAD ainda não desenha. Os blocos ao longo de um objeto que não está no plano do UCS são postos no plano do UCS, onde a ajuda do AutoCAD os põe no plano do próprio objeto. Os pontos de um círculo começam sempre ao longo do X do UCS, onde o AutoCAD os começa no ângulo do snap, SNAPANG, que o MellowCAD não tem.

## Questions

### Qual é o comando do AutoCAD para dividir em partes iguais?

DIVIDE em inglês, DIVIDIR no AutoCAD em português, com o alias `DIV` nos dois. Digite `DIV` e pressione Enter ou a barra de espaço; `_DIVIDE` funciona em qualquer idioma do AutoCAD.

### Por que o comando DIVIDIR não funciona?

Provavelmente funciona: os pontos estão lá, desenhados como pontos minúsculos sobre a linha. Abra o <Command id="PTYPE" /> (`DDPTYPE`) e escolha uma cruz ou um círculo, ou digite PDMODE e `3`: todos os pontos do desenho mudam de uma vez. Para pegá-los, use o snap ao objeto Ponto, `PON`.

### Como dividir uma polilinha em partes iguais?

Execute o DIVIDIR, selecione a polilinha e digite o número de partes, `5` para cinco. Uma polilinha aberta recebe os pontos entre as partes; uma fechada, um ponto a mais no seu primeiro vértice. O snap Ponto os encontra.

### Como dividir um círculo em partes iguais?

Do mesmo jeito: selecione o círculo e digite o número de partes. Um objeto fechado recebe tantos pontos quanto partes, então 6 dá seis pontos, o primeiro no ponto de 0° do círculo e depois no sentido anti-horário.

### Como quebrar uma linha em pedaços separados?

O DIVIDIR só marca os lugares. Para cortar a linha neles, use o <Command id="BREAK" />, ou o <Command id="BREAKATPOINT" /> em cada ponto, pegando-o com o snap Ponto.
