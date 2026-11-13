---
title: "Comando BOX (CAIXA) no AutoCAD 3D"
description: "Como funciona o BOX do AutoCAD em português, CAIXA, prompt a prompt: dois cantos e uma altura, Centro, CUbo, COmprimento e 2Pontos. Experimente grátis online."
figure: "Uma caixa de 60 por 40 por 25, com dois cantos e uma altura, vista do sudeste no estilo visual Oculto."
sourceHash: "46936b3da48e"
---

O BOX, CAIXA no AutoCAD em português, desenha uma caixa, um sólido 3D com as faces alinhadas aos eixos do UCS: especifique o primeiro canto, o outro canto e depois a altura. A altura sobe pelo eixo Z do UCS, uma negativa desce, e um ponto a dá pela distância até o canto; um canto dado num Z diferente do primeiro define a altura sem perguntá-la. A última altura, e o último comprimento e a última largura de um cubo ou de <Keyword id="Length" />, são oferecidos como padrões que o Enter aceita, compartilhados com as outras primitivas e com o <Command id="EXTRUDE" />. A caixa fica na camada atual, e o Desfazer a reverte num passo.

A caixa guarda as suas medidas: o <Command id="LIST" /> mostra posição, comprimento, largura, altura e rotação, e a paleta Propriedades permite digitar as quatro primeiras. Suas alças a movem, a esticam e, fora da vista em planta, definem a altura. É um sólido 3D para o <Command id="UNION" />, o <Command id="SUBTRACT" /> e o resto do 3D do MellowCAD, que é só de sólidos e ainda parcial.

## Options

### Center

No primeiro prompt: pede o centro e depois um canto, <Keyword id="Cube" /> ou <Keyword id="Length" />. A caixa fica centrada no ponto, também na altura.

### Cube

No outro canto: pede um comprimento, digitado ou indicado, e faz um cubo com todos os lados desse tamanho. Um comprimento digitado vai na direção do cursor; um negativo, no sentido contrário.

### Length

No outro canto: pede o comprimento e depois a largura. O comprimento vai na direção do cursor, então a caixa pode ficar girada; a largura vai para o lado em que o cursor está.

### 2Point

Na altura: pede dois pontos, e a altura é a distância entre eles.

## Missing

Mover, Rotacionar, Escala e Espelhar a partir de uma alça ativa, que o AutoCAD percorre com Enter. Os comandos 3D próprios — mover, rotacionar, escalar, espelhar e alinhar em 3D — com os seus gizmos, e mover as suas faces, arestas e vértices um a um. O UCS dinâmico. As cotas pontilhadas que o AutoCAD desenha enquanto você dá o canto, o comprimento e a largura. O <Command id="FILLET" /> e o <Command id="CHAMFER" /> das suas arestas, que o <Command id="FILLETEDGE" /> e o <Command id="CHAMFEREDGE" /> fazem. Registrar histórico e Mostrar histórico, do Histórico do sólido, e a linha Material. Os estilos visuais que faltam ao <Command id="VSCURRENT" /> além de Estrutura de arame 2D, Oculto e Conceitual.

## Questions

### Qual é o comando BOX no AutoCAD em português?

CAIXA, sem alias. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_BOX`.

### Por que a caixa aparece como um retângulo?

Você a está vendo de cima, em planta. Gire a vista: um canto do ViewCube, <Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />, ou <Command id="3DORBIT" />. O <Command id="VSCURRENT" /> com <Keyword command="VSCURRENT" id="Hidden" /> oculta as arestas que ficam atrás.

### Como fazer um cubo no AutoCAD?

Especifique o primeiro canto, escolha <Keyword id="Cube" /> e digite o comprimento de um lado.

### Como desenhar uma caixa a partir do centro?

Escolha <Keyword id="Center" /> e especifique o centro, depois um canto, <Keyword id="Cube" /> ou <Keyword id="Length" />: a caixa fica centrada no ponto, também na altura.
