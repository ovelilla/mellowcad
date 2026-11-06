---
title: "Comando CONE no AutoCAD 3D"
metaTitle: "Comando CONE no AutoCAD: cone e tronco de cone"
description: "Como funciona o CONE do AutoCAD, igual em português: cone ou tronco de cone, prompt a prompt: base, raio, altura, Raio superior, Elíptico e Eixo. Experimente."
figure: "Um cone de raio 20 e altura 40, a partir do centro da base, visto do sudeste no estilo visual Oculto."
sourceHash: "1c40f02e6b3c"
---

O CONE, com o mesmo nome no AutoCAD em português, desenha um cone, um sólido 3D: especifique o centro da base, depois o raio e depois a altura, e ele se estreita até uma ponta. Ele pergunta o que o <Command id="CYLINDER" /> pergunta, com <Keyword id="Top" /> na altura para um cone truncado. A base fica no plano XY do UCS, no Z do centro, e a altura sobe pelo eixo Z do UCS; uma negativa o faz apontar para baixo, e um ponto a dá pela distância até a base. O raio e a altura são oferecidos como padrões que o Enter aceita, compartilhados com as outras primitivas. O cone fica na camada atual, e o Desfazer o reverte num passo.

O <Command id="LIST" /> mostra posição, normal, raio da base, raio superior e altura, e a paleta Propriedades permite digitá-los. Suas alças o movem e definem a altura, o raio da base em cada quarto da base e o raio superior. O snap ao objeto Ponto final encontra o vértice. É um sólido 3D para o <Command id="UNION" />, o <Command id="SUBTRACT" /> e o resto do 3D do MellowCAD, que é só de sólidos e ainda parcial.

## Options

### 3P

No centro da base: pede três pontos, e a base é o círculo que passa por eles, no plano deles.

### 2P

No centro da base: pede as duas pontas do diâmetro da base.

### Ttr

No centro da base: selecione duas linhas, círculos ou arcos, com o snap ao objeto Tangente, e dê um raio: a base toca os dois.

### Elliptical

No centro da base: a base é uma elipse, dada pelas duas pontas do primeiro eixo e pela ponta do segundo, ou com <Keyword id="Center" /> a partir do centro. Um raio superior reduz a mesma elipse.

### Diameter

No raio: pede o diâmetro no lugar dele, oferecendo o dobro do último raio.

### 2Point

Na altura: pede dois pontos, e a altura é a distância entre eles.

### Axis

Na altura: pede o vértice. O cone vai do centro da base até esse ponto, em qualquer direção, com a base perpendicular ao eixo.

### Top

Na altura: pede o raio superior e depois a altura de novo. O cone termina num círculo em vez de numa ponta, um tronco de cone; um topo tão largo quanto a base faz os lados de um cilindro, e um mais largo, um cone que se alarga para cima. Ele oferece o raio superior do último cone, 0 no início.

## Missing

O <Command id="EXPLODE" /> de um cone, que o AutoCAD transforma na sua base e numa superfície: o MellowCAD não tem superfícies, então diz que não conseguiu explodi-lo. Transformar um cone redondo num elíptico digitando na paleta Propriedades. Com o `ISOLINES` em 0, o ponto que o AutoCAD desenha no vértice. E o que falta ao <Command id="CYLINDER" />: Mover, Rotacionar, Escala e Espelhar a partir de uma alça ativa, as cotas pontilhadas enquanto você dá o raio, e os estilos visuais que faltam ao <Command id="VSCURRENT" />.

## Questions

### Como desenhar um cone no AutoCAD?

Execute o CONE, especifique o centro da base, o raio e a altura: `0,0`, `20` e `40` desenham o cone da figura. Gire a vista para vê-lo, com um canto do ViewCube ou com <Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />.

### Como fazer um tronco de cone no AutoCAD?

Na altura, escolha <Keyword id="Top" />, digite o raio superior e depois a altura. O cone termina num círculo desse raio.

### Como desenhar um cone invertido?

Digite uma altura negativa: o cone aponta para baixo a partir da base. Ou escolha <Keyword id="Axis" /> e dê o vértice onde ele deve ficar.

### A base de um cone pode ser uma elipse?

Sim: escolha <Keyword id="Elliptical" /> no centro da base e dê os seus eixos. Um raio superior faz do topo a mesma elipse, menor.
