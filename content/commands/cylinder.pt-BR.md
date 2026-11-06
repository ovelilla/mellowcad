---
title: "Comando CYLINDER (CILINDRO) no AutoCAD 3D"
description: "Como funciona o CYLINDER do AutoCAD em português, CILINDRO (alias CIL), prompt a prompt: base, raio, altura, 3P, 2P, Ttr, Elíptico e Eixo. Experimente grátis."
figure: "Um cilindro de raio 20 e altura 40, a partir do centro da base, visto do sudeste no estilo visual Oculto."
sourceHash: "ce397d8dcb5d"
---

O CYLINDER, CILINDRO no AutoCAD em português, desenha um cilindro, um sólido 3D: especifique o centro da base, depois o raio e depois a altura. A base fica no plano XY do UCS, no Z do centro, e a altura sobe pelo eixo Z do UCS; uma negativa desce, e um ponto a dá pela distância até a base, como no <Command id="BOX" />. O raio e a altura são oferecidos como padrões que o Enter aceita, compartilhados com as outras primitivas e com o <Command id="EXTRUDE" />. O cilindro fica na camada atual, e o Desfazer o reverte num passo.

O cilindro guarda as suas medidas: o <Command id="LIST" /> mostra posição, normal, raio e altura, e a paleta Propriedades permite digitar o raio e a altura. Suas alças o movem, definem a altura e, em cada quarto da base, o raio. É um sólido 3D para o <Command id="UNION" />, o <Command id="SUBTRACT" /> e o resto do 3D do MellowCAD, que é só de sólidos e ainda parcial.

## Options

### 3P

No centro da base: pede três pontos, e a base é o círculo que passa por eles, no plano deles. Três pontos no plano XY do UCS continuam fazendo o cilindro subir pelo Z.

### 2P

No centro da base: pede as duas pontas do diâmetro da base; a segunda é lida no plano da primeira.

### Ttr

No centro da base: selecione duas linhas, círculos ou arcos, com o snap ao objeto Tangente, e dê um raio: a base toca os dois, o mais perto possível dos pontos selecionados, na altura deles.

### Elliptical

No centro da base: a base é uma elipse. Dê as duas pontas do primeiro eixo e depois a ponta do segundo; ou escolha <Keyword id="Center" /> e dê o centro, a metade do comprimento do primeiro eixo e depois a ponta do segundo eixo.

### Diameter

No raio: pede o diâmetro no lugar dele, oferecendo o dobro do último raio.

### 2Point

Na altura: pede dois pontos, e a altura é a distância entre eles.

### Axis

Na altura: pede a outra ponta do eixo. O cilindro vai do centro da base até esse ponto, em qualquer direção, com a base perpendicular ao eixo.

## Missing

O <Command id="EXPLODE" /> de um cilindro, que o AutoCAD transforma nas suas duas bases e numa superfície: o MellowCAD não tem superfícies, então diz que não conseguiu explodi-lo. Mover, Rotacionar, Escala e Espelhar a partir de uma alça ativa, e uma altura arrastada além da base. As cotas pontilhadas que o AutoCAD desenha enquanto você dá o raio, os pontos da elipse e o eixo. Transformar um cilindro redondo num elíptico digitando na paleta Propriedades. As silhuetas que o `DISPSILH` do AutoCAD desenha. Em planta, onde o círculo de cima esconde o da base, o snap ao objeto Mais próximo encontra o círculo da base, onde o AutoCAD encontra o de cima. Os estilos visuais que faltam ao <Command id="VSCURRENT" /> além de Estrutura de arame 2D, Oculto e Conceitual.

## Questions

### Qual é o comando CYLINDER no AutoCAD em português?

CILINDRO, com o alias `CIL`. Digite-o e pressione Enter ou a barra de espaço, depois dê o centro da base, o raio e a altura: `0,0`, `20` e `40` desenham o cilindro da figura. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_CYLINDER`.

### Como desenhar um cilindro deitado?

Escolha <Keyword id="Axis" /> na altura e dê a outra ponta do eixo: com a base em `0,0,0`, o ponto `60,0,0` deita o cilindro ao longo do X.

### Como fazer um cilindro oco ou um tubo?

Desenhe dois cilindros com o mesmo centro, o interno mais estreito, e execute o <Command id="SUBTRACT" />: selecione o externo, Enter, o interno, Enter.

### Por que o cilindro aparece como um círculo?

Você o está vendo de cima, em planta. Gire a vista: um canto do ViewCube, <Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />, ou <Command id="3DORBIT" />.
