---
title: "Vistas en AutoCAD: comando VISTA (VIEW)"
metaTitle: "Vista isométrica en AutoCAD: VISTA (VIEW)"
description: "Cómo funciona VISTA (VIEW, alias VI) de AutoCAD en español: las seis vistas ortogonales, las cuatro isométricas y el SCP que fija cada ortogonal. Pruébalo."
figure: "Una pieza escalonada dibujada en planta: -VISTA e Isométrica SO, y se ve desde el suroeste y desde arriba, con el estilo visual Oculto."
sourceHash: "261c8657f5f7"
---

VISTA (VIEW en inglés) gira la vista hacia una de las diez vistas predefinidas de AutoCAD: seis ortogonales, que miran de frente a un lado del modelo, y cuatro isométricas, que miran hacia abajo desde una esquina. Nada del dibujo se mueve. VISTA ejecuta <Command id="-VIEW" />, la forma de la línea de comando: su primera solicitud ofrece <Keyword id="Orthographic" />, que después pide el lado, y también admite directamente el nombre de una vista, como hacen los menús de AutoCAD: <Command id="-VIEW" /> y después <Keyword id="SWiso" />. Cada vista encuadra todo el dibujo y dice <Message id="regeneratingModel" />.

Los controles de vista de la esquina superior izquierda del dibujo listan las mismas diez vistas y ejecutan <Command id="-VIEW" />, y las caras y las esquinas del ViewCube también giran hacia ellas, sin cambiar el SCP. Cada VISTA es un paso de deshacer, así que <Command id="U" /> deshace la vista junto con el SCP que fijó. Escrito con un apóstrofo dentro de otro comando, se niega con <Message id="requiresRegen" />. El 3D de MellowCAD es solo de sólidos y aún parcial.

## Options

### Orthographic

Pide el lado al que mirar, <Keyword id="Top" /> por defecto, así que Intro ahí da la planta: <Keyword id="Top" />, <Keyword id="Bottom" />, <Keyword id="Front" />, <Keyword id="BAck" />, <Keyword id="Left" /> o <Keyword id="Right" />. Todas se ven derechas: Superior muestra X a la derecha e Y arriba, Frontal X a la derecha y Z arriba, e Inferior, vista desde abajo, X a la izquierda. Escrito en la primera solicitud, cada lado funciona sin elegir la opción.

Cada una gira además el SCP para que quede de cara a ti, a partir de los ejes universales sea cual sea el SCP, con su origen en `0,0,0`, como hace la opción ortogonal de <Command id="UCS" />: después de Frontal su plano XY es la cara frontal, así que lo que dibujas queda plano en la pantalla, y el SCP se llama `*FRONTAL*`. Después de Superior tiene los ejes universales, y se llama `*SUPERIOR*`.

### SWiso

Isométrica suroeste: mira hacia abajo desde la esquina de delante a la izquierda, y ve la cara frontal, el lado izquierdo y la parte superior. El SCP se queda como está. Es la vista de la figura.

### SEiso

Isométrica sureste: mira hacia abajo desde la esquina de delante a la derecha, y ve la cara frontal, el lado derecho y la parte superior. El SCP se queda como está.

### NEiso

Isométrica noreste: mira hacia abajo desde la esquina de detrás a la derecha, y ve la cara posterior, el lado derecho y la parte superior. El SCP se queda como está.

### NWiso

Isométrica noroeste: mira hacia abajo desde la esquina de detrás a la izquierda, y ve la cara posterior, el lado izquierdo y la parte superior. El SCP se queda como está.

## Missing

Las vistas con nombre: <Keyword id="Orthographic" /> es la única opción que lista la primera solicitud, donde la de AutoCAD lista también `?`, Suprimir, Restituir, Guardar, Parámetros y Ventana, y un nombre escrito ahí se rechaza. El Administrador de vistas, que VISTA abre en AutoCAD. Sin nada dibujado, una vista conserva el zoom, donde AutoCAD encuadra los límites del dibujo. UCSORTHO y UCSBASE como variables: una vista ortogonal siempre alinea el SCP, a partir de los ejes universales. El SCP alineado en la lista de <Keyword command="UCS" id="Previous" /> de <Command id="UCS" />.

## Questions

### ¿Cómo se pone la vista isométrica en AutoCAD?

Escribe <Command id="-VIEW" /> y después <Keyword id="SWiso" /> para la isométrica suroeste; <Keyword id="SEiso" />, <Keyword id="NEiso" /> y <Keyword id="NWiso" /> dan las otras tres esquinas. O elige Isométrica SO en los controles de vista de la esquina superior izquierda, o haz clic en una esquina superior del ViewCube. <Command id="VSCURRENT" /> con <Keyword command="VSCURRENT" id="Hidden" /> oculta las aristas de detrás.

### ¿Cuál es el comando de la vista superior?

<Command id="-VIEW" /> y después <Keyword id="Top" />, que además pone el SCP con los ejes universales. <Command id="PLAN" />, en cambio, mira en perpendicular al SCP actual y lo deja como está.

### ¿Por qué ha cambiado el SCP después de una vista frontal?

Una vista ortogonal gira el SCP para que quede de cara a ti, de modo que lo que dibujas queda en el plano de la pantalla. <Command id="UCS" /> e Intro vuelven al Universal; <Command id="U" /> deshace la vista y su SCP a la vez.

### ¿Una vista isométrica es lo mismo que un dibujo isométrico?

No. Una vista isométrica mira un modelo 3D desde una esquina. Un dibujo isométrico es 2D, dibujado sobre los planos isométricos con el estilo isométrico de FORZCURSOR, que MellowCAD aún no tiene.

### ¿Dónde está el Administrador de vistas?

VISTA ejecuta <Command id="-VIEW" /> en la línea de comando: no hay Administrador de vistas, y las vistas con nombre (Guardar, Restituir) aún no están.
