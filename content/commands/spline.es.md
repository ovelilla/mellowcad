---
title: "Comando SPLINE en AutoCAD: curvas spline"
metaTitle: "Comando SPLINE en AutoCAD: curvas spline"
description: "Cómo funciona SPLINE (SPL) de AutoCAD en español: una curva por puntos de ajuste o por vértices de control, Nudos, Grado, tangentes y Cerrar. Pruébalo gratis."
figure: "Una spline de ajuste por cinco puntos y, debajo, una spline de VC sobre cinco vértices puestos igual: la primera pasa por ellos, la segunda se acerca a ellos."
sourceHash: "1056b5067125"
---

SPLINE dibuja una curva suave de una de dos maneras: pasando por los puntos que das (Ajustar, la opción por defecto) o atraída por los vértices de control que colocas (VC). Empieza diciendo sus parámetros, `Método=Ajustar Nudos=Cuerda`, y pide el primer punto; Intro ahí no se admite, como en AutoCAD. Cada punto siguiente curva la spline, cuya imagen sigue al cursor, e Intro la termina. Los puntos se señalan, con o sin referencia a objetos, o se escriben; una longitud escrita va en la dirección del cursor y cada punto conserva su Z, así que una spline puede subir en el espacio. Esc descarta la curva; la spline entera es un solo paso que <Command id="U" /> deshace. Los botones Spline de ajuste y Spline de VC de la cinta de opciones ejecutan SPLINE con el método ya respondido.

## Options

### Method

<Keyword id="Fit" /> o <Keyword id="CV" />. Una spline de ajuste pasa por cada punto que das; una de vértices de control pasa solo por el primero y el último, y los demás tiran de ella, así que sale más suave y más lejos de ellos. El método, como los nudos y el grado, se mantiene el resto de la sesión.

### Knots

Cómo reparte una spline de ajuste sus puntos a lo largo de la curva: <Keyword id="Chord" /> (por defecto, según la distancia entre ellos), <Keyword id="Square root" /> de esa distancia o <Keyword id="Uniform" />, todos iguales. Por los mismos puntos, cada uno da una curva algo distinta.

### Degree

El grado de una spline de VC, de 1 (rectas entre los vértices) a 10; 3, por defecto, es una cúbica. Con menos vértices de los que pide el grado, la curva toma el mayor que puede.

### Object

Convierte una polilínea ajustada con la opción Spline de <Command id="PEDIT" />, 2D o 3D, en una spline de VC de la misma curva y borra la polilínea, en un solo paso. Cualquier otra cosa se rechaza con <Message id="onlySplineFittedPolylines" />.

### start Tangency

Se ofrece tras el primer punto: la dirección en la que la curva sale de él, señalada o escrita desde ese punto.

### end Tangency

La dirección en la que la curva llega a su último punto; después la spline termina.

### Undo

Deshace el último punto, hasta el primero.

### Close

Desde el tercer punto: une el final con el principio en un bucle suave, sin esquina, y termina el comando.

## Missing

La tolerancia de ajuste: una spline de ajuste pasa siempre exactamente por sus puntos, y no se ofrece la opción de tolerancia. Mientras se dibuja, la spline aún no es un objeto al que forzar o rastrear, como sí lo es en AutoCAD. Objeto borra siempre la polilínea (DELOBJ). En una spline terminada no hay CVSHOW ni CVHIDE ni menús de pinzamientos para añadir o quitar un punto; la paleta Propiedades edita sus puntos, pero no su método, grado, nudos, pesos ni su cierre, y Centro geométrico, Perpendicular y Tangente no la encuentran. <Command id="HATCH" /> no reconoce una spline como contorno, y BLEND aún no existe.

## Questions

### ¿Cuál es el atajo de SPLINE en AutoCAD?

`SPL`, y después Intro o la barra espaciadora. El comando se llama igual en AutoCAD en español, y `_SPLINE` funciona en cualquier idioma.

### ¿Qué diferencia hay entre Ajustar y VC?

Una spline de ajuste pasa por los puntos que señalas, lo que conviene cuando la curva debe tocarlos. Una de VC la forman sus vértices de control, a los que solo se acerca, lo que da una forma suave y regular. Se elige con <Keyword id="Method" /> en la primera solicitud.

### ¿Cómo convierto una spline en polilínea?

Ejecuta <Command id="PEDIT" /> y designa la spline: dice <Message id="objectNotPolyline" />, ofrece transformarla y pide una precisión de 0 a 99, 10 por defecto. La polilínea sigue a la spline con segmentos rectos cortos, más que los que hace AutoCAD.

### ¿Cómo convierto una polilínea en spline?

Ajusta la polilínea con la opción Spline de <Command id="PEDIT" /> y después ejecuta SPLINE y elige <Keyword id="Object" />: la polilínea pasa a ser una spline de la misma curva.

### ¿Se puede descomponer una spline en AutoCAD?

No: <Command id="EXPLODE" /> rechaza una spline, como AutoCAD. Para partirla en trozos, conviértela antes en polilínea con <Command id="PEDIT" /> y descompón esta en líneas.
