---
title: "Sección de sólidos en AutoCAD: SECCION (SECTION)"
metaTitle: "Sección de sólidos en AutoCAD: comando SECCION"
description: "Cómo SECCION (SECTION, alias SC) de AutoCAD en español crea la región donde un plano corta sólidos 3D: 3puntos, Objeto, ejeZ, Vista, XY, YZ o ZX. Pruébalo."
figure: "Una pieza con un agujero pasante, cortada por el plano ZX que pasa por el centro del agujero: SECCION crea el perfil, desplazado hacia delante, dos rectángulos con el hueco del agujero entre ellos."
sourceHash: "f1c01b76c810"
---

SECCION (SECTION en inglés) crea una sección transversal de sólidos 3D: una región donde un plano corta cada uno, y los sólidos se quedan como estaban. Pide los sólidos, hasta Intro: como en AutoCAD 2027, descarta el conjunto designado antes del comando y vuelve a pedirlo, pasa por alto lo que no es un sólido, y un conjunto sin ninguno dice <Message id="noSolidsSelected" />. Después, el plano: por defecto das tres puntos de él, y las opciones lo dan de otro modo, como en <Command id="SLICE" />.

Cada sólido que el plano corta recibe su región, que queda en el plano: una pieza con un agujero pasante da el contorno con el hueco del agujero, y un cilindro cortado a lo largo de su eje, un rectángulo. Un plano sobre una de las caras de un sólido da esa cara. Uno que el plano no toca dice <Message id="sectionMissedOne" />. Las regiones toman la capa y las propiedades actuales, no las del sólido; <Command id="MOVE" /> saca una para verla, <Command id="AREA" /> y <Command id="MASSPROP" /> la miden, y <Command id="EXTRUDE" /> la convierte en un sólido. Todo el comando es un solo paso de deshacer. El 3D de MellowCAD es solo de sólidos y aún parcial.

## Options

### Object

Toma el plano de un objeto que designas: un círculo, una elipse, un arco, una spline 2D o una polilínea 2D.

### Zaxis

Pide un punto del plano y después un punto de su eje Z, la recta perpendicular a él.

### View

El plano paralelo a la pantalla, por un punto que das.

### XY

El plano XY del SCP, por un punto que das: un punto a cierta altura da una sección horizontal a esa altura. Intro toma el origen del SCP.

### YZ

El plano YZ del SCP, por un punto que das; Intro toma el origen del SCP.

### ZX

El plano ZX del SCP, por un punto que das; Intro toma el origen del SCP. La sección de la figura es este plano por el centro del agujero.

### 3points

Tres puntos del plano, que entonces puede inclinarse en cualquier dirección. Es la opción por defecto de la primera solicitud, así que un punto ahí es el primero de los tres.

## Missing

Las superficies y las mallas, que MellowCAD no tiene. Una polilínea 3D plana como objeto del plano, que AutoCAD admite. Los cortes para los que MellowCAD aún no tiene una forma exacta, como en <Command id="SLICE" />, que dicen que ha fallado una operación booleana. SECTIONPLANE y la sección automática, que la cinta de opciones de AutoCAD ofrece en lugar de SECCION: aquí SECCION se escribe.

## Questions

### ¿Cómo hacer una sección de un sólido 3D en AutoCAD?

Ejecuta SECCION, designa el sólido y pulsa Intro, y después da el plano: <Keyword id="ZX" /> y un punto en el centro lo cortan de delante atrás, <Keyword id="XY" /> y un punto a cierta altura lo cortan en horizontal. La región queda dentro del sólido: sácala con <Command id="MOVE" /> para verla.

### ¿Qué diferencia hay entre SECCION y CORTE?

<Command id="SLICE" /> corta el sólido en dos y conserva una parte o las dos. SECCION deja el sólido entero y dibuja una región donde el plano lo corta.

### ¿Cómo se llama el comando SECTION en español?

SECCION, con el alias `SC`: escríbelo y pulsa Intro o la barra espaciadora. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_SECTION`.

### ¿Por qué SECCION dice que el plano no interseca el sólido?

Porque el plano no lo toca: revisa cómo lo diste. <Keyword id="XY" />, <Keyword id="YZ" /> y <Keyword id="ZX" /> son los planos del SCP, así que un punto a una altura o en un lado equivocados deja el plano fuera del sólido.
