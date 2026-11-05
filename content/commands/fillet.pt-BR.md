---
title: "Comando FILLET (CONCORD) no AutoCAD"
description: "Como funciona o FILLET do AutoCAD em português, CONCORD (alias CNC), prompt a prompt: o raio, duas linhas, uma polilinha, raio 0 e Múltiplo. Experimente grátis."
figure: "Quatro linhas, raio 15 e a opção Múltiplo: dois cantos arredondados e dois vivos."
sourceHash: "f97d737f74a9"
---

O FILLET, CONCORD no AutoCAD em português, arredonda o canto entre dois objetos com um arco do raio que você der, aparando ou estendendo cada objeto até ele. A primeira linha mostra o modo e o raio atual; depois você seleciona o primeiro objeto e o segundo, cada um do lado que quer manter, e o comando termina. Ele aceita linhas, arcos, círculos, elipses, splines e os segmentos de uma polilinha 2D. Duas linhas não precisam se tocar: são estendidas até o arco, como no AutoCAD. Com raio 0, ou segurando Shift ao selecionar o segundo objeto, ele faz um canto vivo.

## Options

### Undo

Desfaz a última concordância, <Keyword id="Polyline" /> ou raio dado neste CONCORD, um de cada vez. Quando não resta nada a desfazer, avisa <Message id="commandCompletelyUndone" />

### Polyline

Pede uma polilinha 2D e arredonda cada canto onde dois segmentos dela se encontram, num só passo; depois diz quantos arredondou e quantos deixou, por serem paralelos ou curtos demais para o raio. Um retângulo desenhado com o <Command id="RECTANG" /> é uma polilinha assim.

### Radius

Pede o raio, que também é oferecido no segundo prompt. É o do desenho (FILLETRAD): o próximo CONCORD começa com ele, e ele é salvo com o desenho. 0 faz cantos vivos; um raio negativo é recusado.

### Multiple

Volta a pedir o primeiro objeto depois de cada concordância, para arredondar canto após canto sem recomeçar, até o Enter.

## Missing

<Keyword id="Trim" />: os objetos são sempre aparados ou estendidos até o arco, como com TRIMMODE 1, o padrão do AutoCAD; a opção de não aparar não é oferecida. O arco não recebe a escala do tipo de linha do segundo objeto, pois aqui nenhum objeto tem uma própria. Antes do clique, a dica de ferramenta mostra o prompt, e não por que um par não pode ser concordado, e nenhum cadeado marca um objeto numa camada bloqueada. Alguns pares raros de elipses ou splines terminam de outro jeito: uma spline fechada com uma linha a raio 0, um arco que só toca o deslocamento de uma elipse e um par assim num plano inclinado.

## Questions

### Qual é o comando FILLET no AutoCAD em português?

CONCORD, com o alias `CNC`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_FILLET`.

### Como fazer o fillet de duas linhas?

Escolha <Keyword id="Radius" />, digite o valor e depois selecione cada linha do lado que quer manter. As linhas que não se tocam são estendidas até o arco, e as que se cruzam são aparadas até ele. Duas linhas paralelas são unidas por meia circunferência, qualquer que seja o raio. Uma linha e o segmento de uma polilinha viram uma só polilinha.

### O que faz o fillet com raio 0?

Um canto vivo: cada linha é aparada ou estendida até se encontrarem, sem arco. Para um só canto vivo sem mudar o raio, segure Shift ao selecionar o segundo objeto.

### Por que o fillet não funciona?

Ele diz o motivo na linha de comando. <Message id="filletRadiusTooLarge" /> quer dizer que o arco não cabe entre as linhas; <Message id="segmentsNotConsecutive" />, que dois segmentos de uma polilinha estão longe demais. Textos, blocos, cotas e hachuras são recusados, de objetos em alturas diferentes ele diz que não são coplanares, e um objeto numa camada bloqueada não é aceito.

### Como fazer o fillet das arestas de um sólido 3D?

Execute o <Command id="FILLETEDGE" />: escolha <Keyword command="FILLETEDGE" id="Radius" /> se o raio não for o que ele mostra, selecione as arestas do sólido, pressione Enter e mais uma vez Enter para aceitar a concordância. Ele trabalha com sólidos 3D, que aqui ainda são parciais.
