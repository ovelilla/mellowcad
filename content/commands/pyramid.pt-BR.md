---
title: "Comando PYRAMID (PIRAMIDE) no AutoCAD 3D"
description: "Como funciona o PYRAMID do AutoCAD em português, PIRAMIDE (alias PIR), prompt a prompt: lados, base, altura, Aresta, Inscrito e Raio superior. Experimente."
figure: "Uma pirâmide de seis lados, com a base de 25 até o meio de cada lado e 40 de altura, vista do sudeste no estilo visual Oculto."
sourceHash: "acbc5ffa71cb"
---

O PYRAMID, PIRAMIDE no AutoCAD em português, desenha uma pirâmide, um sólido 3D: a sua primeira linha diz quantos lados a base tem e como o raio é lido, e depois ele pede o centro da base, o raio e a altura. A base é um polígono regular, como o <Command id="POLYGON" /> o desenha, de 4 lados no início: um raio digitado o vira para o cursor; um ponto, para si mesmo. A altura sobe pelo eixo Z do UCS, uma negativa desce, e um ponto a dá pela distância até a base. Os lados e o modo como o raio é lido ficam guardados para o próximo PIRAMIDE; o raio e a altura são os padrões compartilhados das primitivas. A pirâmide fica na camada atual, e o Desfazer a reverte num passo.

O <Command id="LIST" /> mostra posição, os dois raios da base e do topo, altura, rotação e número de lados, e a paleta Propriedades permite digitar os raios, os lados e a altura. Suas alças a movem, definem a altura e dimensionam a base a partir de um canto ou do meio de um lado. É um sólido 3D para o <Command id="UNION" />, o <Command id="SUBTRACT" /> e o resto do 3D do MellowCAD, que é só de sólidos e ainda parcial; o <Command id="EXPLODE" /> a transforma numa região por face.

## Options

### Edge

No centro da base: pede as duas pontas de um lado da base, que é desenhada à esquerda desse lado.

### Sides

No centro da base: pede o número de lados, de 3 a 32, e depois o centro de novo.

### Inscribed

No raio: lê o raio até um canto da base, o polígono inscrito nesse círculo, e o pede de novo.

### Circumscribed

No raio, depois de escolher <Keyword id="Inscribed" />: lê o raio até o meio de um lado, o polígono em volta desse círculo, como no início, e o pede de novo.

### 2Point

Na altura: pede dois pontos, e a altura é a distância entre eles.

### Axis

Na altura: pede o vértice. A pirâmide vai do centro da base até esse ponto, em qualquer direção, com a base perpendicular ao eixo.

### Top

Na altura: pede o raio superior, lido como o da base, e depois a altura de novo. A pirâmide termina num polígono menor em vez de numa ponta, um tronco de pirâmide; um topo tão grande quanto a base faz um prisma.

## Missing

O que falta ao <Command id="BOX" />: Mover, Rotacionar, Escala e Espelhar a partir de uma alça ativa, os comandos 3D próprios e os estilos visuais que faltam ao <Command id="VSCURRENT" />. O seu tipo, inscrito ou circunscrito, digitado na paleta Propriedades. As cotas pontilhadas que o AutoCAD desenha enquanto você dá o raio e uma aresta.

## Questions

### Qual é o comando PYRAMID no AutoCAD em português?

PIRAMIDE, com o alias `PIR`. Digite-o e pressione Enter ou a barra de espaço, depois dê o centro da base, o raio e a altura. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_PYRAMID`.

### Como desenhar uma pirâmide hexagonal no AutoCAD?

Escolha <Keyword id="Sides" /> antes do centro da base e digite `6`, depois dê o centro, o raio e a altura: `0,0`, `25` e `40` desenham a pirâmide da figura. O próximo PIRAMIDE mantém os seis lados.

### Como desenhar uma pirâmide pela medida do lado da base?

Escolha <Keyword id="Edge" /> e dê as duas pontas de um lado: um lado de `0,0` a `50,0` faz uma base quadrada de 50, com os 4 lados do padrão.

### Como fazer um tronco de pirâmide no AutoCAD?

Na altura, escolha <Keyword id="Top" />, digite o raio superior e depois a altura. A pirâmide termina num polígono menor, com tantos lados quanto a base.
