---
title: "Sólidos de revolución en AutoCAD: REVOLUCION (REVOLVE)"
metaTitle: "Revolución en AutoCAD: REVOLUCION (REVOLVE)"
description: "Cómo funciona REVOLUCION (REVOLVE, alias RV) de AutoCAD en español: un sólido 3D de revolución a partir de un perfil 2D, el eje y el ángulo. Pruébalo gratis."
figure: "Un perfil escalonado girado una vuelta entera alrededor del eje Y: un carrete, visto desde el sureste con el estilo visual Oculto."
sourceHash: "dc0576311912"
---

REVOLUCION (REVOLVE en inglés) gira perfiles 2D cerrados alrededor de un eje y los convierte en sólidos 3D: un rectángulo con una arista sobre el eje da un cilindro; un círculo a su lado, un anillo. Designa los perfiles —círculos, elipses, polilíneas o splines cerradas, regiones— y pulsa Intro; precisa el eje con dos puntos o con una de sus opciones, y después el ángulo: Intro da una vuelta entera. Cada perfil se convierte en un sólido en la capa actual y se borra, como indica DELOBJ por defecto. El comando entero es un paso que Deshacer revierte.

El eje está en el plano del perfil, con todo el perfil a un lado, o el comando termina con <Message id="revolveOneSide" /> antes de pedir ningún ángulo. El ángulo gira según la regla de la mano derecha alrededor del eje, de su primer punto al segundo; uno negativo gira al revés. El 3D de MellowCAD es solo de sólidos, y aún parcial: los perfiles abiertos, que AutoCAD convierte en superficies, se rechazan.

## Options

### MOde

Pide <Keyword id="SOlid" /> o <Keyword id="SUrface" />, como <Command id="EXTRUDE" />: sin objetos de superficie todavía, solo se acepta <Keyword id="SOlid" />, la opción por defecto.

### Object

La opción por defecto de la solicitud del eje, así que Intro la elige: designa una línea, una polilínea, un arco o una spline, y el eje va en línea recta entre sus dos extremos, desde el más cercano al punto designado. Un objeto cerrado no tiene extremos: <Message id="revolveClosedAxis" />, y el comando termina.

### X

El eje X del SCP, por su origen.

### Y

El eje Y del SCP, por su origen: un perfil dibujado a su derecha, como en la sesión, se convierte en una pieza tumbada a lo largo de Y.

### Z

El eje Z del SCP, por su origen. Un perfil en el plano XY del SCP es perpendicular a él, así que REVOLUCION responde <Message id="revolvePerpendicular" /> y termina: Z es para un perfil que está de pie.

### STart

En la solicitud del ángulo: el ángulo desde el que empezar, siempre 0 por defecto. El perfil se gira primero hasta allí y después se vuelve a pedir el ángulo.

### Reverse

Invierte el eje, de modo que el ángulo gira al revés, y vuelve a pedir el ángulo.

### EXpression

El ángulo como expresión aritmética, como en <Command id="EXTRUDE" />.

## Missing

Un eje fuera del plano del perfil, alrededor del cual AutoCAD gira el perfil y crea superficies: aquí REVOLUCION dice <Message id="revolveUnable" /> y termina. Un arco elíptico o una arista de un sólido como eje de <Keyword id="Object" />. El modo <Keyword id="SUrface" /> y los perfiles abiertos, sin objetos de superficie todavía. La vista previa que gira con el cursor: mientras precisas el ángulo, se muestra la vuelta entera. <Command id="EXPLODE" /> de un sólido de revolución, que AutoCAD convierte en superficies y regiones. Sus pinzamientos, y su ángulo editado en la paleta Propiedades.

## Questions

### ¿Cómo se llama el comando REVOLUCION en inglés?

REVOLVE. En AutoCAD en español es REVOLUCION, con el alias `RV`, y el nombre inglés también funciona en cualquier idioma con un guion bajo delante: `_REVOLVE`.

### ¿Cómo hacer un sólido de revolución?

Dibuja media sección como un solo objeto cerrado junto a la línea del eje: una polilínea cerrada o una región. Ejecuta REVOLUCION, designa el perfil y pulsa Intro; pulsa Intro otra vez para <Keyword id="Object" /> y designa la línea del eje, o precisa sus dos extremos; después, Intro para una vuelta entera.

### ¿Por qué no funciona REVOLUCION?

Casi siempre, porque el eje cruza el perfil: REVOLUCION dice <Message id="revolveOneSide" /> y termina. Lleva el eje al borde del perfil o más allá; una arista sobre el eje está permitida. Un eje perpendicular al plano del perfil recibe <Message id="revolvePerpendicular" />, y un perfil abierto se rechaza, porque MellowCAD aún no tiene superficies.

### ¿Cómo hacer una revolución de menos de 360 grados?

Escribe el ángulo, 90 o 270, en la solicitud del ángulo. <Keyword id="STart" /> empieza el giro más adelante, e <Keyword id="Reverse" /> lo hace girar al revés.
