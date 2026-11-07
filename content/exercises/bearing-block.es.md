---
title: "Ejercicio de AutoCAD 3D: un soporte de cojinete"
metaTitle: "Ejercicio de AutoCAD 3D avanzado: soporte"
description: "Modela un soporte de cojinete en AutoCAD 3D: extruye, une y resta como cilindros un agujero central y dos para tornillos, paso a paso. Sólidos 3D gratis."
figure: "El soporte de cojinete en planta, de 100 por 60, con su cubo, su agujero central y sus agujeros acotados."
model: "El soporte de cojinete como sólido, visto desde el sureste con el estilo visual Conceptual."
sourceHash: "5579d6bd5a86"
---

Modela este soporte de cojinete, en milímetros: una base de 100 por 60 con esquinas de radio 10 y 12 de espesor; un cubo de 40 de diámetro y 40 de alto en el centro; un agujero de 20 que atraviesa el cubo y dos agujeros de 10 para tornillos que atraviesan la base, a 76 uno de otro. La base y el cubo se extruyen desde sus contornos y se unen en un solo sólido; el agujero central y los de los tornillos son cilindros que se restan de él.

## Steps

### Dibuja la planta [#plan]

En la capa Contorno, <Command id="RECTANG" /> con un <Keyword command="RECTANG" id="Fillet" /> de `10`, de `0,0` a `100,60`, y un círculo en su centro, `50,30`, con un <Keyword command="CIRCLE" id="Diameter" /> de `40`.

### Extruye la base y el cubo [#extrude]

Extruye con <Command id="EXTRUDE" /> el contorno a `12` de altura y después el círculo a `40`: dos sólidos.

### Únelos [#union]

<Command id="UNION" />: designa los dos y pulsa Intro. Ya son un solo sólido.

### Dibuja los cilindros [#holes]

El agujero central y un agujero para tornillo como cilindros, con <Command id="CYLINDER" />: el agujero central en `50,30`, <Keyword command="CYLINDER" id="Diameter" /> `20` y `40` de altura; un agujero para tornillo en `12,30`, diámetro `10` y `12` de altura. Después, copia el agujero con <Command id="COPY" /> de `12,30` a `76,0` más allá.

### Réstalos [#subtract]

<Command id="SUBTRACT" />: designa el soporte y pulsa Intro; después, los tres cilindros, e Intro. El agujero central y los de los tornillos quedan pasantes.

### Gira la vista [#view]

<Command id="-VIEW" /> y <Keyword command="VIEW" id="SEiso" />, <Command id="VSCURRENT" /> y <Keyword command="VSCURRENT" id="Conceptual" />, y después <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> y 0.8x para encuadrarlo.
