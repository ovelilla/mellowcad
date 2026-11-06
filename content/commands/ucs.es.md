---
title: "SCP en AutoCAD: comando SCP (UCS)"
metaTitle: "SCP en AutoCAD: comando SCP (UCS) y sus opciones"
description: "Cómo funciona SCP (UCS) de AutoCAD en español: origen y 3 puntos, Objeto, Vista, girar en X, Y y Z, ejeZ, los SCP guardados y el Universal. Pruébalo gratis."
figure: "Un prisma visto desde el sureste: SCP desplaza el origen a su cara superior, y un círculo dibujado después en 30,20 queda sobre esa cara, no en el suelo."
sourceHash: "8ac3b844fe16"
---

SCP (UCS en inglés) define el sistema de coordenadas personales: un origen y unos ejes X e Y en cualquier lugar del espacio, de modo que su plano XY puede inclinarse. Las coordenadas que escribes se leen en él, y lo que dibujas queda en su plano XY: con el origen desplazado a la cara superior de un prisma, un círculo con centro en `30,20` queda sobre esa cara. Primero dice el nombre del SCP actual —`*UNIVERSAL*`, `*SIN NOMBRE*` o el nombre con el que se guardó— y después pide el nuevo origen o una opción; Intro ahí vuelve al SCU. Un punto es el origen, con su Z, y un punto sin Z queda a la elevación actual. Después, un punto en la parte positiva del eje X y un punto en el plano XY, leídos en el SCP actual: Intro en cualquiera de los dos conserva los ejes como están. Un punto desplaza el SCP; tres lo giran en cualquier dirección.

Los comandos trabajan entonces en el plano XY del SCP: <Command id="LINE" /> y <Command id="CIRCLE" /> dibujan en él, y <Command id="BOX" /> y <Command id="EXTRUDE" /> suben desde él a lo largo de su Z. Cada objeto conserva su propio plano cuando cambia el SCP, y <Command id="PLAN" /> mira en perpendicular al SCP actual. El SCP se guarda en el dibujo, y cada ejecución es un paso de deshacer. El 3D de MellowCAD es solo de sólidos y aún parcial.

## Options

### Face

Aparece como en AutoCAD 2027, para alinear el SCP con una cara de un sólido. MellowCAD pide la cara, pero aún no se alinea con ninguna: ninguna designación encuentra una.

### NAmed

Los SCP guardados, por nombre. <Keyword id="Save" /> guarda el actual, y pregunta <Keyword id="Yes" /> o <Keyword id="No" /> antes de sustituir un nombre ya guardado; <Keyword id="Restore" /> hace actual uno guardado, con su nombre escrito en mayúsculas o en minúsculas; <Keyword id="Delete" /> admite nombres, con comas y comodines; <Keyword id="?" /> los lista, cada uno con su origen y sus ejes. Un nombre admite espacios, pero no `<>/\":;|,=*?` ni un acento grave: <Message id="invalidUcsName" />.

### OBject

Alinea el SCP con un objeto que designas: una línea, un círculo, un arco, una elipse, una polilínea, una spline, un texto, un texto de líneas múltiples, una definición de atributo o una referencia a bloque. El origen y el eje X van donde AutoCAD los pone para cada tipo, y el eje Z es la normal del propio objeto, así que el SCP queda en el plano del objeto. Se puede designar un objeto de una capa bloqueada. Un sombreado dice <Message id="ucsNoCoordinateSystem" />, y SCP termina con el SCP como estaba.

### Previous

Vuelve al SCP anterior, hasta diez atrás en una sesión, incluidos los guardados con nombre y los ortogonales. Si no queda ninguno: <Message id="noPreviousUcs" />.

### View

Pone el plano XY perpendicular a tu línea de visión, con X en la horizontal de la pantalla, y conserva el origen: el texto que dibujas después se lee plano en la pantalla de una vista 3D.

### World

Vuelve al sistema de coordenadas universal (SCU), que nunca se mueve. Es la opción por defecto de la primera solicitud, así que Intro la elige, y también devuelve la elevación a 0.

### X

Gira el SCP alrededor de su eje X: 90 grados por defecto, un ángulo escrito o un punto que lo da. Un ángulo positivo lo gira según la regla de la mano derecha, así que 90 levanta el plano XY sobre el antiguo eje X.

### Y

Gira el SCP alrededor de su eje Y, como <Keyword id="X" /> alrededor de X.

### Z

Gira el SCP alrededor de su eje Z, como <Keyword id="X" /> alrededor de X: 30 gira X e Y 30 grados en sentido contrario a las agujas del reloj, visto desde arriba.

### ZAxis

Un nuevo origen, o Intro para conservar el actual, y después un punto en la parte positiva del eje Z: el plano XY queda perpendicular a él, con su X horizontal respecto al plano XY universal. Dos puntos que coinciden dicen <Message id="pointsAreCoincident" />. Su <Keyword id="Object" /> admite una línea, un arco, una polilínea abierta o una spline: el origen en el extremo más cercano al punto designado, y el eje Z a lo largo del objeto, alejándose de él.

## Missing

<Keyword id="Face" />, que alinea el SCP con una cara de un sólido: la pide, pero aún no encuentra ninguna. Aplicar y Sección, que la primera solicitud admite y aquí se rechazan, porque hay una sola ventana gráfica y no hay objetos de sección. El cuadro de diálogo SCP (UCSMAN), los pinzamientos del icono y su menú contextual, y el icono mostrando el nuevo SCP mientras lo colocas. La cruz del cursor girando con el SCP: se queda recta en la pantalla hasta que <Command id="PLAN" /> alinea la vista con él. UCSFOLLOW, UCSVP y el SCP dinámico. <Keyword id="OBject" /> sobre una cota, y Grupo en su designación. La profundidad que conserva un SCP ortogonal. La pausa en una lista larga, que espera a que pulses Intro para continuar.

## Questions

### ¿Cómo volver al SCU (Universal) en AutoCAD?

Ejecuta SCP y pulsa Intro: <Keyword id="World" /> es la opción por defecto. Para volver a mirar el dibujo en planta, ejecuta <Command id="PLAN" /> y elige <Keyword command="PLAN" id="World" />.

### ¿Cómo girar el SCP en AutoCAD?

Ejecuta SCP, elige <Keyword id="Z" /> y escribe el ángulo: `30` gira X e Y 30 grados en sentido contrario a las agujas del reloj. <Keyword id="X" /> e <Keyword id="Y" /> levantan el plano XY, 90 grados por defecto.

### ¿Qué diferencia hay entre el SCP y el SCU?

El sistema de coordenadas universal (SCU) nunca se mueve; el sistema de coordenadas personales (SCP) es el que desplazas y giras. Al principio coinciden, y SCP dice que el actual es `*UNIVERSAL*`. Las coordenadas que escribes se leen en el SCP, y lo que dibujas queda en su plano XY.

### ¿Cómo dibujar en una cara de un sólido 3D?

Lleva el SCP hasta ella. En la cara superior de un prisma basta con su origen: SCP, una esquina de la cara superior e Intro, como en la figura. Para un lado, da tres puntos: el origen en una esquina, un punto a lo largo de una arista para X y otro más en la cara para Y. Después dibuja: lo que dibujas queda en la cara.
