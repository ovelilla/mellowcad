---
title: "Chaflán de aristas en AutoCAD 3D: ACHAFLANAARISTA (CHAMFEREDGE)"
metaTitle: "Chaflán en AutoCAD 3D: comando ACHAFLANAARISTA"
description: "Cómo funciona ACHAFLANAARISTA (CHAMFEREDGE) de AutoCAD en español: achaflanar las aristas de una cara de un sólido 3D, Bucle, Distancia1 y Distancia2. Pruébalo."
figure: "Un prisma visto desde el sureste: ACHAFLANAARISTA con las dos distancias a 6 achaflana las dos aristas superiores de su esquina frontal, que se encuentran en una línea."
sourceHash: "43b1908ad4b3"
---

ACHAFLANAARISTA (CHAMFEREDGE en inglés) achaflana las aristas de un sólido 3D. Dice las dos distancias actuales y después pide una arista y, tras la primera, otras de la misma cara, hasta Intro: un clic toma la arista bajo el cursor, y un punto escrito, la arista que pasa por él. Una arista que no comparte ninguna cara con las primeras dice <Message id="edgesOneFace" />, y una de otro sólido, <Message id="chamferMultipleBodies" />. A medida que tomas aristas, el sólido se dibuja como quedará. Después, Intro te pide que pulses Intro otra vez para aceptar, o que cambies las distancias de este chaflán; ese Intro lo crea.

La primera distancia va a lo largo de la cara que comparten las aristas; con una arista sola, a lo largo de la cara que toma AutoCAD: la frontal, en la arista superior frontal de un prisma, y la superior, en el borde de un cilindro. Una arista recta entre dos caras planas se convierte en una franja plana, y la arista circular de un agujero o de un borde, en una franja de cono; los chaflanes que se encuentran en una esquina se unen en una línea. Las distancias se ofrecen de nuevo la próxima vez. El sólido conserva su capa y sus propiedades, pero pierde lo que lo creó: un prisma deja de ser un prisma. Todo el comando es un solo paso de deshacer. El 3D de MellowCAD es solo de sólidos y aún parcial.

## Options

### Loop

Toma todas las aristas alrededor de una cara: designa una arista y después elige <Keyword id="Accept" /> para el bucle que se muestra, o <Keyword id="Next" /> para el bucle de la otra cara a la que pertenece la arista. <Keyword id="Edge" /> vuelve a las aristas sueltas.

### Distance

Pide la primera distancia y después la segunda, cada una escrita o como la distancia entre dos puntos; 0 o menos dice <Message id="distanceTooSmall" />. <Keyword id="Expression" /> toma una como fórmula. En la solicitud de aceptar, pide la distancia de la superficie base y la de la otra superficie, solo para este chaflán.

## Missing

Una esquina donde se encuentran tres aristas achaflanadas. Una arista recta junto a una cara curva, una arista circular fuera del eje de su cilindro y cualquier arista de una esfera, un toroide, una extrusión o un sólido de revolución: aquí fallan con un error de modelado. Los dos pinzamientos de flecha que AutoCAD muestra en la solicitud de aceptar, uno por distancia. <Command id="CHAMFER" /> designando la arista de un sólido, que AutoCAD también permite. El chaflán dibujado como malla mientras designas, y las superficies.

## Questions

### ¿Cómo hacer un chaflán en AutoCAD 3D?

Ejecuta ACHAFLANAARISTA, elige <Keyword id="Distance" /> y da las dos distancias, designa las aristas de una cara y pulsa Intro dos veces: una para terminar de designar y otra para aceptar. El `6` y `6` de la figura achaflanan dos aristas superiores de un prisma.

### ¿Por qué ACHAFLANAARISTA dice que las aristas deben pertenecer a una cara?

Las aristas de un mismo chaflán comparten una cara: la primera distancia va a lo largo de ella. Achaflana las aristas de otra cara en una segunda ejecución.

### ¿Por qué CHAFLAN no funciona en un sólido 3D?

El <Command id="CHAMFER" /> de AutoCAD también achaflana la arista de un sólido, pero el de MellowCAD aún no: usa ACHAFLANAARISTA, y <Command id="FILLETEDGE" /> para redondear una arista.

### ¿Cómo achaflanar la arista de un agujero?

Designa su arista circular, donde se encuentra con la cara plana: el chaflán es una franja de cono alrededor del agujero.
