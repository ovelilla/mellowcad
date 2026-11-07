---
title: "Ejercicio de AutoCAD: una junta"
metaTitle: "Ejercicio de AutoCAD para principiantes: junta"
description: "Dibuja una junta en AutoCAD: una placa redondeada, un agujero central, cuatro agujeros copiados de uno, ejes y cotas, resuelto paso a paso. Gratis online."
figure: "La junta, de 120 por 80, acotada."
sourceHash: "dc5c0e2b45b8"
---

Dibuja esta junta, en milímetros: una placa de 120 por 80 con las esquinas redondeadas con un radio de 10, un agujero central de 40 y cuatro agujeros de 10, con sus centros a 12 de los bordes, además de los ejes del agujero central y las cotas. Todo se escribe: el primer punto de un comando es el que escribes, y cada punto siguiente se mide desde el anterior. El contorno, los ejes y las cotas van cada uno en su propia capa.

## Steps

### Dibuja el contorno [#outline]

Haz actual la capa Contorno en el control de capas. <Command id="RECTANG" /> dibuja la placa de una vez: elige <Keyword command="RECTANG" id="Fillet" /> y escribe el radio, `10`; después, la primera esquina, `0,0`, y la otra esquina, `120,80`, medida desde la primera.

### Dibuja el agujero central [#bore]

<Command id="CIRCLE" /> en el centro de la placa, `60,40`: elige <Keyword command="CIRCLE" id="Diameter" /> y escribe `40`.

### Copia los agujeros [#holes]

Dibuja un agujero, un círculo en `12,12` con un <Keyword command="CIRCLE" id="Diameter" /> de `10`, y cópialo con <Command id="COPY" />: designa el círculo, pulsa Intro, toma su centro, `12,12`, como punto base y escribe dónde va cada copia desde ahí: `96,0`, después `96,56` y después `0,56`. Intro termina las copias.

### Dibuja los ejes [#centreLines]

Haz actual la capa Ejes. Dos líneas con <Command id="LINE" /> se cruzan en el centro del agujero central y sobresalen 6 de su borde: desde `60,14`, `0,52` hacia arriba; desde `34,40`, `52,0` en horizontal. Intro termina cada una.

### Acótala [#dimensions]

Haz actual la capa Cotas. <Command id="DIMLINEAR" /> toma dos puntos y después dónde va la línea de cota: la longitud, de `0,10` a `120,0` más allá, colocada debajo; la altura, a la derecha; la separación entre los agujeros, 96 y 56. Un punto escrito en sus solicitudes no toca ningún objeto, así que cada una de estas cotas se crea no asociativa, y la línea de comandos lo dice. Con <Command id="DIMDIAMETER" /> designas un círculo y colocas su diámetro: el del agujero central y después el de un agujero.
