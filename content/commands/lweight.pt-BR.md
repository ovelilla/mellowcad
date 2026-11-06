---
title: "Espessura de linha no AutoCAD: ESPLINHA (LWEIGHT)"
metaTitle: "Espessura de linha no AutoCAD: comando ESPLINHA"
description: "Como funciona o LWEIGHT do AutoCAD em português, ESPLINHA: a espessura de linha dos novos objetos em milímetros, os 24 valores padrão e vê-la na tela."
figure: "Uma placa contornada a 0.70 mm e depois 0.1 digitado para o furo, arredondado para 0.09 mm: as duas espessuras como a tela as mostra."
sourceHash: "154784b2b402"
---

O LWEIGHT, ESPLINHA no AutoCAD em português, define a espessura de linha com que os novos objetos são desenhados, em milímetros. O AutoCAD abre a caixa Configurações de espessura de linha; o MellowCAD ainda não a tem, então o ESPLINHA executa a forma de linha de comando que o AutoCAD também tem, <Command id="-LWEIGHT" />. Ele mostra a espessura de linha atual, `BYLAYER` no início, e pede uma nova: um dos 24 valores padrão do AutoCAD, de 0.00 a 2.11 mm. Qualquer outro valor vai para o padrão mais próximo, com um aviso, e um negativo é recusado com <Message id="invalidLineweightNumber" />. Enter mantém a espessura atual. Cada mudança é um passo que o <Command id="U" /> desfaz.

Aqui as espessuras de linha aparecem na tela desde o início: o AutoCAD só as mostra com o botão Espessura de linha da barra de status (LWDISPLAY) ligado, mas sem layouts nem plotagem no MellowCAD, a tela é o único lugar onde elas podem aparecer. O botão as esconde e as mostra. Uma polilinha com largura mostra em planta a sua largura, não a sua espessura de linha.

## Options

### ?

Lista os valores aceitos, PorCamada e as 24 espessuras padrão, e pergunta de novo.

### BYLAYER

Os novos objetos usam a espessura de linha da sua camada, como no início.

## Missing

PorBloco e Padrão (LWDEFAULT), as espessuras em polegadas, a caixa Configurações de espessura de linha e o item Configurações de espessura de linha… da lista suspensa.

## Questions

### Qual é o comando LWEIGHT no AutoCAD em português?

ESPLINHA, com o atalho `ESL`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_LWEIGHT`.

### Por que a espessura de linha não aparece no AutoCAD?

No AutoCAD, as espessuras só aparecem na tela com o botão Espessura de linha da barra de status ligado (LWDISPLAY 1), que começa desligado. Aqui ele começa ligado. As espessuras finas são todas desenhadas como a linha mais fina da tela, então a diferença aparece nas grossas; e um objeto com espessura PorCamada usa a da sua camada.

### Como mudar a espessura de linha de um objeto já desenhado?

Selecione-o e escolha a espessura na linha Espessura de linha da paleta Propriedades, ou na espessura da camada dele no Gerenciador de propriedades de camadas quando o objeto é PorCamada. O ESPLINHA só define a espessura do que for desenhado depois.

### Quais espessuras de linha o AutoCAD tem?

24 valores fixos em milímetros: 0.00, 0.05, 0.09, 0.13, 0.15, 0.18, 0.20, 0.25, 0.30, 0.35, 0.40, 0.50, 0.53, 0.60, 0.70, 0.80, 0.90, 1.00, 1.06, 1.20, 1.40, 1.58, 2.00 e 2.11. Se você digitar outro, 0.45 por exemplo, o ESPLINHA usa o mais próximo, o mais fino em caso de empate.
