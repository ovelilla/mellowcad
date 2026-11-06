---
title: "Pirámide en AutoCAD: comando PIRAMIDE (PYRAMID)"
metaTitle: "Pirámide en AutoCAD 3D: PIRAMIDE (PYRAMID)"
description: "Cómo funciona PIRAMIDE (PYRAMID, alias PIR) de AutoCAD en español, solicitud a solicitud: lados, base, altura, Arista, Inscrito y tronco de pirámide. Pruébalo."
figure: "Una pirámide de seis lados, con 25 del centro de la base al punto medio de cada lado y 40 de altura, vista desde el sureste con el estilo visual Oculto."
sourceHash: "acbc5ffa71cb"
---

PIRAMIDE (PYRAMID en inglés) dibuja una pirámide, un sólido 3D: su primera línea dice cuántos lados tiene la base y cómo se lee su radio, y después pide el centro de la base, el radio y la altura. La base es un polígono regular, como lo dibuja <Command id="POLYGON" />, de 4 lados al principio: un radio escrito lo gira hacia el cursor, y un punto, hacia el propio punto. La altura sube por el eje Z del SCP, una negativa baja, y un punto la da por su distancia a la base. Los lados y el modo de leer el radio se conservan para el siguiente PIRAMIDE; el radio y la altura son los valores por defecto compartidos de las primitivas. La pirámide va a la capa actual, y Deshacer la revierte en un paso.

<Command id="LIST" /> muestra su posición, los dos radios de la base y los de la parte superior, su altura, su rotación y su número de lados, y la paleta Propiedades deja escribir los radios, los lados y la altura. Sus pinzamientos la desplazan, fijan su altura y dan tamaño a la base desde una esquina o desde el punto medio de un lado. Es un sólido 3D para <Command id="UNION" />, <Command id="SUBTRACT" /> y el resto del 3D de MellowCAD, que es solo de sólidos y aún parcial; <Command id="EXPLODE" /> la convierte en una región por cara.

## Options

### Edge

En el centro de la base: pide los dos extremos de un lado de la base, que se dibuja a la izquierda de ese lado.

### Sides

En el centro de la base: pide el número de lados, de 3 a 32, y después otra vez el centro.

### Inscribed

En el radio: lee el radio hasta una esquina de la base, el polígono inscrito en ese círculo, y vuelve a pedirlo.

### Circumscribed

En el radio, una vez elegido <Keyword id="Inscribed" />: lee el radio hasta el punto medio de un lado, el polígono circunscrito a ese círculo, como al principio, y vuelve a pedirlo.

### 2Point

En la altura: pide dos puntos, y la altura es la distancia entre ellos.

### Axis

En la altura: pide el vértice. La pirámide va del centro de la base a ese punto, en cualquier dirección, con la base perpendicular al eje.

### Top

En la altura: pide el radio superior, leído como el de la base, y después otra vez la altura. La pirámide termina en un polígono más pequeño en lugar de en un punto, un tronco de pirámide; una parte superior tan grande como la base da un prisma.

## Missing

Lo que le falta a <Command id="BOX" />: Desplazar, Girar, Escalar y Simetría desde un pinzamiento activo, los comandos 3D propios y los estilos visuales que le faltan a <Command id="VSCURRENT" />. Su tipo, inscrito o circunscrito, escrito en la paleta Propiedades. Las cotas punteadas que AutoCAD dibuja mientras precisas el radio y una arista.

## Questions

### ¿Cómo se llama el comando PYRAMID en español?

PIRAMIDE, con el alias `PIR`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_PYRAMID`. Escríbelo y pulsa Intro o la barra espaciadora, y después precisa el centro de la base, el radio y la altura.

### ¿Cómo dibujar una pirámide hexagonal?

Elige <Keyword id="Sides" /> antes del centro de la base y escribe `6`; después precisa el centro, el radio y la altura: `0,0`, `25` y `40` dibujan la pirámide de la figura. El siguiente PIRAMIDE conserva los seis lados.

### ¿Cómo dibujar una pirámide a partir del lado de la base?

Elige <Keyword id="Edge" /> y precisa los dos extremos de un lado: un lado de `0,0` a `50,0` da una base cuadrada de 50, con los 4 lados por defecto.

### ¿Cómo dibujar un tronco de pirámide?

En la altura, elige <Keyword id="Top" />, escribe el radio superior y después la altura. La pirámide termina en un polígono más pequeño, con tantos lados como la base.
