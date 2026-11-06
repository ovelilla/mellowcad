---
title: "Mostrar u ocultar atributos en AutoCAD: ATRVIS (ATTDISP)"
metaTitle: "Mostrar u ocultar atributos en AutoCAD: ATRVIS"
description: "Cómo funciona ATRVIS (ATTDISP) de AutoCAD en español: Normal, ACT para ver también los atributos invisibles, DES para ocultarlos todos. Pruébalo gratis."
figure: "Dos mesas cuyos números de pieza son atributos invisibles: ATRVIS ACT los muestra bajo cada mesa, junto a los números visibles."
sourceHash: "8821fdeb2077"
---

ATRVIS (ATTDISP en inglés) fija qué atributos muestran las referencias a bloque del dibujo. Pide el parámetro y ofrece el actual, Normal en un dibujo nuevo; cualquier otra palabra dice que la opción no es válida y vuelve a preguntar, e Intro lo conserva. Un cambio vuelve a dibujar todo el dibujo, <Message id="regeneratingModel" /> como lo dice AutoCAD 2027, y se guarda con el dibujo como ATTMODE, un paso que <Command id="U" /> deshace. Escrito con un apóstrofo dentro de un comando, también se ejecuta ahí.

Solo cambia lo que se ve: un atributo invisible conserva su valor, y uno oculto se puede seguir editando con <Command id="ATTEDIT" /> o <Command id="EATTEDIT" />.

## Options

### Normal

Muestra cada atributo como se definió: los visibles, no los definidos con el modo <Keyword command="ATTDEF" id="Invisible" /> de <Command id="ATTDEF" />.

### ON

Muestra todos los atributos, también los invisibles.

### OFF

Oculta todos los atributos, también los visibles.

## Questions

### ¿Cómo muestro los atributos invisibles en AutoCAD?

Escribe `ATRVIS` y elige <Keyword id="ON" />: se muestran todos los atributos, también los invisibles. <Keyword id="Normal" /> los vuelve a ocultar.

### ¿Por qué no se ven los atributos de mi bloque?

<Command id="ATTDISP" /> puede estar en <Keyword id="OFF" />, que oculta todos los atributos, o en <Keyword id="Normal" /> con los atributos definidos como invisibles. Elige <Keyword id="ON" /> para verlos todos. Una referencia cuyo bloque no tiene atributos no muestra ninguno, sea cual sea el parámetro.

### ¿Cómo oculto los valores de atributo en AutoCAD?

Defínelos invisibles: el modo <Keyword command="ATTDEF" id="Invisible" /> de <Command id="ATTDEF" />, antes de crear el bloque. ATRVIS <Keyword id="OFF" /> oculta todos los atributos a la vez, en todo el dibujo.
