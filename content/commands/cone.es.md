---
title: "Cono en AutoCAD: comando CONO (CONE)"
metaTitle: "Cono y tronco de cono en AutoCAD: CONO (CONE)"
description: "Cómo funciona CONO (CONE) de AutoCAD en español, solicitud a solicitud: cono o tronco de cono, base, radio, altura, Radio superior, Elíptico y Eje. Pruébalo."
figure: "Un cono de radio 20 y altura 40, desde el centro de su base, visto desde el sureste con el estilo visual Oculto."
sourceHash: "1c40f02e6b3c"
---

CONO (CONE en inglés) dibuja un cono, un sólido 3D: precisa el centro de su base, después el radio y después la altura, y el cono se estrecha hasta un punto. Pide lo mismo que <Command id="CYLINDER" />, con <Keyword id="Top" /> en la altura para un cono truncado. La base queda en el plano XY del SCP, a la Z del centro, y la altura sube por su eje Z; una negativa lo hace apuntar hacia abajo, y un punto la da por su distancia a la base. El radio y la altura se ofrecen como valores por defecto que Intro acepta, compartidos con las demás primitivas. El cono va a la capa actual, y Deshacer lo revierte en un paso.

<Command id="LIST" /> muestra su posición, su normal, el radio de la base, el radio superior y la altura, y la paleta Propiedades deja escribirlos. Sus pinzamientos lo desplazan y fijan su altura, el radio de la base en cada cuadrante de la base y el radio superior. La referencia a objetos Punto final encuentra su vértice. Es un sólido 3D para <Command id="UNION" />, <Command id="SUBTRACT" /> y el resto del 3D de MellowCAD, que es solo de sólidos y aún parcial.

## Options

### 3P

En el centro de la base: pide tres puntos, y la base es el círculo que pasa por ellos, en su plano.

### 2P

En el centro de la base: pide los dos extremos del diámetro de la base.

### Ttr

En el centro de la base: designa dos líneas, círculos o arcos, con la referencia a objetos Tangente, y precisa un radio: la base toca los dos.

### Elliptical

En el centro de la base: la base es una elipse, dada por los dos extremos de su primer eje y el extremo del segundo, o con <Keyword id="Center" /> desde su centro. Un radio superior reduce esa misma elipse.

### Diameter

En el radio: pide en su lugar el diámetro, y ofrece el doble del último radio.

### 2Point

En la altura: pide dos puntos, y la altura es la distancia entre ellos.

### Axis

En la altura: pide el vértice. El cono va del centro de la base a ese punto, en cualquier dirección, con la base perpendicular al eje.

### Top

En la altura: pide el radio superior y después otra vez la altura. El cono termina en un círculo en lugar de en un punto, un tronco de cono; una parte superior tan ancha como la base da los lados de un cilindro, y una más ancha, un cono que se ensancha hacia arriba. Ofrece el radio superior del último cono, 0 al principio.

## Missing

<Command id="EXPLODE" /> de un cono, que AutoCAD convierte en su base y una superficie: MellowCAD no tiene superficies, así que dice que no ha podido descomponerlo. Convertir un cono circular en uno elíptico escribiendo en la paleta Propiedades. Con `ISOLINES` a 0, el punto que AutoCAD dibuja en el vértice. Y lo que le falta a <Command id="CYLINDER" />: Desplazar, Girar, Escalar y Simetría desde un pinzamiento activo, las cotas punteadas mientras precisas el radio y los estilos visuales que le faltan a <Command id="VSCURRENT" />.

## Questions

### ¿Cómo dibujar un cono en AutoCAD?

Ejecuta CONO y precisa el centro de la base, el radio y la altura: `0,0`, `20` y `40` dibujan el cono de la figura. Gira la vista para verlo, con una esquina del ViewCube o con <Command id="-VIEW" /> y <Keyword command="VIEW" id="SEiso" />.

### ¿Cómo dibujar un tronco de cono?

En la altura, elige <Keyword id="Top" />, escribe el radio superior y después la altura. El cono termina en un círculo de ese radio.

### ¿Cómo dibujar un cono invertido?

Escribe una altura negativa: el cono apunta hacia abajo desde su base. O elige <Keyword id="Axis" /> y precisa el vértice donde quieras.

### ¿La base de un cono puede ser una elipse?

Sí: elige <Keyword id="Elliptical" /> en el centro de la base y precisa sus ejes. Con un radio superior, la parte de arriba es la misma elipse, más pequeña.
