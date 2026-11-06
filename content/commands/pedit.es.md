---
title: "Editar polilíneas en AutoCAD: EDITPOL (PEDIT)"
metaTitle: "Editar polilíneas en AutoCAD: comando EDITPOL"
description: "Cómo funciona EDITPOL (PEDIT, alias PE) de AutoCAD en español: líneas a polilínea, Juntar, Grosor, curVar, Spline, Editar vértices y Múltiple. Pruébalo gratis."
figure: "Tres líneas unidas por sus extremos: EDITPOL convierte la primera en polilínea, le junta las otras dos y le da un grosor de 2."
sourceHash: "bdc0bf10ac09"
---

EDITPOL (PEDIT en inglés) edita una polilínea. Desígnala en `Designe polilínea o [Múltiple]:` o antes del comando; un doble clic en una polilínea también la abre en EDITPOL. Si designas una línea, un arco o una spline, dice <Message id="objectNotPolyline" /> y pregunta si la transforma en una, Sí por defecto: la polilínea nueva ocupa su lugar con sus propiedades. Después pide una opción una y otra vez, cada una aplicada en el acto, hasta que Intro lo termina. Una polilínea 3D tiene una lista más corta, sin grosor, sin ajuste de curva y sin generación del tipo de línea, y su opción de spline es <Keyword id="Spline curve" />. Esc conserva lo hecho; toda la edición es un paso que <Command id="U" /> deshace.

## Options

### Multiple

Edita varias polilíneas a la vez: desígnalas, di si se convierten las líneas, arcos y splines que haya entre ellas, y cada opción se aplica a todas. Su Juntar pide una distancia de aproximación y un <Keyword id="Jointype" />: <Keyword id="Extend" /> recorta o alarga los segmentos finales hasta que se encuentren, <Keyword id="Add" /> salva el hueco con un segmento nuevo y <Keyword id="Both" /> alarga donde puede y añade donde no.

### Close

Cierra la polilínea con un segmento de su último vértice al primero, un arco si el último segmento es un arco. En una polilínea cerrada la opción es <Keyword id="Open" />, que quita ese segmento.

### Join

Añade las líneas, arcos y polilíneas abiertas que tocan los extremos de la polilínea, extremo con extremo, y dice cuántos segmentos ha añadido. A una polilínea cerrada no se le puede juntar nada: <Message id="cannotJoinClosedPolyline" />.

### Width

Un grosor para todos los segmentos, escrito o medido con dos puntos; 0 lo quita.

### Edit vertex

Pone una X en el primer vértice y pregunta qué hacer ahí: <Keyword id="Next" /> y <Keyword id="Previous" /> mueven la X, <Keyword id="Move" /> desplaza el vértice, <Keyword id="Insert" /> añade uno detrás, <Keyword id="Break" /> y <Keyword id="Straighten" /> recuerdan el vértice, llevas la X a otro y <Keyword id="Go" /> corta la polilínea entre los dos o deja un solo segmento recto en lo que hay entre ellos, <Keyword id="Width" /> da al segmento siguiente sus grosores inicial y final, <Keyword id="Tangent" /> da al vértice una dirección para un ajuste posterior y <Keyword id="eXit" /> vuelve atrás.

### Fit

Dibuja una curva suave de arcos que pasa por todos los vértices, tangentes donde se encuentran, como el ajuste de curva de AutoCAD. Los vértices se conservan, y editarlos cambia la curva.

### Spline

Ajusta a la polilínea una B-spline que sus vértices enmarcan en lugar de atravesar: cuadrática o cúbica, según SPLINETYPE, y tan fina como diga SPLINESEGS. La de una polilínea 3D es <Keyword id="Spline curve" />. La opción Objeto de <Command id="SPLINE" /> convierte esa polilínea en una spline de verdad.

### Decurve

Quita la curva de curVar o de Spline: otra vez segmentos rectos entre los vértices.

### Ltype gen

<Keyword id="ON" /> extiende el tipo de línea en un solo patrón a lo largo de toda la polilínea, de modo que una polilínea de trazos con segmentos cortos sigue mostrando trazos; <Keyword id="OFF" />, por defecto, empieza el patrón de nuevo en cada vértice.

### Reverse

Le da la vuelta a la polilínea: sus vértices al revés, y con ellos los arcos y los grosores.

### Undo

Deshace la última opción de esta ejecución y sigue preguntando.

## Missing

PEDITACCEPT: al designar una línea, un arco o una spline, siempre pregunta antes de convertirla. PLINECONVERTMODE: una spline pasa a ser una polilínea de segmentos rectos, muchos más que los que hace AutoCAD, nunca de arcos. Una polilínea ajustada aparece en la paleta Propiedades como una polilínea normal, sin el título Polilínea 2D de AutoCAD ni su fila Ajustar/Suavizar. Múltiple con solo polilíneas 3D en el conjunto pide la solicitud 3D, donde AutoCAD pide la 2D. No hay mallas que editar.

## Questions

### ¿Cómo se llama el comando PEDIT en español?

EDITPOL, con el alias `PE`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_PEDIT`. Un doble clic en una polilínea también lo ejecuta.

### ¿Cómo convierto líneas en una polilínea?

Ejecuta EDITPOL, designa una de las líneas y pulsa Intro para transformarla en polilínea; después elige <Keyword id="Join" /> y designa las demás: las que se tocan por sus extremos pasan a ser una sola polilínea. <Command id="JOIN" /> hace lo mismo en un paso.

### ¿Por qué EDITPOL no funciona con mi objeto?

EDITPOL edita polilíneas y ofrece convertir líneas, arcos y splines; cualquier otra cosa, un texto, un círculo, un bloque, se rechaza y vuelve a preguntar. Un objeto de una capa bloqueada dice <Message id="objectOnLockedLayer" />. Juntar solo añade objetos cuyos extremos coinciden exactamente con los de la polilínea: para huecos, usa <Keyword id="Multiple" /> y una distancia de aproximación.

### ¿Cómo cambio el grosor de una polilínea?

Elige <Keyword id="Width" /> y escribe el grosor: todos los segmentos lo toman. Para uno solo, usa <Keyword id="Edit vertex" />, lleva la X al vértice donde empieza y elige su <Keyword id="Width" />.

### ¿Cómo curvo una polilínea?

<Keyword id="Fit" /> pasa arcos por todos los vértices; <Keyword id="Spline" /> hace una curva más suave que los vértices enmarcan. <Keyword id="Decurve" /> la vuelve recta.
