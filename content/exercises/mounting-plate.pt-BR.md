---
title: "Exercício de AutoCAD 3D: uma placa de fixação"
metaTitle: "Exercício de AutoCAD 3D para iniciantes: placa"
description: "Modele uma placa de fixação no AutoCAD 3D: regiões, uma subtração para os furos e uma só extrusão fazem o sólido, passo a passo. Pratique 3D online grátis."
figure: "O contorno da placa, de 100 por 60 com quatro furos, cotado."
model: "A placa como sólido, de 10 de espessura, vista do sudeste com as linhas ocultas removidas."
sourceHash: "87b8f906b0fd"
---

Modele uma placa de fixação de 10 de espessura, em milímetros: o contorno de 100 por 60 com cantos de raio 8, e quatro furos de 10 com os centros a 15 das bordas. Ela começa plana. O contorno e os círculos viram regiões, os furos são subtraídos enquanto a placa ainda é plana, e uma só extrusão a transforma num sólido com os furos.

## Steps

### Desenhe o perfil [#profile]

Na camada Contorno, o <Command id="RECTANG" /> com <Keyword command="RECTANG" id="Fillet" /> de `8`, de `0,0` a `100,60`. Depois um círculo em `15,15` com <Keyword command="CIRCLE" id="Diameter" /> de `10`; copie-o com o <Command id="COPY" />, a partir do centro dele, para `70,0`, `70,30` e `0,30`.

### Crie as regiões [#region]

O <Command id="REGION" /> transforma objetos fechados em regiões: selecione o contorno e os quatro círculos, e Enter. Cinco loops, cinco regiões.

### Subtraia os furos [#subtract]

<Command id="SUBTRACT" />: selecione a região da placa e pressione Enter, depois as regiões dos quatro círculos e Enter. Sobra uma região, com quatro furos.

### Gire a vista [#view]

O <Command id="-VIEW" /> com <Keyword command="VIEW" id="SEiso" /> mostra a peça do sudeste e de cima; o <Command id="VSCURRENT" /> com <Keyword command="VSCURRENT" id="Hidden" /> oculta o que as faces escondem. O ViewCube também gira a vista com um clique.

### Faça a extrusão [#extrude]

<Command id="EXTRUDE" />: selecione a região, pressione Enter e digite a altura, `10`. A placa vira um sólido, com furos e tudo. O <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> a enquadra, e uma escala de 0.8x deixa uma margem em volta.
