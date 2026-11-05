---
title: "Comando DIMBASELINE (COTALINBASE) no AutoCAD"
metaTitle: "Cota de linha de base no AutoCAD: COTALINBASE"
description: "Como funciona o DIMBASELINE do AutoCAD em português, COTALINBASE (atalho CLB): cotas a partir de uma mesma base e o espaçamento. Experimente grátis."
figure: "Um perfil em degraus cotado 30 a partir do lado esquerdo, e depois 70 e 100 a partir do mesmo lado, cada uma numa linha mais afastada."
sourceHash: "cd7902f90b59"
---

O DIMBASELINE, COTALINBASE no AutoCAD em português, desenha cotas que medem todas a partir de uma mesma linha de extensão, a base: cada uma vai da primeira linha de extensão da última cota até o próximo ponto que você especifica, com a linha de cota um espaçamento mais afastada. Ele parte da última cota linear ou alinhada feita desde que o desenho foi aberto, por isso costuma vir depois do <Command id="DIMLINEAR" /> ou do <Command id="DIMALIGNED" />; sem nenhuma, pergunta de qual partir. A linha de comando diz cada medida assim que ela é feita. Enter no prompt da origem escolhe <Keyword id="Select" />, e Enter ali encerra o comando, como Esc.

O espaçamento é o espaçamento da linha de base do estilo de cota atual, 3,75 no ISO-25, vezes a escala global da base. Como no AutoCAD, cada cota nova mede na direção da sua base e recebe o estilo de cota e a camada da base, com a cor, o tipo de linha e a espessura de linha atuais.

## Options

### Select

Pede a cota de base: selecione uma linear ou alinhada perto da linha de extensão de onde medir. Um ponto digitado ali também seleciona. Uma cota de raio ou de diâmetro é recusada com <Message id="associativeDimensionRequired" />, e a pergunta volta.

### Undo

Desfaz a última cota feita e segue a partir da anterior, tantas vezes quantas cotas houver. Quando não resta nenhuma, responde <Message id="commandCompletelyUndone" /> e o prompt continua.

## Missing

Uma cota não é associativa: as cotas não acompanham os objetos que medem. Uma cota angular não pode ser a base: o AutoCAD aceita a que foi feita por último ou a selecionada; aqui, se for a última, o comando pede uma cota, e se for selecionada, é recusada como uma de raio. As cotas de coordenada ainda não existem.

## Questions

### Qual é o comando DIMBASELINE no AutoCAD em português?

COTALINBASE, com os aliases `CLB` e `DIMBASE`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_DIMBASELINE`.

### Como mudar o espaçamento das cotas de linha de base?

É o espaçamento da linha de base do estilo de cota: o <Command id="DIMSTYLE" /> (`EC`) abre os estilos na paleta Estilos, onde ele fica em Linhas, como no AutoCAD. As cotas já desenhadas ficam onde estão; o <Command id="DIMSPACE" /> as espaça de novo por igual.

### Como partir de outra cota?

Pressione Enter no primeiro prompt, ou escolha <Keyword id="Select" />, e selecione a cota perto da linha de extensão de onde medir: todas as cotas novas partem dali.

### Qual a diferença entre cota de linha de base e cota contínua?

O COTALINBASE mede todas as cotas a partir da mesma linha de extensão, cada uma numa linha mais afastada. O <Command id="DIMCONTINUE" /> as põe uma depois da outra numa linha, cada uma a partir de onde a anterior terminou.
