---
title: "Rehacer en AutoCAD: comando REHACER (REDO)"
metaTitle: "Rehacer en AutoCAD: REHACER, Ctrl+Y y MREHACER"
description: "Cómo funciona REHACER (REDO) de AutoCAD en español: recupera lo que deshizo el último H o DESHACER, justo después; MREHACER y Ctrl+Y rehacen paso a paso."
figure: "Un agujero dibujado en una placa, deshecho con H y recuperado con REHACER."
sourceHash: "be2e44b98ac0"
---

REHACER (REDO en inglés) invierte el último <Command id="U" /> o <Command id="UNDO" />: lo que deshizo se vuelve a dibujar, todo, así que tras un DESHACER de cinco comandos REHACER recupera los cinco. Escribe los nombres de los comandos a medida que lo hace, y después <Message id="everythingRedone" /> cuando ya no queda nada que rehacer. No pregunta nada y no tiene opciones.

Solo funciona justo después del deshacer. En cualquier otro momento dice <Message id="redoMustFollowUndo" />, y una vez ejecutado otro comando, incluso uno que no cambia nada, como LIST o ZOOM, <Message id="nothingToRedo" />. Con el deshacer desactivado por la opción Control Ninguna de DESHACER, REHACER dice que está desactivado.

<Command id="MREDO" /> rehace paso a paso: pide un número de acciones, o <Keyword command="MREDO" id="All" /> o <Keyword command="MREDO" id="Last" />, y rehace ese número de los pasos que deshicieron los deshacer, aunque se hayan ejecutado H, DESHACER y REHACER desde entonces; úLtima es todo el último deshacer, una vez (<Message id="alreadyRedone" />). Ctrl+Y y el Rehacer del menú contextual ejecutan MREHACER con 1, cancelando el comando en curso.

## Missing

Ctrl+Mayús+Z también rehace, sin decir nada, aunque AutoCAD no le asigna nada. Los botones Deshacer y Rehacer de la barra superior no escriben nada en el historial, donde la barra de herramientas de acceso rápido de AutoCAD escribe lo suyo.

## Questions

### ¿Cuál es el atajo de REHACER en AutoCAD?

Ctrl+Y, que rehace un paso (MREHACER 1). REHACER no tiene alias: escribe `REHACER`, o `_REDO` en cualquier idioma de AutoCAD.

### ¿Por qué no funciona REHACER?

REHACER solo invierte el H o DESHACER que va justo antes. Después de cualquier otro comando no hay nada que rehacer, aunque no haya cambiado nada: deshaz y rehaz en el acto.

### ¿Qué diferencia hay entre REHACER y MREHACER?

REHACER recupera todo el último deshacer, y solo justo después de él. <Command id="MREDO" /> rehace un número de los pasos deshechos, uno a uno, o todos, y sigue funcionando después de un REHACER.

### ¿Cómo repito el último comando en AutoCAD?

Pulsa Intro o la barra espaciadora en la solicitud de comando: el último comando vuelve a empezar. REHACER no repite un comando; invierte un deshacer.
