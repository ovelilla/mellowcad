---
title: "Comando OFFSET (DESLOCAMENTO) no AutoCAD"
description: "Como funciona o OFFSET do AutoCAD em português, DESLOCAMENTO, prompt a prompt: distância ou Através, aPagar e Camada. Experimente grátis online."
figure: "Um retângulo deslocado 6 para dentro e um círculo 6 para fora: cada um selecionado e depois o seu lado."
sourceHash: "b495af1e1410"
---

O OFFSET, DESLOCAMENTO no AutoCAD em português, desenha uma cópia de um objeto paralela a ele, à distância que você digita ou passando por um ponto que você indica: uma linha dá uma linha paralela; um círculo ou um arco, um concêntrico; uma polilinha, um contorno por dentro ou por fora; e uma elipse ou uma spline, uma spline que a acompanha. Como no AutoCAD, ele trabalha com um objeto por vez: você dá a distância uma vez e depois seleciona um objeto e o lado da cópia, quantas vezes quiser. Enter o encerra.

## Options

### Through

Em vez de uma distância, cada cópia passa por um ponto que você indica ou digita. É o padrão do primeiro prompt, então Enter o escolhe enquanto nenhuma distância tiver sido dada; a partir daí, Enter repete a última distância naquele desenho.

### Erase

Pergunta se cada objeto de origem é apagado depois de deslocado, <Keyword id="Yes" /> ou <Keyword id="No" /> (o padrão). Com <Keyword id="Yes" />, a cópia substitui o objeto. A escolha vale pelo resto da sessão, e o próximo DESLOCAMENTO a mostra na primeira linha.

### Layer

Pergunta onde ficam as cópias: na camada <Keyword id="Current" /> ou na do objeto de <Keyword id="Source" /> (o padrão). Também vale pela sessão.

### Exit

Encerra o comando, como Enter no prompt do objeto.

### Multiple

No prompt do lado: continua deslocando o mesmo objeto sem selecioná-lo de novo, cada cópia uma distância além da anterior, até Enter ou <Keyword id="Exit" />.

### Undo

Desfaz a última cópia, seja de qual objeto for, e volta a pedir um objeto. Quando não resta cópia para desfazer, ele avisa.

## Missing

OFFSETGAPTYPE 1 e 2: os cantos de uma polilinha deslocada são sempre fechados como com 0, estendendo os segmentos até se encontrarem. O deslocamento de uma spline ou de uma elipse fica dentro da tolerância do AutoCAD, mas os nós caem onde o MellowCAD os põe, não onde o AutoCAD os põe. Com Através sobre uma spline, a dica de ferramenta mostra X e Y, não a distância.

## Questions

### Qual é o comando OFFSET no AutoCAD em português?

DESLOCAMENTO. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_OFFSET`.

### Por que o offset não funciona no AutoCAD?

O DESLOCAMENTO desloca linhas, arcos, círculos, polilinhas 2D, elipses e splines. Ele recusa textos, textos multilinha, referências de bloco, cotas e hachuras com <Message id="cannotOffsetObject" />, e faz o mesmo quando a distância reduziria a nada um círculo, um arco ou uma polilinha. Um objeto numa camada bloqueada não pode ser selecionado, e uma polilinha 3D é ignorada.

### Como fazer o offset da mesma linha várias vezes?

Selecione a linha e digite a letra de <Keyword id="Multiple" /> no prompt do lado: cada ponto desse lado faz mais uma cópia, cada uma uma distância além da anterior. Ou mantenha o padrão e selecione a cópia mais recente a cada vez.

### Como colocar as cópias na camada atual?

Escolha <Keyword id="Layer" /> no primeiro prompt e depois <Keyword id="Current" />. Daí em diante, cada cópia vai para a camada atual, até você escolher <Keyword id="Source" /> de novo.
