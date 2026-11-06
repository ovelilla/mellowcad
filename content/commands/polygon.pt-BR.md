---
title: "Polígono no AutoCAD: comando POLIGONO (POLYGON)"
metaTitle: "Polígono no AutoCAD: comando POLIGONO"
description: "Como o POLYGON do AutoCAD em português, POLIGONO (alias POL), desenha um polígono regular: lados, centro, Inscrito ou Circunscrito, ou uma Aresta. Experimente."
figure: "Dois círculos de raio 30, um hexágono inscrito num e circunscrito sobre o outro, e um pentágono pela Aresta."
sourceHash: "90e1cc9a53c4"
---

O POLIGONO, POLYGON no AutoCAD em inglês, desenha um polígono regular, com todos os lados e ângulos iguais, como uma única polilinha fechada. Ele pede o número de lados, de 3 a 1024, depois o centro e se o polígono fica inscrito num círculo ou circunscrito sobre ele, e depois o raio desse círculo. Ou é construído sobre um dos seus lados. O número de lados e a escolha entre inscrito e circunscrito são os padrões do próximo POLIGONO, naquele desenho. Um raio digitado como número desenha o lado de baixo na horizontal; um dado como ponto, indicado ou digitado, define ao mesmo tempo o tamanho e o giro do polígono. Enquanto você dá o raio, o polígono acompanha o cursor, com uma linha tracejada âmbar a partir do centro.

## Options

### Edge

Em vez de um centro: dê as duas pontas de um lado, e o polígono é construído a partir dele no sentido anti-horário.

### Inscribed

Os vértices ficam sobre o círculo: o raio vai do centro a um vértice. É o padrão.

### Circumscribed

Os lados tocam o círculo no ponto médio: o raio vai do centro ao meio de um lado.

## Missing

O snap girado: um raio digitado como número sempre desenha o lado de baixo na horizontal em relação ao UCS, onde o AutoCAD o gira pelo ângulo do snap, SNAPANG.

## Questions

### Qual é o comando POLYGON no AutoCAD em português?

POLIGONO, com o alias `POL`. Como no AutoCAD em português, o nome em inglês também funciona com um sublinhado na frente: `_POLYGON`.

### Como fazer um hexágono no AutoCAD?

Execute o POLIGONO, digite `6` como número de lados, dê o centro, escolha <Keyword id="Inscribed" /> ou <Keyword id="Circumscribed" /> e digite o raio. Entre faces planas, um hexágono circunscrito mede o dobro do raio digitado.

### Qual a diferença entre inscrito e circunscrito?

Com <Keyword id="Inscribed" />, os cantos do polígono tocam o círculo, então ele cabe dentro do círculo. Com <Keyword id="Circumscribed" />, são os lados que tocam o círculo, então o círculo cabe dentro do polígono. Com o mesmo raio, o circunscrito é o maior.

### Como fazer um polígono com um comprimento de lado dado?

Escolha <Keyword id="Edge" /> e dê as duas pontas de um lado: `0,0` e depois o comprimento digitado em relação a ela, como `40,0`. Os outros lados seguem no sentido anti-horário.
