---
title: "Comando EXTRUDE (EXTRUSAO) no AutoCAD"
description: "Como funciona o EXTRUDE do AutoCAD em português, EXTRUSAO (alias EX): a extrusão de um perfil 2D fechado em sólido 3D, Direção e COnicidade. Experimente grátis."
figure: "Uma polilinha fechada em forma de L extrudada 20 até virar um sólido, vista depois do sudeste no estilo visual Oculto."
sourceHash: "53bfe3dd1e9c"
---

O EXTRUDE, EXTRUSAO no AutoCAD em português, transforma perfis 2D fechados em sólidos 3D: puxa cada um em linha reta para fora do seu plano, na altura que você dá. Selecione os perfis — círculos, elipses, polilinhas ou splines fechadas, regiões — e pressione Enter; depois digite a altura ou indique-a com um ponto. A última altura é o padrão da execução seguinte. Cada perfil vira um sólido próprio, na camada atual, e é apagado, como DELOBJ diz por padrão. O comando inteiro é um passo que o Desfazer reverte.

O 3D do MellowCAD é só de sólidos, e ainda parcial: um perfil aberto, que o AutoCAD transforma em superfície, recebe <Message id="sweepRefusedType" /> e sai do conjunto de seleção.

## Options

### MOde

Pede <Keyword id="SOlid" /> ou <Keyword id="SUrface" />. <Keyword id="SOlid" /> é o padrão e o único que existe: sem objetos de superfície ainda, <Keyword id="SUrface" /> é recusado.

### Direction

Em vez de uma altura, dois pontos dão a direção e o comprimento: os perfis são extrudados ao longo dessa linha, inclinados se ela for inclinada. Uma direção contida no plano do perfil recebe <Message id="directionParallel" />, e o comando termina.

### Path

Listado, como no AutoCAD, mas não implementado: escolhê-lo é recusado, e a altura é pedida de novo.

### Taper

Pede um ângulo entre −90 e 90 graus e depois a altura de novo: um ângulo positivo estreita o sólido à medida que ele sobe; um negativo o alarga. Um círculo que se fecha antes de chegar à altura termina num ponto, um cone; um perfil que não aceita a conicidade não gera nada.

### Expression

A altura como expressão: `2*3` é 6. Por enquanto, só aritmética.

## Missing

<Keyword id="Path" />, a varredura ao longo de um caminho. O modo <Keyword id="SUrface" /> e os perfis abertos, dos quais o AutoCAD faz superfícies: ainda não há objetos de superfície. As faces de sólidos e as áreas que um clique encontra dentro de objetos, que o <Command id="PRESSPULL" /> aceita. A conicidade numa elipse, numa spline ou num arco que encontra o segmento seguinte num canto. Os parâmetros e as funções de <Keyword id="Expression" />. O <Command id="EXPLODE" /> de um sólido extrudado com lados curvos, que o AutoCAD transforma em superfícies e regiões. Suas alças, e a altura e o ângulo de conicidade editados na paleta Propriedades.

## Questions

### Qual é o comando EXTRUDE no AutoCAD em português?

EXTRUSAO, com o alias `EX`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_EXTRUDE`.

### Como fazer extrusão no AutoCAD?

Desenhe o contorno como um só objeto fechado — uma polilinha fechada, um círculo ou uma região —, execute o EXTRUSAO, selecione-o, pressione Enter e digite a altura. Visto de cima, um sólido parece o seu contorno: gire a vista com o ViewCube, ou com <Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />, para vê-lo em 3D.

### Por que a extrusão não vira um sólido?

O perfil está aberto ou cruza a si mesmo. Uma linha, um arco ou uma polilinha aberta viram superfície no AutoCAD, e o MellowCAD ainda não tem superfícies: o EXTRUSAO diz <Message id="sweepRefusedType" /> e os tira do conjunto de seleção; um perfil que cruza a si mesmo recebe <Message id="sweepSelfIntersecting" /> e também sai. Una as peças com <Command id="JOIN" />, faça delas uma região com <Command id="REGION" /> ou clique dentro delas com <Command id="PRESSPULL" />.

### Como extrudar uma forma com furo?

Faça dela uma só região: <Command id="REGION" /> no contorno e no furo, depois <Command id="SUBTRACT" /> para tirar a região do furo da região do contorno. Faça a extrusão dessa região, e o furo atravessa o sólido. Ou execute o <Command id="PRESSPULL" /> e clique entre o contorno e o furo.

### Como fazer extrusão ao longo de um caminho?

Ainda não dá: <Keyword id="Path" /> aparece, mas é recusado, e a varredura ainda não existe. <Keyword id="Direction" /> faz a extrusão ao longo da linha reta entre dois pontos.
