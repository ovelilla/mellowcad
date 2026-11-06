---
title: "Cuña en AutoCAD: comando CUÑA (WEDGE)"
metaTitle: "Cuña en AutoCAD 3D: comando CUÑA (WEDGE)"
description: "Cómo funciona CUÑA (WEDGE, alias CU) de AutoCAD en español, solicitud a solicitud: dos esquinas y una altura, Centro, Cubo, Longitud y 2Puntos. Pruébalo gratis."
figure: "Una cuña de 60 por 40 por 25, con dos esquinas y una altura, con la pendiente bajando desde el lado de la primera esquina, vista desde el sureste con el estilo visual Oculto."
sourceHash: "06fba2eeb7be"
---

CUÑA (WEDGE en inglés) dibuja una cuña, un sólido 3D: un prisma rectangular cuya cara superior baja en pendiente de un extremo al otro. Pide lo mismo que <Command id="BOX" />: la primera esquina, la otra esquina y después la altura. El extremo alto está en la primera esquina, y la pendiente baja a lo largo del eje X del SCP hacia el lado de la otra esquina; una esquina con una X menor le da la vuelta. La altura sube por el eje Z del SCP, una negativa baja. La longitud, la anchura y la altura son los valores por defecto de <Command id="BOX" />, que Intro acepta. La cuña va a la capa actual, y Deshacer la revierte en un paso.

<Command id="LIST" /> muestra su posición, longitud, anchura, altura y rotación, y la paleta Propiedades deja escribirlas. Sus pinzamientos son los de <Command id="BOX" />. Es un sólido 3D para <Command id="UNION" />, <Command id="SUBTRACT" /> y el resto del 3D de MellowCAD, que es solo de sólidos y aún parcial; <Command id="EXPLODE" /> la convierte en una región por cara.

## Options

### Center

En la primera solicitud: pide el centro y después una esquina, <Keyword id="Cube" /> o <Keyword id="Length" />. La cuña queda centrada en el punto, también en altura, con el extremo alto en el lado opuesto a la esquina precisada.

### Cube

En la otra esquina: pide una longitud y crea una cuña con todos los lados de esa longitud. A diferencia del de <Command id="BOX" />, va a lo largo del eje X del SCP, hacia atrás si es negativa.

### Length

En la otra esquina: pide la longitud, a lo largo del eje X del SCP, y después la anchura, a lo largo de su eje Y; una negativa va hacia atrás. Un punto da solo su distancia, nunca su dirección.

### 2Point

En la altura: pide dos puntos, y la altura es la distancia entre ellos.

## Missing

Lo que le falta a <Command id="BOX" />: Desplazar, Girar, Escalar y Simetría desde un pinzamiento activo, los comandos 3D propios, las cotas punteadas mientras precisas la esquina y los estilos visuales que le faltan a <Command id="VSCURRENT" />. En planta, la referencia a objetos Punto final bajo el extremo alto encuentra la esquina de arriba, donde AutoCAD encuentra la de la base.

## Questions

### ¿Cómo se llama el comando WEDGE en español?

CUÑA, con el alias `CU`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_WEDGE`. Escríbelo y pulsa Intro o la barra espaciadora, y después precisa la primera esquina, la otra esquina y la altura: `0,0`, `60,40` y `25` dibujan la cuña de la figura.

### ¿Hacia dónde baja la pendiente de la cuña?

Desde el lado de la primera esquina, a lo largo del eje X del SCP. Para girarla, precisa la otra esquina con una X menor, que la gira 180°, o gírala después con <Command id="ROTATE" />.

### ¿Cómo dibujar un prisma triangular?

Una cuña lo es: un triángulo rectángulo en cada extremo, prolongado a lo largo de la anchura. Para cualquier otro triángulo, dibújalo cerrado con <Command id="PLINE" /> y extrúyelo con <Command id="EXTRUDE" />.

### ¿Cómo dibujar una cuña desde su centro?

Elige <Keyword id="Center" /> y precisa el centro, y después una esquina, <Keyword id="Cube" /> o <Keyword id="Length" />: la cuña queda centrada en el punto, también en altura.
