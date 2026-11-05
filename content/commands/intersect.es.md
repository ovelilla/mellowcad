---
title: "Intersección de sólidos en AutoCAD: INTERSEC (INTERSECT)"
metaTitle: "Intersección de sólidos en AutoCAD: INTERSEC"
description: "Cómo funciona INTERSEC (INTERSECT, alias INT) de AutoCAD en español: sólidos 3D, o regiones de un plano, reducidos a lo que comparten. Pruébalo gratis."
figure: "Un prisma rectangular y una esfera que lo desborda, intersecados: lo que comparten es una bola con seis caras planas, vista desde el sudeste."
sourceHash: "c8ea61c0525d"
---

INTERSEC (INTERSECT en inglés) conserva solo lo que tienen en común dos o más sólidos 3D, o dos o más regiones de un mismo plano, y borra el resto: un prisma rectangular y una esfera que lo desborda dejan una bola con caras planas. Pide objetos hasta Intro, como <Command id="UNION" />, y pasa por alto lo que no es un sólido ni una región. Como en AutoCAD 2027, descarta el conjunto designado antes del comando y vuelve a pedirlo. Los sólidos y las regiones se calculan por separado, y las regiones, plano a plano.

El objeto designado primero pasa a ser el resultado, con su capa y su color, y los demás se borran; si se designan con una ventana, una captura o todos a la vez, es el más reciente de ellos. El resultado es un sólido compuesto, que ya no es un prisma ni una esfera y no tiene historial. Cuando los objetos no tienen nada en común, dice <Message id="nullSolid" /> o <Message id="nullRegion" /> y los borra todos, como AutoCAD. Todo el comando es un solo paso de deshacer. El 3D de MellowCAD aún es parcial: hay sólidos, pero no superficies ni mallas.

## Missing

Las superficies, que aquí no existen. Las caras curvas que se cortan en una curva para la que MellowCAD aún no tiene una forma exacta: cilindros, conos, esferas o toroides cuyos ejes ni coinciden ni son paralelos (dos cilindros también pueden cortarse); un cono con algo que no sea un plano o un sólido sobre su eje; un toroide o un sólido de revolución con un plano que ni es perpendicular a su eje ni pasa por él, o con un sólido fuera de su eje; un sólido extruido con algo que no sea un plano o una cara extruida en su dirección. Se rechazan con un mensaje de que ha fallado una operación booleana, y los sólidos se quedan como estaban; igual que un corte que toca una arista de forma tangente, unas caras casi pero no del todo sobre una misma superficie y una lámina muy fina entre un corte y una arista. Un cilindro apoyado a lo largo de una cara de un prisma se une con el volumen correcto, pero con una arista y una cara menos que en AutoCAD. No se guarda el historial del sólido (SOLIDHIST, SHOWHISTORY), y qué objeto conservan Borde o Previo está sin verificar.

## Questions

### ¿Cómo se llama el comando INTERSECT en español?

INTERSEC, con el alias `INT`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_INTERSECT`.

### ¿Qué diferencia hay entre UNION, DIFERENCIA e INTERSEC?

Los tres hacen un solo objeto con sólidos 3D, o con regiones de un mismo plano. <Command id="UNION" /> conserva todo lo que cubre cualquiera de ellos, <Command id="SUBTRACT" /> conserva el primer conjunto menos el segundo, e INTERSEC conserva solo lo que comparten todos. Cada uno es un solo paso de deshacer, y cada uno borra los objetos que consume.

### ¿Cómo hago que dos líneas se corten en AutoCAD?

No con INTERSEC, que trabaja con sólidos y regiones y pasa por alto las líneas. Para encontrar el punto donde se cruzan, usa la referencia a objetos Intersección; para que se encuentren, <Command id="FILLET" /> con radio 0, <Command id="TRIM" /> o <Command id="EXTEND" />.

### ¿Por qué INTERSEC borra mis objetos?

Porque no tienen nada en común: sin parte compartida dice <Message id="nullSolid" />, o <Message id="nullRegion" /> con regiones, y los borra, como AutoCAD. <Command id="U" /> los recupera. Un sólido y una región, o dos regiones de planos distintos, no se intersecan: dice <Message id="booleanNeedsTwo" /> y no cambia nada.
