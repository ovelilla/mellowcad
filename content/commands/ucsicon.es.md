---
title: "Icono SCP en AutoCAD: comando SIMBSCP (UCSICON)"
metaTitle: "Icono SCP en AutoCAD: comando SIMBSCP (UCSICON)"
description: "Cómo funciona SIMBSCP (UCSICON) de AutoCAD en español: mostrar u ocultar el icono SCP, en el origen o en la esquina: ACT, DES, Sin origen y Origen. Pruébalo."
figure: "SIMBSCP Sin origen lleva el icono a la esquina; SCP desplaza el origen al escalón de la pieza, y Origen dibuja allí el icono, con su X roja, su Y verde y su Z azul."
sourceHash: "c431e70eda01"
---

SIMBSCP (UCSICON en inglés) muestra u oculta el icono SCP —los brazos X e Y que muestran dónde está el SCP actual y hacia dónde apunta— y fija dónde se coloca: en el origen del SCP o en la esquina inferior izquierda del dibujo. Su única solicitud ofrece el estado actual como opción por defecto, así que Intro lo conserva. El parámetro se guarda en el dibujo, y cada SIMBSCP es un paso de deshacer.

El icono es el 3D de AutoCAD 2027: un brazo para X y otro para Y, una letra en el extremo de cada uno, y un cuadrado en el origen mientras el SCP es el universal. Fuera de la vista en planta, un brazo Z muestra hacia dónde apunta la Z del SCP, y un brazo visto de punta se omite. En Estructura alámbrica 2D es blanco; en Oculto y Conceptual su X es roja, su Y verde y su Z azul. La variable conserva su nombre inglés: con un apóstrofo, `'UCSICON` define la variable UCSICON en lugar de ejecutar SIMBSCP, incluso dentro de otro comando, y `UCSICON` sin apóstrofo también: de 0 a 3, donde 1 muestra el icono y 2 lo pone en el origen.

## Options

### ON

Muestra el icono.

### OFF

Oculta el icono. El SCP sigue ahí, y lo que dibujas sigue quedando en él.

### Noorigin

Mantiene el icono en la esquina inferior izquierda del dibujo, esté donde esté el origen.

### ORigin

Dibuja el icono en el origen del SCP, como viene por defecto. Cuando el origen está fuera de la pantalla, o tan cerca de su borde que el icono no cabría, el icono pasa a la esquina inferior izquierda hasta que el origen vuelve a verse.

## Missing

Todas, que en AutoCAD aplica el parámetro a todas las ventanas gráficas (aquí solo hay una); Seleccionable, los pinzamientos del icono; y Propiedades, el cuadro de diálogo Icono SCP, con el estilo 2D, el tamaño, el grosor de las líneas y los colores.

## Questions

### ¿Cómo quitar el icono SCP en AutoCAD?

Escribe `SIMBSCP`, pulsa Intro y después <Keyword id="OFF" />. <Keyword id="ON" /> lo vuelve a mostrar.

### ¿Cómo poner el icono SCP en el origen?

SIMBSCP y después <Keyword id="ORigin" />: el icono se coloca en el origen del SCP. Si se queda en la esquina, el origen está fuera de la pantalla o demasiado cerca de su borde: haz un encuadre o aleja el zoom. <Keyword id="Noorigin" /> lo mantiene en la esquina.

### ¿Qué significa el cuadrado del icono SCP?

Que el SCP es el sistema de coordenadas universal. Desplaza o gira el SCP con <Command id="UCS" /> y el cuadrado desaparece; <Command id="UCS" /> e Intro vuelven al Universal, y el cuadrado con él.

### ¿Cómo cambiar el estilo, el tamaño o el color del icono SCP?

En AutoCAD, con Propiedades de SIMBSCP, el cuadro de diálogo Icono SCP. MellowCAD aún no lo tiene: el icono se dibuja como lo dibuja AutoCAD 2027 por defecto, con el estilo 3D.
