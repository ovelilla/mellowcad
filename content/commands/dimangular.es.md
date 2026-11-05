---
title: "Acotar ángulos en AutoCAD: ACOANGULAR (DIMANGULAR)"
metaTitle: "Acotar ángulos en AutoCAD: comando ACOANGULAR"
description: "Cómo acotar un ángulo con ACOANGULAR (DIMANGULAR, alias ACOANG) de AutoCAD en español: dos líneas, un arco, un círculo o tres puntos. Pruébalo gratis online."
figure: "Dos líneas que se cortan a 30 grados: cada línea designada y después el arco de cota colocado entre ellas."
sourceHash: "30943abd60f6"
---

ACOANGULAR (DIMANGULAR en inglés) acota un ángulo con un arco como línea de cota. Lo que designas primero decide el resto, como en AutoCAD: una línea pide una segunda línea, también dos segmentos de una misma polilínea; un arco se mide de extremo a extremo alrededor de su centro; un círculo, desde el punto donde lo designaste hasta un segundo punto que precisas; e Intro pide en su lugar el vértice del ángulo y después sus dos puntos finales. Luego colocas el arco, y donde lo pones elige el ángulo medido: entre dos líneas, el de los cuatro sectores que lo contiene; en los demás casos, el ángulo o, al otro lado de sus lados, el ángulo mayor de 180°. La línea de comandos dice la medida en grados, y el comando termina.

## Options

### Text

Pide el texto que se escribe en lugar de la medida, que ofrece por defecto: Intro mantiene la medida. En lo que escribes, `<>` representa la medida.

### Angle

Pide el ángulo del texto, que se dibuja entonces con ese ángulo en vez de a lo largo del arco de cota. 0 lo devuelve al arco.

## Missing

La opción de texto de líneas múltiples: el texto de una cota es una sola línea, que se fija con <Keyword id="Text" /> en la línea de comandos. Cuadrante, que fija la cota a un sector para que su texto pueda ir fuera de él. Unidades angulares distintas de los grados decimales (DIMAUNIT). Una cota angular no se puede encadenar ni espaciar: <Command id="DIMCONTINUE" />, <Command id="DIMBASELINE" /> y <Command id="DIMSPACE" /> solo aceptan cotas lineales y alineadas. No se puede designar una línea o un arco dentro de una referencia a bloque. Entre dos líneas, la cota conserva los puntos donde su arco las cortaba, no las líneas: si se mueve después, su arco mantiene las líneas de referencia desde allí, mientras que AutoCAD vuelve a medir sobre las líneas. Una cota no es asociativa: no sigue a los objetos que mide.

## Questions

### ¿Cómo se llama el comando DIMANGULAR en español?

ACOANGULAR, con el alias `ACOANG`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_DIMANGULAR`.

### ¿Cómo acoto un ángulo mayor de 180 grados?

Pulsa Intro en la primera solicitud, precisa el vértice y los dos puntos finales y coloca el arco fuera del ángulo que forman: mide el ángulo mayor, 360° menos el otro. Con un arco o un círculo funciona igual. Entre dos líneas, el ángulo es siempre menor de 180°.

### ¿Cómo acoto el ángulo de un arco?

Designa el arco en la primera solicitud: su centro es el vértice y sus extremos los orígenes de las líneas de referencia, así que la siguiente pregunta ya es dónde colocar la cota.

### ¿Por qué ACOANGULAR dice que las líneas son paralelas?

Dos líneas paralelas, o la misma línea designada dos veces, no forman ningún ángulo: <Message id="dimLinesParallel" />, y el comando termina.

### ¿Cómo cambio los decimales de una cota angular?

En el estilo de cota: <Command id="DIMSTYLE" /> (`ACES`) lo abre en la paleta Estilos, donde los fija la precisión angular de Unidades principales, 0 en ISO-25. Todas las cotas angulares de ese estilo la siguen.
