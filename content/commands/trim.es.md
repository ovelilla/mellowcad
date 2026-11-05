---
title: "Recortar en AutoCAD: RECORTA (TRIM)"
metaTitle: "Recortar en AutoCAD: comando RECORTA (TRIM)"
description: "Cómo funciona RECORTA (TRIM, alias RR) de AutoCAD en español, solicitud a solicitud: modos Rápido y Estándar, aristas de corte y borde. Pruébalo gratis online."
figure: "Una línea recortada hasta las dos líneas que la cruzan: cada extremo designado una vez, en modo Rápido."
sourceHash: "fcbf44618cf3"
---

RECORTA (TRIM en inglés) recorta un objeto hasta donde lo cruzan otros: designas el trozo que quieres quitar y desaparece hasta el cruce más cercano a cada lado. Empieza en modo Rápido, como el de AutoCAD: todos los objetos son aristas de corte, y un objeto que nada cruza se borra entero. Si mantienes Mayús al designar, el objeto se alarga hasta la arista más cercana, como con <Command id="EXTEND" />. Cada designación es un paso que Deshacer revierte; Intro termina el comando.

## Options

### cuTting

Elige qué objetos cortan: desígnalos, o pulsa Intro para tomarlos todos. Desde entonces solo cortan esos, sea cual sea el modo, hasta que termina el comando.

### Fence

Pide los puntos de una línea, tantos como quieras hasta Intro: cada objeto que cruza se recorta donde lo cruza, en un solo paso. El modo Estándar la ofrece; el Rápido también la acepta, y en él designar sobre nada empieza por sí solo un borde de dos puntos.

### Crossing

Pide las dos esquinas de una ventana: se recorta todo lo que cruza su contorno, en un solo paso. Un objeto que queda entero dentro de la ventana no lo cruza.

### mOde

Cambia entre <Keyword id="Quick" /> y <Keyword id="Standard" />. En modo Estándar, RECORTA pide primero las aristas de corte (Intro las toma todas), deja el objeto que ninguna arista cruza con <Message id="doesNotIntersectCuttingEdge" />, ofrece Borde y Arista, y designar sobre nada empieza una ventana de captura. El modo es a la vez el de RECORTA y el de ALARGA, y dura la sesión.

### Edge

Solo en modo Estándar. Con <Keyword id="Extend" />, una arista corta también donde cruzaría si se alargara: una línea por los dos lados, un arco por toda su circunferencia; <Keyword id="No extend" /> es la opción por defecto.

### eRase

Borra objetos sin salir del comando: desígnalos e Intro los borra, como un paso más de RECORTA que Deshacer puede revertir.

### Undo

Aparece en cuanto la solicitud ha tenido una respuesta (una designación, un borde, una ventana): deshace el último recorte y, si no queda nada que deshacer, lo dice.

## Missing

Proyección: no se ofrece la opción de proyección de AutoCAD (Ninguna, SCP, Vista), y todo se calcula proyectado en el plano XY del SCP, que es la de AutoCAD por defecto, SCP. El borde todavía no se puede arrastrar con el cursor, solo señalar punto a punto. El modo de recorte y la elección de Arista duran la sesión, mientras que AutoCAD los conserva de una sesión a otra. Un objeto inclinado respecto al SCP, salvo una spline, ni corta ni se recorta.

## Questions

### ¿Cómo se llama el comando TRIM en español?

RECORTA, con el alias `RR`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_TRIM`.

### ¿Por qué RECORTA borra la línea entera?

Porque está en modo Rápido, el de AutoCAD por defecto desde la versión 2021: designar un objeto que ninguna arista cruza lo borra. Elige <Keyword id="mOde" /> y después <Keyword id="Standard" /> para que lo deje y lo diga.

### ¿Cómo recorto muchas líneas a la vez?

Designa en un punto vacío y señala un segundo punto: se recorta, en un solo paso, cada objeto que cruza ese borde. O elige <Keyword id="Crossing" /> y dibuja una ventana sobre los trozos que quieres quitar.

### ¿Cómo alargo una línea con RECORTA?

Mantén Mayús al designar la línea cerca del extremo que quieres alargar: crece hasta la arista más cercana, como con <Command id="EXTEND" />, y la siguiente designación sin Mayús vuelve a recortar.
