---
title: "Empalme de aristas en AutoCAD 3D: ARISTAEMPALME (FILLETEDGE)"
metaTitle: "Empalme en AutoCAD 3D: comando ARISTAEMPALME"
description: "Cómo funciona ARISTAEMPALME (FILLETEDGE) de AutoCAD en español: redondear aristas de un sólido 3D con Cadena, Bucle, Radio y el pinzamiento de flecha. Pruébalo."
figure: "Un prisma visto desde el sureste: ARISTAEMPALME con un radio de 8 redondea sus dos aristas verticales de la derecha."
sourceHash: "403a055efb24"
---

ARISTAEMPALME (FILLETEDGE en inglés) redondea las aristas de un sólido 3D. Dice el radio actual y después pide aristas, hasta Intro: un clic toma la arista bajo el cursor, que se ilumina al pasar por encima, y un punto escrito toma la arista que pasa por él. A medida que tomas aristas, el sólido se dibuja como quedará, con los empalmes en su sitio. Intro cuenta las aristas y te pide que pulses Intro otra vez para aceptar, o que cambies el radio; ese Intro crea los empalmes. Solo aristas de un mismo sólido: una de otro dice <Message id="filletMultipleBodies" />, y una tomada dos veces, <Message id="edgeAlreadyPicked" />.

Una arista recta entre dos caras planas se convierte en un cuarto de cilindro, y la arista circular de un agujero o de un borde, en un cuarto de toroide; los empalmes que se encuentran en una esquina se unen, y si son tres, con un trozo de esfera. El radio se guarda en el dibujo y se ofrece de nuevo la próxima vez. El sólido conserva su capa y sus propiedades, pero pierde lo que lo creó: un prisma deja de ser un prisma. Todo el comando es un solo paso de deshacer. El 3D de MellowCAD es solo de sólidos y aún parcial.

## Options

### Chain

Toma la arista que designas y todas las aristas tangentes a ella, una tras otra: las ocho que rodean la cara superior de una pieza cuyas aristas verticales ya están redondeadas. Si no hay ninguna tangente, dice <Message id="noTangentChainEdges" /> y toma la designada. <Keyword id="Edge" /> vuelve a las aristas sueltas.

### Loop

Toma todas las aristas alrededor de una cara: designa una arista y después elige <Keyword id="Accept" /> para el bucle que se muestra, o <Keyword id="Next" /> para el bucle de la otra cara a la que pertenece la arista.

### Radius

Pide el radio, escrito o como la distancia entre dos puntos; 0 o menos dice <Message id="radiusTooSmall" />. <Keyword id="Expression" /> lo toma como una fórmula. En la solicitud de aceptar, cambia el radio de los empalmes que se muestran. El pinzamiento de flecha en el centro del primer empalme lo fija arrastrando: haz clic en él, mueve el cursor y haz clic; <Keyword id="eXit" /> o Esc lo deja como estaba.

## Missing

Empalmes de dos radios que se encuentran, y un empalme que termina en una cara curva. Un empalme más ancho que una cara contigua, que AutoCAD hace rodar sobre la arista siguiente: aquí falla con un error de modelado. Una arista recta junto a una cara curva, una arista circular fuera del eje de su cilindro y cualquier arista de una esfera, un toroide, una extrusión o un sólido de revolución, que fallan del mismo modo. Algunas esquinas donde se encuentran empalmes sobre aristas de distinta pendiente. El pinzamiento de flecha en cualquier arista que no sea la primera, y la línea que va de él al cursor. <Command id="FILLET" /> designando la arista de un sólido, que AutoCAD también permite. El empalme dibujado como malla mientras designas, y las superficies.

## Questions

### ¿Cómo empalmar aristas de un sólido 3D en AutoCAD?

Ejecuta ARISTAEMPALME, elige <Keyword id="Radius" /> y escríbelo, designa las aristas y pulsa Intro dos veces: una para terminar de designar y otra para aceptar. El `8` de la figura redondea dos aristas de un prisma.

### ¿Cómo empalmar todas las aristas de una cara?

Elige <Keyword id="Loop" /> y designa una arista de la cara; después <Keyword id="Accept" />, o <Keyword id="Next" /> si el bucle que se muestra es el de la otra cara. Para aristas que ya fluyen unas en otras, como el contorno superior de una pieza con las esquinas redondeadas, <Keyword id="Chain" /> las toma todas.

### ¿Por qué EMPALME no funciona en un sólido 3D?

El <Command id="FILLET" /> de AutoCAD también redondea la arista de un sólido, pero el de MellowCAD aún no: usa ARISTAEMPALME, y <Command id="CHAMFEREDGE" /> para un bisel.

### ¿Cómo cambiar el radio del empalme?

Elige <Keyword id="Radius" /> antes de designar o en la solicitud de aceptar, o arrastra el pinzamiento de flecha del centro del primer empalme. El último radio se ofrece la próxima vez.
