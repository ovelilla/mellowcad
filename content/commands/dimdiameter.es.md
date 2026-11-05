---
title: "Cota de diámetro en AutoCAD: ACODIAMETRO (DIMDIAMETER)"
metaTitle: "Acotar círculos en AutoCAD: comando ACODIAMETRO"
description: "Cómo acotar el diámetro de un círculo o un arco con ACODIAMETRO (DIMDIAMETER, alias ACODIA) de AutoCAD en español. Pruébalo gratis online."
figure: "Un círculo grande acotado por dentro y uno pequeño por fuera: cada círculo designado y después el texto colocado."
sourceHash: "76537f5f9854"
---

ACODIAMETRO (DIMDIAMETER en inglés) acota el diámetro de un círculo, un arco o un segmento de arco de una polilínea, con las solicitudes de <Command id="DIMRADIUS" />: designa la curva y la línea de comandos dice la medida enseguida; después coloca la cota, y el comando termina. Su texto es el diámetro precedido del signo de diámetro. Colocada dentro del círculo, una línea va del texto a una flecha sobre el borde; colocada fuera, la línea cruza el círculo de borde a borde, y su flecha del otro lado apunta hacia dentro desde un tramo corto, como lo dibuja ISO-25.

## Options

### Text

Pide el texto que se escribe en lugar de la medida, que ofrece por defecto: Intro mantiene la medida. En lo que escribes, `<>` representa la medida con su signo, así que `<> PASANTE` escribe el diámetro seguido de PASANTE.

### Angle

Pide el ángulo del texto, que se dibuja entonces con ese ángulo, con su centro sobre la línea, y la línea se detiene en él. 0 lo devuelve a la línea.

## Missing

La opción de texto de líneas múltiples: el texto de una cota es una sola línea, que se fija con <Keyword id="Text" /> en la línea de comandos, nunca en el editor de texto. El signo se dibuja Ø, donde AutoCAD escribe ∅: la fuente del dibujo no tiene ∅. En un arco, las flechas quedan entre sus extremos, mientras que AutoCAD dibuja una línea de extensión de arco. Como en <Command id="DIMRADIUS" />, no se puede designar una curva dentro de una referencia a bloque, las líneas de centro del estilo no se dibujan y sus ajustes para el texto fuera de la curva no se ofrecen. Una cota no es asociativa: no sigue a la curva que mide.

## Questions

### ¿Cómo se llama el comando DIMDIAMETER en español?

ACODIAMETRO, con el alias `ACODIA`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_DIMDIAMETER`.

### ¿Cómo acoto un agujero pequeño?

Coloca el texto fuera del círculo: la línea de cota cruza entonces el agujero con una flecha a cada lado, y el texto queda fuera de él. Dentro, el texto necesita sitio en el círculo.

### ¿Se puede acotar un arco con ACODIAMETRO?

Sí: un arco o un segmento de arco de una polilínea, como un círculo, y da el diámetro del círculo del arco. Cualquier otro objeto dice <Message id="notCircleOrArc" /> y vuelve a preguntar.

### ¿Cómo añado PASANTE u otra nota a una cota de diámetro?

Elige <Keyword id="Text" /> antes de colocarla y escribe `<> PASANTE`: `<>` es la medida con su signo. Una vez colocada, la cambia Modificar texto en la paleta Propiedades.
