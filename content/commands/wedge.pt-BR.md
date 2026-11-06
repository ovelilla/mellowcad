---
title: "Comando WEDGE (CUNHA) no AutoCAD 3D"
description: "Como funciona o WEDGE do AutoCAD em português, CUNHA (alias CN), prompt a prompt: dois cantos e uma altura, Centro, CUbo, COmprimento e 2Pontos. Experimente."
figure: "Uma cunha de 60 por 40 por 25, com dois cantos e uma altura, a rampa descendo a partir do lado do primeiro canto, vista do sudeste no estilo visual Oculto."
sourceHash: "06fba2eeb7be"
---

O WEDGE, CUNHA no AutoCAD em português, desenha uma cunha, um sólido 3D: uma caixa cujo topo desce em rampa de uma ponta até a outra. Ele pergunta o que o <Command id="BOX" /> pergunta: o primeiro canto, o outro canto e depois a altura. A ponta alta fica no primeiro canto, e a rampa desce ao longo do eixo X do UCS até o lado do outro canto; um canto num X menor a vira ao contrário. A altura sobe pelo eixo Z do UCS, uma negativa desce. O comprimento, a largura e a altura são os padrões do <Command id="BOX" />, que o Enter aceita. A cunha fica na camada atual, e o Desfazer a reverte num passo.

O <Command id="LIST" /> mostra posição, comprimento, largura, altura e rotação, e a paleta Propriedades permite digitá-los. Suas alças são as do <Command id="BOX" />. É um sólido 3D para o <Command id="UNION" />, o <Command id="SUBTRACT" /> e o resto do 3D do MellowCAD, que é só de sólidos e ainda parcial; o <Command id="EXPLODE" /> a transforma numa região por face.

## Options

### Center

No primeiro prompt: pede o centro e depois um canto, <Keyword id="Cube" /> ou <Keyword id="Length" />. A cunha fica centrada no ponto, também na altura, com a ponta alta do lado oposto ao canto dado.

### Cube

No outro canto: pede um comprimento e faz uma cunha com todos os lados desse tamanho. Diferente do cubo do <Command id="BOX" />, ele vai ao longo do eixo X do UCS, para trás quando negativo.

### Length

No outro canto: pede o comprimento, ao longo do eixo X do UCS, e depois a largura, ao longo do Y; um negativo vai para trás. Um ponto dá só a sua distância, nunca a sua direção.

### 2Point

Na altura: pede dois pontos, e a altura é a distância entre eles.

## Missing

O que falta ao <Command id="BOX" />: Mover, Rotacionar, Escala e Espelhar a partir de uma alça ativa, os comandos 3D próprios, as cotas pontilhadas enquanto você dá o canto, e os estilos visuais que faltam ao <Command id="VSCURRENT" />. Em planta, o snap ao objeto Ponto final debaixo da ponta alta encontra o canto do topo, onde o AutoCAD encontra o da base.

## Questions

### Qual é o comando WEDGE no AutoCAD em português?

CUNHA, com o alias `CN`. Digite-o e pressione Enter ou a barra de espaço, depois dê o primeiro canto, o outro canto e a altura: `0,0`, `60,40` e `25` desenham a cunha da figura. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_WEDGE`.

### Para que lado a cunha é inclinada?

Ela desce a partir da ponta do primeiro canto, ao longo do eixo X do UCS. Para virá-la, dê o outro canto num X menor, o que a gira 180°, ou rotacione-a depois com o <Command id="ROTATE" />.

### Como desenhar um prisma triangular no AutoCAD?

Uma cunha é um: um triângulo retângulo em cada ponta, estendido ao longo da largura. Para qualquer outro triângulo, desenhe-o fechado com o <Command id="PLINE" /> e faça a extrusão dele com o <Command id="EXTRUDE" />.

### Como desenhar uma cunha a partir do centro?

Escolha <Keyword id="Center" /> e especifique o centro, depois um canto, <Keyword id="Cube" /> ou <Keyword id="Length" />: a cunha fica centrada no ponto, também na altura.
