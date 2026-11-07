---
title: "Ejercicio de AutoCAD 3D: una placa de montaje"
metaTitle: "Ejercicio de AutoCAD 3D básico: placa de montaje"
description: "Modela una placa de montaje en AutoCAD 3D: regiones, una diferencia para los agujeros y una extrusión crean el sólido, resuelto paso a paso. Practica 3D gratis."
figure: "El contorno de la placa, de 100 por 60 con cuatro agujeros, acotado."
model: "La placa como sólido, de 10 de espesor, vista desde el sureste sin las líneas ocultas."
sourceHash: "87b8f906b0fd"
---

Modela una placa de montaje de 10 de espesor, en milímetros: su contorno de 100 por 60 con esquinas de radio 8, y cuatro agujeros de 10 con los centros a 15 de los bordes. Empieza plana. El contorno y los círculos se convierten en regiones, los agujeros se restan mientras la placa sigue plana, y una sola extrusión la convierte en un sólido con sus agujeros.

## Steps

### Dibuja el perfil [#profile]

En la capa Contorno, <Command id="RECTANG" /> con un <Keyword command="RECTANG" id="Fillet" /> de `8`, de `0,0` a `100,60`. Después, un círculo en `15,15` con un <Keyword command="CIRCLE" id="Diameter" /> de `10`, y cópialo con <Command id="COPY" /> desde su centro a `70,0`, `70,30` y `0,30`.

### Crea las regiones [#region]

<Command id="REGION" /> convierte objetos cerrados en regiones: designa el contorno y los cuatro círculos, y pulsa Intro. Cinco bucles, cinco regiones.

### Resta los agujeros [#subtract]

<Command id="SUBTRACT" />: designa la región de la placa y pulsa Intro; después, las regiones de los cuatro círculos, e Intro. Queda una sola región, con cuatro agujeros.

### Gira la vista [#view]

<Command id="-VIEW" /> y <Keyword command="VIEW" id="SEiso" /> la muestran desde el sureste y desde arriba; <Command id="VSCURRENT" /> y <Keyword command="VSCURRENT" id="Hidden" /> ocultan lo que tapan las caras. El ViewCube también gira la vista con un clic.

### Extrúyela [#extrude]

<Command id="EXTRUDE" />: designa la región, pulsa Intro y escribe la altura, `10`. La placa es un sólido, con sus agujeros. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> la encuadra, y una escala de 0.8x deja margen alrededor.
