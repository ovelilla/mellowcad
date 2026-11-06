---
title: "Cilindro en AutoCAD: comando CILINDRO (CYLINDER)"
metaTitle: "Cilindro en AutoCAD 3D: CILINDRO (CYLINDER)"
description: "Cómo funciona CILINDRO (CYLINDER, alias CIL) de AutoCAD en español, solicitud a solicitud: base, radio, altura, 3P, 2P, Ttr, Elíptico y Eje. Pruébalo gratis."
figure: "Un cilindro de radio 20 y altura 40, desde el centro de su base, visto desde el sureste con el estilo visual Oculto."
sourceHash: "ce397d8dcb5d"
---

CILINDRO (CYLINDER en inglés) dibuja un cilindro, un sólido 3D: precisa el centro de su base, después el radio y después la altura. La base queda en el plano XY del SCP, a la Z del centro, y la altura sube por su eje Z; una negativa baja, y un punto la da por su distancia a la base, como en <Command id="BOX" />. El radio y la altura se ofrecen como valores por defecto que Intro acepta, compartidos con las demás primitivas y con <Command id="EXTRUDE" />. El cilindro va a la capa actual, y Deshacer lo revierte en un paso.

El cilindro conserva sus medidas: <Command id="LIST" /> muestra su posición, su normal, su radio y su altura, y la paleta Propiedades deja escribir el radio y la altura. Sus pinzamientos lo desplazan, fijan su altura y, en cada cuadrante de la base, su radio. Es un sólido 3D para <Command id="UNION" />, <Command id="SUBTRACT" /> y el resto del 3D de MellowCAD, que es solo de sólidos y aún parcial.

## Options

### 3P

En el centro de la base: pide tres puntos, y la base es el círculo que pasa por ellos, en su plano. Con tres puntos en el plano XY del SCP, el cilindro sigue subiendo por Z.

### 2P

En el centro de la base: pide los dos extremos del diámetro de la base; el segundo se lee en el plano del primero.

### Ttr

En el centro de la base: designa dos líneas, círculos o arcos, con la referencia a objetos Tangente, y precisa un radio: la base toca los dos, lo más cerca posible de los puntos designados, a su altura.

### Elliptical

En el centro de la base: la base es una elipse. Precisa los dos extremos de su primer eje y después el extremo del segundo; o elige <Keyword id="Center" /> y precisa su centro, la mitad de la longitud del primer eje y después el extremo del segundo eje.

### Diameter

En el radio: pide en su lugar el diámetro, y ofrece el doble del último radio.

### 2Point

En la altura: pide dos puntos, y la altura es la distancia entre ellos.

### Axis

En la altura: pide el otro extremo del eje. El cilindro va del centro de la base a ese punto, en cualquier dirección, con la base perpendicular al eje.

## Missing

<Command id="EXPLODE" /> de un cilindro, que AutoCAD convierte en sus dos tapas y una superficie: MellowCAD no tiene superficies, así que dice que no ha podido descomponerlo. Desplazar, Girar, Escalar y Simetría desde un pinzamiento activo, y una altura arrastrada más allá de la base. Las cotas punteadas que AutoCAD dibuja mientras precisas el radio, los puntos de la elipse y el eje. Convertir un cilindro circular en uno elíptico escribiendo en la paleta Propiedades. Las siluetas que dibuja `DISPSILH` en AutoCAD. En planta, donde el círculo de arriba tapa el de la base, la referencia a objetos Cercano encuentra el círculo de la base, donde AutoCAD encuentra el de arriba. Los estilos visuales que le faltan a <Command id="VSCURRENT" /> además de Estructura alámbrica 2D, Oculto y Conceptual.

## Questions

### ¿Cómo se llama el comando CYLINDER en español?

CILINDRO, con el alias `CIL`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_CYLINDER`. Escríbelo y pulsa Intro o la barra espaciadora, y después precisa el centro de la base, el radio y la altura: `0,0`, `20` y `40` dibujan el cilindro de la figura.

### ¿Cómo dibujar un cilindro horizontal?

Elige <Keyword id="Axis" /> en la altura y precisa el otro extremo del eje: desde una base en `0,0,0`, el punto `60,0,0` tumba el cilindro a lo largo de X.

### ¿Cómo hacer un cilindro hueco o un tubo?

Dibuja dos cilindros con el mismo centro, el interior más estrecho, y ejecuta <Command id="SUBTRACT" />: designa el exterior, Intro, el interior, Intro.

### ¿Por qué el cilindro se ve como un círculo?

Lo estás mirando desde arriba, en planta. Gira la vista: una esquina del ViewCube, <Command id="-VIEW" /> y <Keyword command="VIEW" id="SEiso" />, o <Command id="3DORBIT" />.
