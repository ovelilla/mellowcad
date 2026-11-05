---
title: "Cota contínua no AutoCAD: COTASERIE (DIMCONTINUE)"
metaTitle: "Comando cota contínua no AutoCAD: COTASERIE"
description: "Como funciona o DIMCONTINUE do AutoCAD em português, COTASERIE (atalho CSE): cotas em série a partir da última, Selecionar e Desfazer. Experimente grátis."
figure: "Um perfil em degraus cotado 30 e continuado 40 e 30 na mesma linha: duas origens e depois Enter duas vezes."
sourceHash: "11fa474694fd"
---

O DIMCONTINUE, COTASERIE no AutoCAD em português, desenha uma série de cotas uma depois da outra: cada uma começa na segunda linha de extensão da anterior e mede até o próximo ponto que você especifica, na mesma linha de cota. Ele continua a última cota linear ou alinhada feita desde que o desenho foi aberto, por isso costuma vir depois do <Command id="DIMLINEAR" /> ou do <Command id="DIMALIGNED" />; sem nenhuma, pergunta qual continuar. A linha de comando diz cada medida assim que ela é feita. Enter no prompt da origem escolhe <Keyword id="Select" />, e Enter ali encerra o comando, como Esc.

Como no AutoCAD, cada cota nova mede na direção da sua base e recebe o estilo de cota e a camada da base, com a cor, o tipo de linha e a espessura de linha atuais.

## Options

### Select

Pede a cota a partir da qual continuar: selecione uma linear ou alinhada perto da linha de extensão de onde seguir. Um ponto digitado ali também seleciona. Uma cota de raio ou de diâmetro é recusada com <Message id="associativeDimensionRequired" />, e a pergunta volta.

### Undo

Desfaz a última cota da série e segue a partir da anterior, tantas vezes quantas cotas houver. Quando não resta nenhuma, responde <Message id="commandCompletelyUndone" /> e o prompt continua.

## Missing

Uma cota não é associativa: a série não acompanha os objetos que mede. Uma cota angular não pode ser continuada: o AutoCAD continua a que foi feita por último ou a selecionada; aqui, se for a última, o comando pede uma cota, e se for selecionada, é recusada como uma de raio. As cotas de coordenada ainda não existem.

## Questions

### Qual é o comando DIMCONTINUE no AutoCAD em português?

COTASERIE, com os aliases `CSE` e `DIMCONT`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_DIMCONTINUE`.

### Qual a diferença entre cota contínua e cota de linha de base?

O COTASERIE põe as cotas uma depois da outra numa linha, cada uma a partir de onde a anterior terminou. O <Command id="DIMBASELINE" /> mede todas a partir da mesma linha de extensão, cada uma numa linha mais afastada.

### Como continuar a partir de uma cota que não é a última?

Pressione Enter no primeiro prompt, ou escolha <Keyword id="Select" />, e selecione a cota perto da linha de extensão de onde seguir: a série cresce a partir dali.

### Por que o COTASERIE pede para selecionar uma cota?

Porque não há cota para continuar: nenhuma cota linear ou alinhada foi feita desde que o desenho foi aberto, como no AutoCAD ao abrir um, ou a última feita é angular. Selecione a cota a partir da qual continuar.
