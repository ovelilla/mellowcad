---
title: "Exercício de AutoCAD: um eixo escalonado"
metaTitle: "Exercício de AutoCAD mecânico: eixo escalonado"
description: "Desenhe um eixo escalonado no AutoCAD: meio contorno em polilinha, chanfrado e espelhado, e os comprimentos cotados em série. Grátis, passo a passo."
figure: "Um eixo escalonado em vista lateral, de 150 de comprimento, com os comprimentos cotados em série."
sourceHash: "8c649e73bc55"
---

Desenhe este eixo escalonado em vista lateral, em milímetros: 150 de comprimento, com diâmetros de 30, 40 e 30 em trechos de 40, 60 e 50, e as duas pontas chanfradas 2 por 2. Desenhe a metade acima da linha de centro como uma só polilinha, chanfre-a e espelhe-a; depois as arestas transversais, a linha de centro e as cotas dos comprimentos. Os diâmetros não são cotados: são os dados neste enunciado.

## Steps

### Desenhe a metade de cima [#half]

Na camada Contorno, uma só polilinha com o <Command id="PLINE" />, a partir de `0,0`: para cima `0,15`, para a direita `40,0`, para cima `0,5`, para a direita `60,0`, para baixo `0,-5`, para a direita `50,0` e para baixo `0,-15`, de volta à linha de centro. Enter encerra o comando.

### Chanfre as pontas [#chamfers]

Execute o <Command id="CHAMFER" />, escolha <Keyword command="CHAMFER" id="Distance" /> e digite `2`; Enter aceita `2` também para a segunda distância. <Keyword command="CHAMFER" id="Multiple" /> chanfra um canto depois do outro sem recomeçar: selecione os dois segmentos no canto de cada ponta.

### Espelhe a metade [#mirror]

<Command id="MIRROR" />: selecione a polilinha, pressione Enter, depois a linha de espelhamento de `0,0` a `150,0`, que é a linha de centro, e Enter para manter o original.

### Desenhe as arestas [#edges]

Com o <Command id="LINE" />, as arestas transversais do eixo, cada uma `0,30` para cima a partir de baixo: de `2,-15` e `148,-15`, nos chanfros, e de `40,-15` e `100,-15`, nos ressaltos.

### Desenhe a linha de centro [#axis]

Na camada Linhas de centro, a linha de centro do eixo: de `-8,0` até `166,0` a partir dali.

### Cote o desenho [#dimensions]

Na camada Cotas, o <Command id="DIMLINEAR" /> para o primeiro comprimento, 40, colocado embaixo. O <Command id="DIMCONTINUE" /> continua a partir da segunda linha de extensão dessa cota: `#100,-20`, depois `#150,-15`, digitados a partir da origem com #, e Enter duas vezes para encerrá-lo. Um último <Command id="DIMLINEAR" /> dá o comprimento total, 150, mais abaixo.
