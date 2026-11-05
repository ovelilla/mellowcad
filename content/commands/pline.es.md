---
title: "Polilínea en AutoCAD: POL (PLINE)"
metaTitle: "Polilínea en AutoCAD: comando POL (PLINE)"
description: "Cómo funciona POL (PLINE, alias PL) de AutoCAD en español, solicitud a solicitud: líneas y arcos, Grosor, Longitud y Cerrar. Pruébalo gratis online."
figure: "Una línea, un arco tangente y una línea de vuelta, y una punta de grosor 10 a 0: una sola polilínea."
sourceHash: "216b83656483"
---

POL (PLINE en inglés) dibuja una polilínea: un solo objeto hecho de segmentos rectos y arcos unidos por sus extremos, cada uno con su grosor. Tras el punto inicial dice el grosor actual; después cada punto añade un segmento, hasta que Intro o <Keyword id="Close" /> lo terminan. Como en AutoCAD, empieza con líneas: <Keyword id="Arc" /> pasa a arcos, cada uno tangente al segmento anterior, y <Keyword id="Line" /> vuelve a las líneas. Intro en el punto inicial continúa desde el final de la última línea, arco o polilínea dibujados.

## Options

### Arc

Modo arco: cada punto final dibuja un arco tangente al último segmento o, si es el primero, saliendo en la dirección en que termina la última línea, arco o polilínea dibujados. Mantén pulsada la tecla Ctrl para cambiar su sentido. Las opciones siguientes dan forma al próximo arco.

### Close

Aparece en cuanto hay un segmento: cierra la polilínea hasta su inicio y termina el comando; en modo arco, con un arco tangente.

### Halfwidth

Como <Keyword id="Width" />, pero cada grosor se mide desde el centro del segmento hasta su borde.

### Length

Una línea de la longitud que indiques, en la dirección que lleva la polilínea: a lo largo del último segmento, o tangente al último arco. Una longitud negativa va hacia atrás.

### Undo

Deshace el último segmento y sigue en el modo del anterior. Si no queda ninguno, dice <Message id="allSegmentsUndone" />

### Width

El grosor inicial y después el final, cada uno escrito o precisado desde el último vértice: de 10 a 0 se estrecha hasta un punto, como una punta de flecha. El grosor final sigue en los segmentos siguientes y, como PLINEWID, en la siguiente polilínea.

### Angle

Modo arco: el ángulo incluido del arco y después su punto final, su centro o su radio.

### Center

Modo arco: el centro del arco y después su punto final, su ángulo incluido o la longitud de su cuerda.

### Direction

Modo arco: la dirección en que el arco sale del último vértice, en lugar de la tangente, y después su punto final.

### Line

Modo arco: vuelve a los segmentos rectos.

### Radius

Modo arco: el radio del arco y después su punto final o su ángulo incluido. Un radio negativo dibuja el arco mayor.

### Second pt

Modo arco: un punto por el que pasa el arco y después su punto final: un arco por tres puntos.

## Missing

PLINEGEN: una polilínea nueva aplica su tipo de línea segmento a segmento, como con PLINEGEN 0 (<Keyword command="PEDIT" id="Ltype gen" /> de <Command id="PEDIT" /> lo activa en una polilínea). Un tipo de línea discontinuo sobre un segmento con grosor se dibuja continuo. La vista previa de un segmento con grosor no se dibuja en un tono más tenue, y la solicitud del arco se escribe en una sola línea donde AutoCAD la parte en dos.

## Questions

### ¿Cómo se llama el comando PLINE en español?

POL, con el alias `PL`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_PLINE`.

### ¿Cómo hago una polilínea curva?

Elige <Keyword id="Arc" />: cada punto termina entonces un arco tangente al segmento anterior, hasta <Keyword id="Line" />. Para suavizar por sus vértices una polilínea ya dibujada, usa <Command id="PEDIT" /> y su opción <Keyword command="PEDIT" id="Fit" /> o <Keyword command="PEDIT" id="Spline" />.

### ¿Por qué la polilínea me sale gruesa?

El grosor dado en una polilínea anterior se mantiene, y la siguiente empieza con él, como dice la línea que sigue a su punto inicial. Elige <Keyword id="Width" /> y da 0 dos veces para volver a dibujarla fina. Con <Command id="FILL" /> desactivado, las polilíneas con grosor se ven sin relleno, solo su contorno.

### ¿Cómo uno varias líneas en una polilínea?

Ejecuta <Command id="JOIN" /> y designa líneas, arcos y polilíneas que se toquen por sus extremos: cada cadena se convierte en una polilínea. O ejecuta <Command id="PEDIT" /> sobre una línea, responde <Keyword command="PEDIT" id="Yes" /> para convertirla en polilínea y añade las demás con <Keyword command="PEDIT" id="Join" />.

### ¿Cómo mido una polilínea?

Ejecuta <Command id="AREA" />, pulsa Intro para elegir <Keyword command="AREA" id="Object" /> y designa la polilínea: una cerrada da su área y su perímetro; una abierta, su longitud.
