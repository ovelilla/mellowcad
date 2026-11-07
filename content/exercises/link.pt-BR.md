---
title: "Exercício de AutoCAD: biela com linhas tangentes"
metaTitle: "Exercício de AutoCAD avançado: biela e tangentes"
description: "Desenhe uma biela no AutoCAD: dois olhais ligados por linhas tangentes com o snap ao objeto Tangente, os arcos entre elas aparados, e as cotas. Grátis online."
figure: "Uma biela de dois olhais a 90 um do outro, ligados por linhas tangentes, cotada."
sourceHash: "383984af61b7"
---

Desenhe esta biela, em milímetros: dois olhais a 90 um do outro, de raio 20 e 12, com furos de raio 10 e 6, ligados por linhas tangentes aos dois, com os arcos entre as linhas aparados. As linhas tangentes usam o snap ao objeto Tangente nas duas pontas; depois o <Command id="TRIM" /> transforma o círculo de cada olhal num arco.

## Steps

### Desenhe os olhais [#bosses]

Na camada Contorno, quatro círculos com o <Command id="CIRCLE" />, cada um pelo raio: `20` e `10` em `0,0`, `12` e `6` em `90,0`.

### Desenhe as linhas tangentes [#tangents]

Execute o <Command id="LINE" />, digite `_TAN`, o snap ao objeto Tangente para um só ponto, e clique no círculo grande perto do topo; `_TAN` de novo e clique no pequeno perto do topo. A linha toca os dois. O mesmo por baixo.

### Apare os arcos [#trim]

<Command id="TRIM" />: selecione cada olhal entre as duas linhas, do lado voltado para o outro. Os arcos internos somem e cada círculo vira um arco.

### Desenhe as linhas de centro [#centreLines]

Na camada Linhas de centro, a linha que passa pelos dois centros e uma linha atravessando cada olhal.

### Cote o desenho [#dimensions]

Na camada Cotas, a distância entre os centros com o <Command id="DIMLINEAR" />, os raios dos olhais com o <Command id="DIMRADIUS" /> e os furos deles com o <Command id="DIMDIAMETER" />.
