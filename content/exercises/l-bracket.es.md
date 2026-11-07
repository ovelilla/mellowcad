---
title: "Ejercicio de AutoCAD: una escuadra en L"
metaTitle: "Ejercicio de AutoCAD 2D básico: escuadra en L"
description: "Dibuja una escuadra en L en AutoCAD con coordenadas relativas: su contorno, un empalme, dos agujeros y cotas de línea base, resuelto paso a paso. Gratis online."
figure: "La escuadra en L, de 100 por 80, acotada desde su esquina inferior izquierda."
sourceHash: "5c7cd5d57c92"
---

Dibuja esta escuadra, en milímetros: 100 de largo, un ala horizontal de 20 de alto y un ala vertical de 30 de ancho y 80 de alto, la esquina interior redondeada con un radio de 10, un agujero de 8 en el ala horizontal y otro de 10 en la vertical, cada uno centrado en su ala. El contorno es una sola ejecución de <Command id="LINE" />, cada punto escrito como su desplazamiento desde el anterior, y todas sus cotas parten de la esquina inferior izquierda.

## Steps

### Dibuja el contorno [#outline]

En la capa Contorno, <Command id="LINE" /> desde `0,0` y después cada punto como un desplazamiento desde el anterior: `100,0`, `0,20`, `-70,0`, `0,60` y `-30,0`. <Keyword command="LINE" id="Close" /> dibuja el último lado de vuelta al inicio y termina el comando.

### Redondea la esquina interior [#fillet]

<Command id="FILLET" />: elige <Keyword command="FILLET" id="Radius" />, escribe `10` y designa las dos líneas que se encuentran en la esquina interior, la parte superior del ala horizontal y el lado del ala vertical.

### Dibuja los agujeros [#holes]

Dos círculos con <Command id="CIRCLE" />, cada uno por su <Keyword command="CIRCLE" id="Diameter" />: `8` en `80,10`, en el ala horizontal, y `10` en `15,65`, en la vertical.

### Acótala [#dimensions]

En la capa Cotas, <Command id="DIMLINEAR" /> desde `0,0` hasta el agujero del ala horizontal, `80,10`, colocada debajo: 80. <Command id="DIMBASELINE" /> sigue desde la misma primera línea de referencia: escribe el extremo derecho, `#100,0`, donde # mide desde el origen, y pulsa Intro dos veces para terminarlo. Lo mismo por el lado izquierdo, hasta el agujero de arriba y después hasta lo alto, `#0,80`. <Command id="DIMRADIUS" /> en el empalme y <Command id="DIMDIAMETER" /> en cada agujero la terminan.
