---
title: "Comando TORUS (TOROIDE) no AutoCAD 3D"
description: "Como funciona o TORUS do AutoCAD em português, TOROIDE (alias TORO), prompt a prompt: centro, raio do anel e do tubo, Diâmetro, 3P, 2P e Ttr. Experimente."
figure: "Um toroide de raio 30 em volta de um tubo de raio 8, visto do sudeste no estilo visual Conceitual."
sourceHash: "a19600f3e357"
---

O TORUS, TOROIDE no AutoCAD em português, desenha um anel, um sólido 3D em forma de rosca: especifique o centro, depois o raio do anel, do centro até o meio do tubo, e depois o raio do tubo. O anel fica no plano XY do UCS, no Z do centro. Um ponto no prompt do tubo é medido a partir do ponto do anel, aquele em que o raio foi dado. O raio do anel é o padrão compartilhado das primitivas, e o raio do tubo tem um padrão próprio, que o Enter aceita. O toroide fica na camada atual, e o Desfazer o reverte num passo.

Um raio de anel negativo com um tubo mais largo faz uma bola como a de rúgbi, com as pontas agudas; um anel mais estreito que o seu tubo, uma maçã. Em Estrutura de arame 2D e Oculto ele é desenhado em linhas em volta do tubo e em volta do anel, tantas quantas o `ISOLINES` diz. O <Command id="LIST" /> mostra posição, normal, raio do toroide e raio do tubo, e a paleta Propriedades permite digitar os dois. Suas alças o movem, definem o raio do anel e definem o do tubo. É um sólido 3D para o <Command id="UNION" />, o <Command id="SUBTRACT" /> e o resto do 3D do MellowCAD, que é só de sólidos e ainda parcial.

## Options

### 3P

No centro: pede três pontos, e o anel é o círculo que passa por eles, no plano deles.

### 2P

No centro: pede as duas pontas do diâmetro do anel.

### Ttr

No centro: selecione duas linhas, círculos ou arcos, com o snap ao objeto Tangente, e dê um raio: o anel toca os dois, na altura deles.

### Diameter

No raio do anel: pede o diâmetro do toroide no lugar dele. No do tubo: pede o diâmetro do tubo. Cada um oferece o dobro do seu padrão.

### 2Point

No raio do tubo: pede dois pontos, e o raio do tubo é a distância entre eles.

## Missing

O <Command id="EXPLODE" /> de um toroide, que o AutoCAD transforma numa superfície: o MellowCAD não tem superfícies, então diz que não conseguiu explodi-lo. Mover, Rotacionar, Escala e Espelhar a partir de uma alça ativa, e a silhueta que o `DISPSILH` do AutoCAD desenha.

## Questions

### Qual é o comando TORUS no AutoCAD em português?

TOROIDE, com o alias `TORO`: `TOR`, o alias em inglês, não existe no AutoCAD em português, cujo console o recusa, e aqui também não. Digite `TORO` e pressione Enter ou a barra de espaço, depois dê o centro, o raio do anel e o do tubo: `0,0,0`, `30` e `8` desenham o toroide da figura. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_TORUS`.

### Qual é a diferença entre o raio e o raio do tubo?

O raio vai do centro do toroide até o meio do tubo; o raio do tubo é o do próprio tubo. Um toroide de 76 de diâmetro externo com um tubo de 16 de espessura tem raio 30 e raio do tubo 8.

### Como desenhar um toroide em forma de bola de rúgbi?

Dê um raio negativo e depois um raio do tubo maior que o seu valor absoluto: `-5` e `8` fazem uma forma fechada com as duas pontas agudas. Um raio do tubo que não seja maior que isso é recusado e pedido de novo.

### Por que o toroide aparece como dois círculos?

Você o está vendo de cima, em planta. Gire a vista: um canto do ViewCube, <Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />, ou <Command id="3DORBIT" />. O <Command id="VSCURRENT" /> com <Keyword command="VSCURRENT" id="Conceptual" /> o sombreia.
