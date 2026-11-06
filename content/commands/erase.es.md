---
title: "Borrar en AutoCAD: BORRA (ERASE)"
metaTitle: "Borrar en AutoCAD: comando BORRA (ERASE)"
description: "Cómo funciona BORRA (ERASE, alias B) de AutoCAD en español: designar, Intro y fuera; la tecla Supr, borrarlo todo y recuperarlo. Pruébalo gratis."
figure: "Un rectángulo y sus dos diagonales: una diagonal designada, después Intro, y queda borrada."
sourceHash: "2de33971060a"
---

BORRA (ERASE en inglés) quita del dibujo los objetos que designas. Desígnalos en la solicitud `Designe objetos:`, señalándolos o con cualquiera de los modos de designación de AutoCAD, entre ellos una ventana o una captura, y pulsa Intro o la barra espaciadora: desaparecen, y el comando no dice nada más. Esc lo termina sin borrar nada. Como en AutoCAD, si había objetos designados antes del comando, se borran al momento, y la tecla Supr con objetos designados ejecuta BORRA sobre ellos. Mientras designas, el objeto bajo el cursor y los ya elegidos se dibujan atenuados, como AutoCAD anticipa lo que va a borrar. Todo el borrado es un paso que Deshacer revierte.

## Missing

OOPS, que en AutoCAD recupera el último conjunto que borró BORRA, aun después de otros comandos. Aquí <Command id="U" /> o Ctrl+Z deshacen el borrado, con todo lo que vino después.

## Questions

### ¿Cómo se llama el comando ERASE en español?

BORRA, con los alias `B` y `DELETE`. O designa los objetos en `Comando:` y pulsa la tecla Supr. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_ERASE`.

### ¿Cómo borro todo un dibujo en AutoCAD?

Ejecuta BORRA, escribe `_ALL`, el modo que lo designa todo en cualquier idioma, en `Designe objetos:` y pulsa Intro. Los objetos de una capa bloqueada se quedan fuera, y la designación dice cuántos eran.

### ¿Cómo recupero lo que he borrado?

Escribe <Command id="U" /> o pulsa Ctrl+Z en seguida: el borrado es un solo paso de deshacer. OOPS, que recupera el último conjunto borrado aun después de otros comandos, aún no está hecho.

### ¿Qué diferencia hay entre BORRA y RECORTA?

BORRA quita objetos enteros. <Command id="TRIM" /> quita solo la parte de un objeto que pasa de las aristas que encuentra, y conserva el resto.
