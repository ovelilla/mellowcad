---
title: "Exercício de AutoCAD 3D: um mancal"
metaTitle: "Exercício de AutoCAD 3D avançado: um mancal"
description: "Modele um mancal no AutoCAD 3D: extrusão, união e a subtração de um furo e dois furos de fixação como cilindros, passo a passo. Pratique sólidos 3D grátis."
figure: "O mancal em vista superior, de 100 por 60, com o cubo, o furo central e os furos cotados."
model: "O mancal como sólido, visto do sudeste no estilo visual Conceitual."
sourceHash: "5579d6bd5a86"
---

Modele este mancal, em milímetros: uma base de 100 por 60 com cantos de raio 10 e 12 de espessura; no meio, um cubo de 40 de diâmetro e 40 de altura; um furo central de 20 que atravessa o cubo e dois furos de fixação de 10 que atravessam a base, a 76 um do outro. A base e o cubo são extrudados a partir dos contornos e unidos num só sólido; o furo central e os furos de fixação são cilindros subtraídos dele.

## Steps

### Desenhe a vista superior [#plan]

Na camada Contorno, o <Command id="RECTANG" /> com <Keyword command="RECTANG" id="Fillet" /> de `10`, de `0,0` a `100,60`, e um círculo no centro dele, `50,30`, com <Keyword command="CIRCLE" id="Diameter" /> de `40`.

### Extrude a base e o cubo [#extrude]

Com o <Command id="EXTRUDE" />, o contorno com `12` de altura e depois o círculo com `40`: dois sólidos.

### Una os sólidos [#union]

<Command id="UNION" />: selecione os dois e pressione Enter. Agora são um só sólido.

### Desenhe os cilindros [#holes]

O furo central e um furo de fixação como cilindros, com o <Command id="CYLINDER" />: o furo central em `50,30`, <Keyword command="CYLINDER" id="Diameter" /> `20` e `40` de altura; um furo de fixação em `12,30`, diâmetro `10` e `12` de altura. Depois copie o furo de fixação com o <Command id="COPY" />, de `12,30` para `76,0` a partir dali.

### Subtraia os cilindros [#subtract]

<Command id="SUBTRACT" />: selecione o mancal e pressione Enter, depois os três cilindros e Enter. O furo central e os furos de fixação atravessam a peça.

### Gire a vista [#view]

O <Command id="-VIEW" /> com <Keyword command="VIEW" id="SEiso" />, o <Command id="VSCURRENT" /> com <Keyword command="VSCURRENT" id="Conceptual" /> e depois o <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> e 0.8x para enquadrá-lo.
