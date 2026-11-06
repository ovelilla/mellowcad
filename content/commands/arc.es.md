---
title: "Arco en AutoCAD: comando ARCO (ARC)"
metaTitle: "Arco en AutoCAD: comando ARCO (ARC)"
description: "Cómo funciona ARCO (ARC, alias A) de AutoCAD en español, solicitud a solicitud: tres puntos, inicio-centro-fin o centro-inicio-fin, y Ctrl. Pruébalo gratis."
figure: "Tres arcos: por tres puntos, de un inicio alrededor de un Centro hasta un final, y de un Centro, su inicio y después su final."
sourceHash: "af9b22e35456"
---

ARCO (ARC en inglés) dibuja por defecto un arco por tres puntos: su inicio, un punto por el que pasa y su final. O lo dibuja alrededor de un centro, de un punto inicial a un final, como lo ejecutan los botones Inicio, centro, fin y Centro, inicio, fin de la cinta de opciones. Como en AutoCAD, un arco dado por su centro va en sentido contrario a las agujas del reloj desde su inicio, y el final solo marca dónde se detiene: no tiene por qué estar sobre el arco. Mientras precisas los puntos, el arco sigue al cursor, con una línea discontinua ámbar desde el inicio o el centro. El arco queda en el plano de su primer punto. Un arco que no se puede hacer, tres puntos en línea o un final sobre el inicio, dice <Message id="invalid" /> y no dibuja nada.

## Options

### Center

En la primera solicitud: da primero el centro, después el punto inicial y el final. En la segunda, tras el inicio: el centro va a continuación, y después el final. Al final de cualquiera de los dos, mantén pulsada Ctrl para que el arco vaya en el sentido de las agujas del reloj.

## Missing

Las opciones que terminan un arco por su ángulo, la longitud de su cuerda, una dirección o un radio en lugar de un punto final, y Fin en el segundo punto, que lleva a ellas; tampoco están los botones de la cinta para esas formas. Continuar: Intro en la primera solicitud, que en AutoCAD dibuja un arco tangente a la última línea o arco, aquí termina ARCO. El cuadro del ángulo incluido que muestra la entrada dinámica al final de un modo con centro.

## Questions

### ¿Cómo se llama el comando ARC en español?

ARCO, con el alias `A`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_ARC`.

### ¿Cómo dibujo un arco por tres puntos?

Ejecuta ARCO y da tres puntos: el inicio, cualquier punto por el que pase el arco y el final. Es la forma por defecto, sin elegir ninguna opción.

### ¿Por qué el arco me sale al revés?

Un arco dibujado por su centro va en sentido contrario a las agujas del reloj desde su inicio, como en AutoCAD. Cambia el inicio por el final, o mantén pulsada Ctrl mientras das el punto final para que vaya en el sentido de las agujas del reloj.

### ¿Cómo dibujo un arco tangente a dos líneas?

Con <Command id="FILLET" /> y un radio: dibuja el arco tangente a las dos líneas y las recorta hasta él. Para un arco tangente al tramo anterior, dibújalo en una polilínea, con la opción de arco de <Command id="PLINE" />.
