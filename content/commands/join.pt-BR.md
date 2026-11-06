---
title: "Comando JOIN (UNIR) no AutoCAD"
metaTitle: "Comando JOIN (UNIR) no AutoCAD: unir linhas"
description: "Como funciona o JOIN do AutoCAD em português, UNIR (alias UNE): linhas e arcos que se tocam numa polilinha, linhas alinhadas numa só, arcos num círculo."
figure: "Três linhas unidas numa única polilinha, que um só clique do DESLOCAMENTO depois acompanha inteira."
sourceHash: "c4f26ede4174"
---

O JOIN, UNIR no AutoCAD em português, faz um único objeto de vários. Selecione-os, quantos quiser, e pressione Enter: as linhas e os arcos que se tocam pelas pontas viram uma polilinha, unida a uma polilinha entre eles se houver; as linhas sobre uma mesma reta, uma só linha, por cima de qualquer vão; os arcos de um mesmo círculo, um só arco, e quando eles o fecham, o UNIR pergunta se o converte em círculo, <Keyword id="Yes" /> por padrão, ou o mantém como arco com <Keyword id="No" />. Os arcos elípticos de uma mesma elipse viram um só arco, e uma spline ou um arco elíptico entre curvas que se tocam fazem uma spline. Depois ele diz o que fez e quantos objetos deixou de fora. Uma polilinha só se une pelas pontas, e uma fechada não se une a nada. A união é um passo que o Desfazer reverte.

## Options

### cLose

Quando a origem é um arco elíptico, selecionado sozinho: completa a sua elipse.

## Missing

O passo próprio do AutoCAD quando a origem é uma única linha, arco ou polilinha, selecionada sozinha (o prompt que pede as linhas a unir à origem): aqui ele não une nada. Um objeto fechado selecionado sozinho, que o AutoCAD pede de novo. As hélices, os objetos num plano inclinado ou de cabeça para baixo, e as linhas que não estão num mesmo plano, que o AutoCAD une numa polilinha 3D ou achata numa polilinha.

## Questions

### Qual é o comando JOIN no AutoCAD em português?

UNIR, com o alias `UNE`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_JOIN`.

### Como unir linhas numa polilinha no AutoCAD?

Execute o UNIR, selecione as linhas, com uma janela se quiser, e pressione Enter: as que se tocam pelas pontas viram uma única polilinha.

### Por que o JOIN não funciona?

Os objetos precisam se tocar exatamente, ponta com ponta e num mesmo plano: um vão ou um cruzamento os deixa de fora, e o UNIR diz quantos descartou. Só as linhas alinhadas, os arcos de um mesmo círculo e os de uma mesma elipse se unem por cima de um vão. Uma polilinha fechada não se une a nada.

### Como unir arcos num círculo?

Selecione arcos de um mesmo círculo que o cubram inteiro e pressione Enter: o UNIR pergunta se os converte em círculo, e <Keyword id="Yes" />, o padrão, converte.
