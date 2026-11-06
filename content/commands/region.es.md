---
title: "Regiones en AutoCAD: comando REGION"
metaTitle: "Crear regiones en AutoCAD: comando REGION"
description: "Cómo funciona REGION (alias REG) de AutoCAD en español: formas cerradas en regiones, qué bucles encuentra, por qué no crea ninguna y para qué sirven. Pruébalo."
figure: "Cuatro líneas cerradas extremo con extremo y un círculo dentro de ellas: REGION, con una ventana alrededor de ambos, crea dos regiones y borra los objetos."
sourceHash: "69a5423c3d5c"
---

REGION convierte formas cerradas en regiones: áreas planas sin grosor, cada una limitada por sus bucles. Designa los objetos y pulsa Intro; cada bucle que forman se convierte en una región. Un objeto cerrado es un bucle por sí mismo: un círculo, una elipse, una polilínea o una spline cerradas. Los abiertos —líneas, arcos, arcos elípticos, polilíneas y splines abiertas— se encadenan extremo con extremo, nunca donde se cruzan, y una cadena que no se cierra se descarta. Después, la línea de comandos cuenta los bucles que ha encontrado, los que ha rechazado y por qué, y las regiones que ha creado; Intro sin nada designado dice <Message id="regionNoneFound" />.

Los objetos que han formado una región se borran, los demás se conservan, y las regiones toman la capa y las propiedades actuales, no las de los objetos. Un bucle dentro de otro forma una región propia, no un agujero en ella: <Command id="SUBTRACT" /> resta una de la otra. Una región se dibuja con sus aristas, y la referencia a objetos las encuentra; la paleta Propiedades muestra su área y su perímetro, que también miden <Command id="AREA" />, <Command id="LIST" /> y <Command id="MASSPROP" />. <Command id="UNION" />, <Command id="SUBTRACT" /> e <Command id="INTERSECT" /> combinan regiones de un mismo plano, <Command id="EXTRUDE" />, <Command id="REVOLVE" /> y <Command id="PRESSPULL" /> las convierten en sólidos 3D, y <Command id="EXPLODE" /> devuelve sus líneas, arcos y círculos. Todo el comando es un solo paso de deshacer.

## Missing

El `DELOBJ` de AutoCAD: aquí los objetos que han formado una región siempre se borran. CONTORNO (BOUNDARY), que puede crear una región con el área que rodea un punto, y una región a partir del contorno de un sombreado. Editar una región con sus pinzamientos: se muestran, pero arrastrar uno no cambia nada. Sus aristas como arista de corte o de contorno para <Command id="TRIM" /> y <Command id="EXTEND" /> en modo Rápido, y <Command id="HATCH" /> de una región con una arista elíptica o de spline. Las regiones combinadas con superficies, que MellowCAD no tiene, y la fila Material de la paleta Propiedades.

## Questions

### ¿Cómo se usa el comando REGION en AutoCAD?

Ejecuta REGION (o `REG`), designa las formas cerradas o las líneas que cierran una extremo con extremo, y pulsa Intro. En la figura, una ventana alrededor de cuatro líneas y un círculo crea dos regiones, y la línea de comandos cuenta dos bucles extraídos y dos regiones creadas.

### ¿Por qué REGION no crea la región?

La forma no está cerrada extremo con extremo. Las líneas que se cruzan, o que se quedan cortas unas de otras, no cierran nada: REGION encadena los objetos abiertos solo por sus extremos, y basta un hueco mínimo para que descarte la cadena. Un bucle que se cruza consigo mismo, como una pajarita, se rechaza y se cuenta entre las autointersecciones. Une los extremos con <Command id="FILLET" /> de radio 0, o recorta con <Command id="TRIM" /> lo que sobresale, y vuelve a intentarlo.

### ¿Cómo hacer una región con un agujero?

Crea una región del contorno y otra del agujero, y ejecuta <Command id="SUBTRACT" />: designa el contorno, Intro, el agujero, Intro. El resultado es una sola región, y <Command id="EXTRUDE" /> la convierte en un sólido con el agujero pasante.

### ¿Cómo saber el área de una región?

Desígnala y lee Área en la paleta Propiedades, o ejecuta <Command id="AREA" />, elige <Keyword command="AREA" id="Object" /> y desígnala. <Command id="MASSPROP" /> añade el perímetro, el centro de gravedad y los momentos de inercia.
