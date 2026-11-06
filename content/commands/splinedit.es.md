---
title: "Editar splines en AutoCAD: EDITSPLINE (SPLINEDIT)"
metaTitle: "Editar splines en AutoCAD: comando EDITSPLINE"
description: "Cómo funciona EDITSPLINE (SPLINEDIT, alias SPE) de AutoCAD en español: Cerrar, Unir, Ajustar datos, Editar vértices, coNvertir en polilínea e Invertir."
figure: "Una spline por cinco puntos de ajuste, cerrada con EDITSPLINE: un bucle suave que pasa por todos ellos."
sourceHash: "bedcaab2fac3"
---

EDITSPLINE (SPLINEDIT en inglés) edita una spline. Desígnala en `Designe spline:` o antes del comando; un doble clic en una spline también ejecuta EDITSPLINE sobre ella. Cualquier otra cosa dice <Message id="objectNotSpline" /> y vuelve a preguntar; una polilínea ajustada con la opción Spline de EDITPOL se convierte, sin decir nada, en una spline de la misma curva. Después pide una opción una y otra vez, cada una aplicada en el acto, hasta <Keyword id="eXit" /> o Intro. La spline muestra los pinzamientos de sus puntos de ajuste y, mientras editas sus vértices, sus vértices de control y su marco. Toda la edición es un paso que <Command id="U" /> deshace. `'ZOOM` escrito funciona en cualquiera de sus solicitudes.

## Options

### Close

Cierra la spline de forma suave: una spline de ajuste por sus puntos de ajuste, una de VC sobre sus vértices. En una spline cerrada la opción es <Keyword id="Open" />, y no se ofrece Unir.

### Join

Une las curvas abiertas que tocan sus extremos, con las reglas de UNIR para una spline, y dice cuántas ha unido.

### Fit data

Edita los puntos por los que pasa la spline. A una spline de VC, que no tiene, se le dan primero puntos de ajuste sobre su curva. Sus opciones: <Keyword id="Add" /> elige un punto de ajuste y añade otros nuevos tras él, una y otra vez (en el primer punto de una spline abierta, <Keyword id="After" /> o <Keyword id="Before" />); <Keyword id="Delete" /> quita puntos de ajuste, hasta dejar dos, tres en una spline cerrada (<Message id="cannotDeleteBeyond" />); <Keyword id="Move" /> recorre los puntos de ajuste con <Keyword id="Next" /> y <Keyword id="Previous" />, o <Keyword id="Select point" />, y desplaza el actual al punto que das; <Keyword id="Purge" /> elimina los datos de ajuste y deja una spline de VC; <Keyword id="Tangents" /> fija las direcciones inicial y final, o <Keyword id="System default" />; <Keyword id="Close" /> y <Keyword id="eXit" />, como en la primera solicitud. Un punto señalado que no es un punto de ajuste dice <Message id="notAFitPoint" />.

### Edit vertex

Edita los vértices de control; una spline de ajuste pierde sus datos de ajuste en la primera edición. <Keyword id="Add" /> pone un vértice en el punto que señalas en la spline; <Keyword id="Delete" /> quita uno, hasta dejar dos, tres en una spline cerrada; <Keyword id="Elevate order" /> sube el orden, hasta 26, nunca lo baja; <Keyword id="Move" /> desplaza vértices, recorriéndolos como el Desplazar de Ajustar datos; <Keyword id="Weight" /> fija el peso de un vértice, tras <Message id="splineMadeRational" />, para que la curva se acerque más a él o se aleje. Un punto señalado que no es un vértice dice <Message id="notAControlVertex" />.

### convert to Polyline

Pide una precisión de 0 a 99, 10 por defecto, y sustituye la spline por una polilínea de segmentos rectos, más cuanto mayor sea la precisión; una polilínea 3D donde la spline no queda plana, paralela al plano XY. Termina el comando. La precisión se conserva durante la sesión, y la conversión de EDITPOL también la usa.

### Reverse

Da la vuelta a la spline, su primer punto al final: <Message id="splineReversed" />.

### Undo

Deshace la última opción, un Ajustar datos o un Editar vértices enteros de una vez. Si no queda ninguna: <Message id="commandCompletelyUndone" />.

### eXit

Termina el comando, como Intro.

## Missing

Punto de torsión, que pone una esquina viva en un punto de ajuste o un vértice; tOlerancia, que reajusta la spline dentro de una tolerancia; Tangentes de una spline cerrada. coNvertir en polilínea hace con una spline de ajuste muchos más vértices que AutoCAD, nunca arcos, y siempre sustituye la spline. Grupo en `Designe spline:`. La `+` que AutoCAD dibuja en el punto actual mientras recorres los puntos.

## Questions

### ¿Cómo se llama el comando SPLINEDIT en español?

EDITSPLINE, con el alias `SPE`, y después Intro o la barra espaciadora. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_SPLINEDIT`. Un doble clic en una spline también lo ejecuta.

### ¿Cómo convierto una spline en polilínea?

Ejecuta EDITSPLINE, designa la spline y elige <Keyword id="convert to Polyline" />; una precisión de 10 da una polilínea suave. <Command id="PEDIT" /> sobre una spline también ofrece convertirla.

### ¿Cómo añado o desplazo puntos de una spline?

Elige <Keyword id="Fit data" /> para trabajar con los puntos por los que pasa, y después <Keyword id="Add" /> o <Keyword id="Move" />. Elige <Keyword id="Edit vertex" /> para trabajar con los vértices de control que la enmarcan.

### ¿Cómo cierro una spline?

Elige <Keyword id="Close" />: se cierra de forma suave, sin esquina donde se encuentra consigo misma. <Keyword id="Open" /> la vuelve a abrir.

### ¿Cómo uno dos splines?

Elige <Keyword id="Join" /> y designa la spline cuyo extremo toca el de esta, o usa <Command id="JOIN" />.
