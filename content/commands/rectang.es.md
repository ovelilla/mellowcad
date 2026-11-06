---
title: "Rectángulo en AutoCAD: RECTANG"
metaTitle: "Rectángulo en AutoCAD: comando RECTANG"
description: "Cómo dibuja RECTANG (alias REC) un rectángulo en AutoCAD en español: dos esquinas, Cotas, Área y Rotación, con empalme o chaflán. Pruébalo gratis online."
figure: "Dos rectángulos por dos esquinas, la segunda escrita respecto a la primera: uno con Empalme 8 y el siguiente con Chaflán 8."
sourceHash: "a5d4e90c06aa"
---

RECTANG dibuja un rectángulo a partir de dos esquinas opuestas, señaladas o escritas: `0,0` y después `100,50`, relativa a la primera con la entrada dinámica, hace uno de 100 por 50. Es una sola polilínea cerrada de cuatro vértices, en la capa actual. Las opciones de la primera solicitud fijan cómo se dibujan los rectángulos siguientes, y cada una conserva su valor el resto de la sesión: el siguiente RECTANG dice en su primera línea las que están en vigor. Su opción de grosor da a cada lado un grosor de polilínea. Mientras colocas la otra esquina, el rectángulo sigue al cursor; con la entrada dinámica activada, puedes escribir su longitud, Tab y su anchura.

## Options

### Chamfer

Pide una primera y una segunda distancia de chaflán, y corta cada esquina con ellas: ocho vértices. Una distancia de 0 lo desactiva. Sustituye al empalme.

### Elevation

Pide la altura a la que se dibuja el rectángulo, su Z.

### Fillet

Pide un radio y redondea cada esquina con él. Un radio de 0 lo desactiva. Sustituye al chaflán.

### Thickness

Pide una altura de objeto: el rectángulo se levanta esa altura, como un muro, en una vista 3D.

### Area

En la otra esquina: pide el área, después si darás la <Keyword id="Length" /> o la <Keyword id="Width" />, y después ese lado. El otro lado se calcula, contando las esquinas, y el rectángulo se crea al momento.

### Dimensions

En la otra esquina: pide la longitud y la anchura, y después un punto que fija hacia qué lado de la primera esquina queda el rectángulo.

### Rotation

En la otra esquina: pide el ángulo al que se gira el rectángulo, escrito o como un punto desde la primera esquina, o dos puntos con <Keyword id="Pick" />. El ángulo se conserva durante la sesión.

## Missing

Una longitud o anchura de 0 en <Keyword id="Area" />, que aquí no dibuja nada y en AutoCAD dibuja una polilínea rota. Tras una respuesta rechazada en la solicitud de rotación, MellowCAD vuelve a hacer la solicitud entera, donde AutoCAD no escribe nada más.

## Questions

### ¿Cómo se llama el comando del rectángulo en AutoCAD en español?

RECTANG, igual que en inglés, con los alias `REC` y `RECTANGLE`. También funciona con un guion bajo delante, en cualquier idioma: `_RECTANG`.

### ¿Cómo dibujo un rectángulo con medidas exactas?

Da la primera esquina y escribe la otra respecto a ella: `100,50` con la entrada dinámica activada, como al empezar, o `@100,50` sin ella, lo hace de 100 de largo y 50 de ancho. O elige <Keyword id="Dimensions" /> y escribe los dos lados.

### ¿Cómo dibujo un rectángulo con las esquinas redondeadas?

Elige <Keyword id="Fillet" /> en la primera solicitud y escribe el radio; después da las dos esquinas.

### ¿Por qué el rectángulo me sale con las esquinas redondeadas o cortadas?

RECTANG conserva el empalme y el chaflán durante la sesión, así que un rectángulo dibujado después de uno con ellos también los lleva: su primera línea lo dice. Elige <Keyword id="Fillet" /> y escribe `0` para volver a dibujar esquinas vivas.

### ¿Un rectángulo es una polilínea en AutoCAD?

Sí: una sola polilínea cerrada. <Command id="EXPLODE" /> la descompone en cuatro líneas, y <Command id="OFFSET" /> la desfasa entera.
