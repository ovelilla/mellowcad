---
title: "Unión de sólidos en AutoCAD: UNION"
metaTitle: "Unión de sólidos en AutoCAD: comando UNION"
description: "Cómo funciona UNION (alias UNI) de AutoCAD en español: sólidos 3D, o regiones de un mismo plano, unidos en un solo objeto, y por qué pide dos. Pruébalo gratis."
figure: "Dos prismas rectangulares que se solapan, unidos en un solo sólido con UNION: vistos desde el sudeste, sin las líneas ocultas."
sourceHash: "be43813a7dee"
---

UNION une dos o más sólidos 3D en un solo sólido, o dos o más regiones de un mismo plano en una sola región: lo que se solapa cuenta una vez, y las aristas interiores desaparecen. Pide objetos, tantos como quieras, e Intro los une. Como en AutoCAD 2027, descarta el conjunto designado antes del comando y vuelve a pedirlo, y pasa por alto lo que no es un sólido ni una región. Los sólidos y las regiones se unen por separado: todos los sólidos en uno, y las regiones, plano a plano.

El objeto designado primero pasa a ser el resultado, con su capa y su color, y los demás se borran; si se designan con una ventana, una captura o todos a la vez, es el más reciente de ellos. El resultado es un sólido compuesto: ya no es un prisma rectangular ni un cilindro, no tiene historial (<Command id="LIST" /> lo dice) y, designado, muestra un solo pinzamiento, que lo desplaza entero. Los sólidos que no se tocan pasan a ser un objeto de dos piezas. Todo el comando es un solo paso de deshacer. El 3D de MellowCAD aún es parcial: hay sólidos, pero no superficies ni mallas.

## Missing

Las superficies, que aquí no existen. Las caras curvas que se cortan en una curva para la que MellowCAD aún no tiene una forma exacta: cilindros, conos, esferas o toroides cuyos ejes ni coinciden ni son paralelos (dos cilindros también pueden cortarse); un cono con algo que no sea un plano o un sólido sobre su eje; un toroide o un sólido de revolución con un plano que ni es perpendicular a su eje ni pasa por él, o con un sólido fuera de su eje; un sólido extruido con algo que no sea un plano o una cara extruida en su dirección. Se rechazan, y los sólidos se quedan como estaban; igual que un corte que toca una arista de forma tangente, unas caras casi pero no del todo sobre una misma superficie y una lámina muy fina entre un corte y una arista. Un cilindro apoyado a lo largo de una cara de un prisma se une con el volumen correcto, pero con una arista y una cara menos que en AutoCAD. No se guarda el historial del sólido (SOLIDHIST, SHOWHISTORY).

## Questions

### ¿Cómo se llama el comando UNION en español?

UNION, igual que en inglés, con el alias `UNI`. El nombre inglés con un guion bajo delante, `_UNION`, funciona en cualquier idioma de AutoCAD.

### ¿Por qué no funciona UNION?

Necesita dos sólidos, o dos regiones del mismo plano: con menos dice <Message id="booleanNeedsTwo" /> y no cambia nada. Las líneas, los arcos y las polilíneas no son regiones, aunque estén cerradas: conviértelas antes en regiones con <Command id="REGION" />. Los objetos designados antes de UNION se descartan, como en AutoCAD 2027: desígnalos en su solicitud. Cuando dice que ha fallado una operación booleana, los sólidos se cortan de un modo que MellowCAD aún no sabe calcular, y se quedan como estaban.

### ¿Cómo deshago una unión?

Con <Command id="U" /> o Ctrl+Z justo después: todo el comando vuelve atrás en un solo paso, con los objetos como estaban. Más tarde ya no hay nada que separar, porque el sólido unido no guarda sus partes. La operación contraria es <Command id="SUBTRACT" />, que resta sólidos en lugar de sumarlos.

### ¿Cómo uno regiones con UNION?

Convierte cada contorno cerrado en una región con <Command id="REGION" /> y únelas con UNION: las regiones de cada plano pasan a ser una sola, con los lados comunes fundidos. Las formas que se cierran alrededor de un hueco dejan un agujero, y las regiones separadas pasan a ser una sola región de varias piezas. Una región sola en su plano se queda como está.
