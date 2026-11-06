---
title: "Esfera en AutoCAD: comando ESFERA (SPHERE)"
metaTitle: "Esfera en AutoCAD 3D: comando ESFERA (SPHERE)"
description: "Cómo funciona ESFERA (SPHERE) de AutoCAD en español, solicitud a solicitud: centro y radio, Diámetro, 3P, 2P y Ttr, y por qué se ve con líneas. Pruébalo gratis."
figure: "Una esfera de radio 25 desde su centro, vista desde el sureste con el estilo visual Conceptual."
sourceHash: "a35a57352d16"
---

ESFERA (SPHERE en inglés) dibuja una esfera, un sólido 3D: precisa el centro y después el radio. Un radio señalado con el ratón se lee en el plano que pasa por el centro, y el último radio se ofrece como valor por defecto que Intro acepta, compartido con <Command id="CYLINDER" />, <Command id="CONE" /> y las demás primitivas. La esfera va a la capa actual, y Deshacer la revierte en un paso.

En Estructura alámbrica 2D y Oculto se dibuja con líneas: meridianos y paralelos, tantos como dice `ISOLINES`, y la referencia a objetos no encuentra en ella nada más que su centro. <Command id="LIST" /> muestra su posición y su radio, y la paleta Propiedades deja escribir el radio o el diámetro. Sus pinzamientos la desplazan y, en cada cuadrante de su ecuador, fijan su radio. Es un sólido 3D para <Command id="UNION" />, <Command id="SUBTRACT" /> y el resto del 3D de MellowCAD, que es solo de sólidos y aún parcial.

## Options

### 3P

En el centro: pide tres puntos, y la esfera queda centrada en el círculo que pasa por ellos, con su radio.

### 2P

En el centro: pide los dos extremos de un diámetro, en cualquier lugar del espacio.

### Ttr

En el centro: designa dos líneas, círculos o arcos, con la referencia a objetos Tangente, y precisa un radio: el centro queda en el círculo de ese radio que toca los dos, a su altura.

### Diameter

En el radio: pide en su lugar el diámetro, y ofrece el doble del último radio.

## Missing

<Command id="EXPLODE" /> de una esfera, que AutoCAD convierte en una superficie: MellowCAD no tiene superficies, así que dice que no ha podido descomponerla. Desplazar, Girar, Escalar y Simetría desde un pinzamiento activo, y los comandos 3D propios (desplazar, girar y escalar en 3D). La silueta que dibuja `DISPSILH` en AutoCAD. Los estilos visuales que le faltan a <Command id="VSCURRENT" /> además de Estructura alámbrica 2D, Oculto y Conceptual.

## Questions

### ¿Cómo hacer una esfera en AutoCAD?

Ejecuta ESFERA, precisa el centro y después el radio: `0,0,0` y `25` dibujan la esfera de la figura. Gira la vista para verla redonda, con una esquina del ViewCube o con <Command id="-VIEW" /> y <Keyword command="VIEW" id="SEiso" />.

### ¿Por qué la esfera se ve como un círculo con líneas?

Estructura alámbrica 2D y Oculto dibujan una esfera con sus meridianos y paralelos; en planta son un círculo y unas líneas que lo cruzan. <Command id="VSCURRENT" /> con <Keyword command="VSCURRENT" id="Conceptual" /> la sombrea, y `ISOLINES` fija cuántas líneas muestra.

### ¿Cómo hacer una semiesfera?

Dibuja la esfera y córtala por su centro con <Command id="SLICE" />: tres puntos del plano, o <Keyword command="SLICE" id="XY" /> y el centro, y después el lado que conservas.

### ¿Cómo dibujar una esfera por su diámetro?

En el radio, elige <Keyword id="Diameter" /> y escribe el diámetro. Con <Keyword id="2P" />, los dos extremos de un diámetro también la sitúan.
