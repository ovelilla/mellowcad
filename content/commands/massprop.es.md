---
title: "Propiedades físicas en AutoCAD: PROPFIS (MASSPROP)"
metaTitle: "Propiedades físicas en AutoCAD: comando PROPFIS"
description: "Cómo funciona PROPFIS (MASSPROP) de AutoCAD en español: volumen, área, centro de gravedad e inercia de sólidos 3D y regiones, y el archivo .mpr. Pruébalo."
figure: "Un prisma rectangular de 60 por 40 por 25 en el origen: PROPFIS escribe su volumen, su cuadro delimitador, su centro de gravedad y sus momentos, e Intro rechaza el archivo."
sourceHash: "a0286a5d599e"
---

PROPFIS (MASSPROP en inglés) mide sólidos 3D y regiones. Desígnalos y pulsa Intro: el informe se escribe en la solicitud de comando, en las columnas de AutoCAD, y después pregunta si se escribe en un archivo. Un conjunto sin sólidos ni regiones dice <Message id="massPropNoneSelected" /> y termina.

En los sólidos, el conjunto se mide como un solo cuerpo con una densidad de 1, así que la masa es el volumen: masa, volumen, cuadro delimitador, centro de gravedad, momentos de inercia, productos de inercia y radios de giro, todos respecto al SCP actual, y después los momentos principales respecto al centro de gravedad, con sus direcciones. Los sólidos que se solapan se cuentan dos veces. En las regiones del plano XY del SCP: área, perímetro, cuadro delimitador, centro de gravedad, momentos y producto de inercia, radios de giro y momentos principales; una región fuera de ese plano da solo su área, su perímetro, su cuadro delimitador y su centro de gravedad. Primero van las regiones y después los sólidos; las regiones que no están en el plano de la primera se dejan fuera y se cuentan. Los números se escriben a la precisión del dibujo, que se fija con <Command id="UNITS" />, y son exactos: los de los sólidos se integran cara a cara. PROPFIS no cambia nada en el dibujo; se ejecuta escribiéndolo, como en AutoCAD, cuya cinta de opciones no tiene un botón para él.

## Options

### Yes

En la pregunta del archivo, cuya opción por defecto es <Keyword id="No" />: escribe el informe en un archivo, como lo escribe AutoCAD, línea a línea. En AutoCAD, un cuadro de diálogo pregunta dónde; en un navegador, la descarga hace de ese cuadro de diálogo, y el archivo toma el nombre del dibujo, con la extensión `.mpr`.

## Missing

Las unidades detrás de cada número con unidades arquitectónicas o de ingeniería (`sq in`, `cu in`, `lb`), que AutoCAD escribe: aquí ningún número lleva unidad. Elegir el nombre del archivo, y la pregunta antes de sustituir uno. Lejos del origen, AutoCAD escribe los números grandes en forma exponencial y pierde cifras, y su última cifra puede variar por su propio redondeo: los de MellowCAD son exactos. En un sólido con dos momentos principales iguales, el par de direcciones que elige el redondeo de AutoCAD.

## Questions

### ¿Cómo calcular el volumen de un sólido en AutoCAD?

Ejecuta PROPFIS, designa el sólido y pulsa Intro: Volumen es la segunda línea del informe. El prisma de 60 por 40 por 25 de la figura da 60000. Pulsa Intro en la pregunta del archivo para terminar.

### ¿Cómo encontrar el centroide de una figura en AutoCAD?

Conviértela en una región con <Command id="REGION" />, o en un sólido, y después ejecuta PROPFIS y desígnala: Centro de gravedad da su X y su Y, y también su Z en un sólido, en el SCP actual.

### ¿Por qué PROPFIS dice que no se ha designado ningún sólido o región?

Lo que has designado no es ninguna de las dos cosas: las líneas, las polilíneas, los círculos y los sombreados no tienen propiedades físicas, y un bloque que contiene un sólido no es un sólido. Convierte las formas cerradas en regiones con <Command id="REGION" />, o en sólidos con <Command id="EXTRUDE" />.

### ¿Por qué la masa es igual al volumen?

PROPFIS mide con una densidad de 1, como AutoCAD: aquí los sólidos no tienen material. Multiplica el volumen por la densidad del material para obtener su masa real.
