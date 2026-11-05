---
title: "Diferencia de sólidos en AutoCAD: DIFERENCIA (SUBTRACT)"
metaTitle: "Diferencia de sólidos en AutoCAD: DIFERENCIA"
description: "Cómo funciona DIFERENCIA (SUBTRACT, alias DIF) de AutoCAD en español: lo que se queda, Intro y lo que se resta, sólidos 3D o regiones. Pruébalo gratis."
figure: "Un cilindro restado de un prisma rectangular con DIFERENCIA, que deja un agujero pasante: primero el prisma, después el cilindro."
sourceHash: "416991f5f4d1"
---

DIFERENCIA (SUBTRACT en inglés) resta sólidos 3D de otros sólidos, o regiones de otras regiones del mismo plano: un cilindro restado de un prisma rectangular deja un agujero pasante, y un círculo restado de un cuadrado, un cuadrado con un agujero. Pregunta dos veces. Primero dice <Message id="subtractFrom" /> y pide los objetos que se quedan, hasta Intro; después dice <Message id="subtractWhat" />, la misma frase en el AutoCAD en español, y pide los objetos que se restan, hasta otro Intro. Como en AutoCAD 2027, descarta el conjunto designado antes del comando y vuelve a pedirlo.

Los sólidos del primer conjunto pasan a ser uno, y cada sólido del segundo se resta de él y se borra, se solapara o no. Las regiones van plano a plano: las del primer conjunto en un plano se unen, las del segundo en ese plano se restan de ellas y se borran, y una región en un plano donde el primer conjunto no tiene ninguna se queda como estaba. Un resultado sólido es un sólido compuesto, que ya no es un prisma ni un cilindro y no tiene historial. Cuando no queda nada, dice <Message id="nullSolid" /> o <Message id="nullRegion" /> y los borra. Todo el comando es un solo paso de deshacer. El 3D de MellowCAD aún es parcial: hay sólidos, pero no superficies ni mallas.

## Missing

Las superficies, que aquí no existen. Las caras curvas que se cortan en una curva para la que MellowCAD aún no tiene una forma exacta: cilindros, conos, esferas o toroides cuyos ejes ni coinciden ni son paralelos (dos cilindros también pueden cortarse); un cono con algo que no sea un plano o un sólido sobre su eje; un toroide o un sólido de revolución con un plano que ni es perpendicular a su eje ni pasa por él, o con un sólido fuera de su eje; un sólido extruido con algo que no sea un plano o una cara extruida en su dirección. Se rechazan, y los sólidos se quedan como estaban; igual que un corte que toca una arista de forma tangente, unas caras casi pero no del todo sobre una misma superficie y una lámina muy fina entre un corte y una arista. Previo justo después de DIFERENCIA dice que no hay un conjunto de selección previo, donde AutoCAD no encuentra ninguno de los objetos borrados. No se guarda el historial del sólido (SOLIDHIST, SHOWHISTORY).

## Questions

### ¿Cómo se llama el comando SUBTRACT en español?

DIFERENCIA, con el alias `DIF`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_SUBTRACT`.

### ¿Cómo resto un sólido de otro?

Dibuja el sólido que vas a quitar donde se solape con el otro: un cilindro que atraviese un prisma, para un agujero. Ejecuta DIFERENCIA, designa el prisma y pulsa Intro, y después designa el cilindro y pulsa Intro: el prisma se queda con un agujero y el cilindro desaparece. El orden importa: lo que designas primero es lo que queda.

### ¿Por qué no funciona DIFERENCIA?

A menudo, por el orden: lo que se queda va en el primer conjunto, y lo que se resta, en el segundo. Si el primer conjunto no tiene ningún sólido ni región, o el segundo no tiene ninguno que no esté ya en el primero, dice <Message id="noSolidsOrRegionsSelected" /> y termina; si no se puede restar nada del segundo al primero, como un sólido de una región o una región de otro plano, dice <Message id="subtractNeedsTwo" /> y no cambia nada. Las líneas y las polilíneas hay que convertirlas antes en regiones. Cuando dice que ha fallado una operación booleana, los sólidos se cortan de un modo que MellowCAD aún no sabe calcular, y se quedan como estaban.

### ¿Cómo resto un área en AutoCAD?

Para quitar una forma 2D de otra, convierte las dos en regiones con <Command id="REGION" /> y resta la interior de la exterior con DIFERENCIA: un cuadrado al que se le resta un círculo pasa a ser una sola región con un agujero. Para medir un área sin cambiar el dibujo, <Command id="AREA" /> resta espacios de su total acumulado con <Keyword command="AREA" id="Subtract" />.

### ¿Cómo resto sin borrar el objeto?

DIFERENCIA borra lo que resta, como la de AutoCAD. Para conservarlo, cópialo antes en su sitio: <Command id="COPY" />, el objeto e Intro, un punto base 0,0 y otro Intro, que lo copia con un desplazamiento de 0,0, encima de sí mismo. DIFERENCIA gasta después una de las dos copias.
