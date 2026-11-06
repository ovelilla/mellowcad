---
title: "Copiar y pegar en AutoCAD: COPIAPP (COPYCLIP)"
metaTitle: "Copiar y pegar en AutoCAD: COPIAPP y Ctrl+C"
description: "Cómo funciona COPIAPP (COPYCLIP, Ctrl+C) de AutoCAD en español con CORTAPP, COPIARBASE y PEGAPP: copia objetos al portapapeles y pégalos en un punto. Pruébalo."
figure: "COPIAPP del agujero de una placa y después PEGAPP en 65,20: la copia colocada ahí por su esquina inferior izquierda, un segundo agujero."
sourceHash: "f84c995e7c2b"
---

COPIAPP (COPYCLIP en inglés) copia al portapapeles los objetos que designas, con las capas, los estilos y los bloques que usan; el dibujo no cambia, y los objetos designados antes siguen designados. Ctrl+C lo ejecuta, cancelando el comando en curso. Después <Command id="PASTECLIP" />, Ctrl+V, pide un punto de inserción: los objetos siguen al cursor y caen con la esquina inferior izquierda de su extensión en el punto, en el SCP actual, todo en un paso que <Command id="U" /> deshace. Pega en el mismo dibujo o en otro: el portapapeles es el del sistema, así que un dibujo en otra pestaña puede leerlo, si el navegador deja a la página leer el portapapeles. Donde una capa, un estilo o un bloque pegado tiene el nombre de uno que el dibujo ya tiene, se usa el del dibujo.

<Command id="CUTCLIP" />, Ctrl+X, copia los objetos y los borra, como BORRA. <Command id="COPYBASE" />, Ctrl+Mayús+C, pide antes un punto base, y PEGAPP coloca entonces los objetos por ese punto en lugar de por su esquina, así que caen exactamente donde quieres. Ctrl+A designa todos los objetos del dibujo.

## Missing

PEGABLQ y CORTARBASE, y por tanto Ctrl+Mayús+V y Ctrl+Mayús+X, que quedan para el navegador, como Ctrl+Mayús+A. PEGARORIG, PEGAESP, arrastrar objetos entre ventanas y el texto de otro programa pegado como texto de líneas múltiples. Las opciones ocultas de INSERT en el punto de PEGAPP, así que un pegado no se puede escalar, girar ni descomponer al colocarlo.

## Questions

### ¿Qué diferencia hay entre COPIA y COPIAPP?

<Command id="COPY" /> coloca copias en el mismo dibujo, de un punto base a un segundo punto. COPIAPP pone los objetos en el portapapeles, para pegarlos con PEGAPP en este dibujo o en otro.

### ¿Cómo copio con punto base?

Pulsa Ctrl+Mayús+C, o escribe `COPIARBASE`, da el punto base y designa los objetos. Ctrl+V los coloca entonces por ese punto.

### ¿Cómo copio objetos de un dibujo a otro?

Desígnalos y pulsa Ctrl+C, abre el otro dibujo y pulsa Ctrl+V, y después señala el punto de inserción. Sus capas, estilos y bloques vienen con ellos.

### ¿Por qué no funciona pegar?

El navegador puede preguntar si la página puede leer el portapapeles: permítelo. Si lo rechaza, PEGAPP pega lo último que se copió en la misma página. Sin nada copiado, no pega nada.
