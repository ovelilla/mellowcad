---
title: "Alargar en AutoCAD: ALARGA (EXTEND)"
metaTitle: "Alargar en AutoCAD: comando ALARGA (EXTEND)"
description: "Cómo funciona ALARGA (EXTEND, alias AL) de AutoCAD en español, solicitud a solicitud: modos Rápido y Estándar, aristas de contorno y borde. Pruébalo gratis."
figure: "Dos líneas alargadas hasta la línea que se cruza en su camino: cada una designada una vez cerca del extremo que crece, en modo Rápido."
sourceHash: "b2c0044f8e87"
---

ALARGA (EXTEND en inglés) prolonga un objeto hasta que se encuentra con otro: lo designas cerca del extremo que debe crecer, y ese extremo sigue hasta la arista más cercana en su camino. Alarga líneas, arcos, arcos elípticos, polilíneas abiertas (por su segmento final, recto o siguiendo su arco), polilíneas 3D y splines abiertas. Empieza en modo Rápido, como el de AutoCAD: todos los objetos son contornos. Si mantienes Mayús al designar, recorta en su lugar, como <Command id="TRIM" />. Cada designación es un paso que Deshacer revierte; Intro termina el comando.

## Options

### Boundary

Elige qué objetos hacen de contorno: desígnalos, o pulsa Intro para tomarlos todos. Desde entonces solo hacen de contorno esos, sea cual sea el modo, hasta que termina el comando.

### Fence

Pide los puntos de una línea, tantos como quieras hasta Intro: cada objeto que cruza se alarga por el extremo más cercano a donde lo cruza, en un solo paso. El modo Estándar la ofrece; el Rápido también la acepta.

### Crossing

Pide las dos esquinas de una ventana: se alarga cada objeto que cruza su contorno, en un solo paso.

### mOde

Cambia entre <Keyword id="Quick" /> y <Keyword id="Standard" />. En modo Estándar, ALARGA pide primero las aristas de contorno (Intro las toma todas) y ofrece Borde y Arista. El modo es a la vez el de ALARGA y el de RECORTA, y dura la sesión.

### Edge

Solo en modo Estándar. Con <Keyword id="Extend" />, un objeto también se detiene donde estaría un contorno si se prolongara —una línea por los dos lados, un arco por toda su circunferencia—, de modo que una línea puede crecer hasta otra que no llega a su camino; <Keyword id="No extend" /> es la opción por defecto.

### Undo

Aparece en cuanto la solicitud ha tenido una respuesta (una designación, un borde, una ventana): deshace el último alargamiento y, si no queda nada que deshacer, lo dice.

## Missing

Proyección: no se ofrece la opción de proyección de AutoCAD (Ninguna, SCP, Vista), y todo se calcula proyectado en el plano XY del SCP, que es la de AutoCAD por defecto, SCP. El borde todavía no se puede arrastrar con el cursor, solo señalar punto a punto. El modo y la elección de Arista duran la sesión, mientras que AutoCAD los conserva de una sesión a otra. Un objeto inclinado respecto al SCP, salvo una spline, ni hace de contorno ni se alarga, y una polilínea suavizada con <Keyword command="PEDIT" id="Fit" /> de <Command id="PEDIT" /> se rechaza, mientras que AutoCAD alarga su último arco.

## Questions

### ¿Cómo se llama el comando EXTEND en español?

ALARGA, con el alias `AL`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_EXTEND`.

### ¿Por qué ALARGA dice que no hay arista?

Porque nada se cruza en el camino que seguiría ese extremo. Una línea dice <Message id="noEdgeInThatDirection" /> cuando su otro extremo sí llegaría a una arista, y una línea o un arco, <Message id="pathDoesNotIntersectBoundingEdge" /> en los demás casos; una polilínea o una spline dice <Message id="objectDoesNotIntersectEdge" />. Designa cerca del otro extremo o, en modo Estándar, elige <Keyword id="Edge" /> y <Keyword id="Extend" /> para que cuente un contorno que se queda corto como si se prolongara. Un círculo, una polilínea cerrada, una elipse entera, un texto o un sombreado no se pueden alargar: <Message id="cannotExtendObject" />

### ¿Cómo alargo varias líneas a la vez?

Designa en un punto vacío y señala un segundo punto: cada objeto que cruza ese borde crece por su extremo más cercano, en un solo paso. O elige <Keyword id="Crossing" /> y dibuja una ventana sobre los extremos que quieres alargar.

### ¿Cómo recorto con ALARGA?

Mantén Mayús al designar: el trozo se recorta hasta los cruces más cercanos, como lo haría <Command id="TRIM" />, y un objeto que nada cruza se borra. La siguiente designación sin Mayús vuelve a alargar.
