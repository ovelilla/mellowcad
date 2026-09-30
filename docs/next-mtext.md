# MTEXT — brief

> **Estado:** implementado (2026-09-30; el usuario delegó las decisiones de §7 con el criterio «como lo
> hace AutoCAD, la rueda ya está inventada»). Las reglas ya están en `.github/instructions/` y la
> capacidad en la fila de `docs/autocad-coverage.md`; este fichero se borra cuando MTEXT esté en `main`.
>
> **Fuentes:** ayuda de AutoCAD 2026 ENU/ESP, `https://help.autodesk.com/view/ACD/2026/ENU/?guid=` +
> GUID: MTEXT `GUID-E6BCE05D-B9E3-4875-BBBC-29134EA6FD51`, -MTEXT `GUID-F94BE932-DA31-437E-9610-27F46ACD5711`,
> To Create Text `GUID-8739509C-15A7-4582-BF7C-3D83ED2A23B5`, To Modify Multiline Text
> `GUID-3740EC59-FB75-47FD-B042-03D6AC095D4F`, About Multiline Text Format
> `GUID-E4DC3A14-3F0A-46AE-9503-6BBEE8DAF916`, EXPLODE `GUID-E98BCEF4-DED6-48A6-87EB-10FE87188083`,
> MTJIGSTRING `GUID-A4497DDB-EAC9-4DFD-837D-19B85C6426C1`, OSNAPNODELEGACY
> `GUID-BF86DE5F-49D6-481D-BE1E-09A89F0F3DD2`. DXF: MTEXT `GUID-5E5DB93B-F8D3-4433-ADF7-E92E250D2BAB`
> (`/view/OARX/2026/ENU/`). ObjectARX `AcDb::LineSpacingStyle`. Atajos: `autodesk.com/shortcuts/autocad`.

## 0. Resumen

1. Nueva entidad `mtext` (texto de líneas múltiples): un punto de inserción, una anchura (0 = sin ajuste
   de línea), una de nueve uniones TL…BR, altura, rotación, estilo e interlineado. Lo que se ve —las
   líneas ya partidas, el tamaño real del marco— se **deriva** con `measureTextWidth`; no se guarda.
2. Comando `MTEXT` / `T` / `MT` (es `TEXTOM`) con la secuencia de AutoCAD: primera esquina, esquina
   opuesta o `[Height/Justify/Line spacing/Rotation/Style/Width]`, y el editor.
3. El editor es el cuadro de entrada dinámica convertido en un área de texto de varias líneas, y lo
   tecleado se dibuja en su sitio, partido al ancho y dentro de su marco (la misma desviación que ya
   hace TEXT). Enter = párrafo nuevo; Ctrl+Enter o clic fuera = guardar; Esc = descartar.
4. `-MTEXT` (es `-TEXTOM`): la misma entidad por línea de comandos, una línea por solicitud.
5. Edición: doble clic y TEXTEDIT abren el mismo editor sobre el objeto. EXPLODE lo convierte en TEXT.
6. Fuera de alcance, anotado en la cobertura: columnas, códigos de formato en línea, la regla del
   editor, sangrías y tabulaciones, listas, máscara de fondo, marco de texto, Node sobre MTEXT, el
   `Mtext` de las cotas y pegar texto ajeno como MTEXT (véase §7). El formato en línea que ya traiga
   un contenido se conserva, aunque no se pinte.

## 1. El contrato de AutoCAD (lo verificado)

**Nombre y alias.** `MTEXT`, alias `T` y `MT` (guía de atajos de Autodesk). `-MTEXT` existe con página
propia. En español, `TEXTOM` y `-TEXTOM` (títulos de las páginas ESP con los mismos GUID).

**Solicitudes.** La ayuda describe las opciones en prosa y no imprime las cadenas; las que siguen son las
del producto y se tratan como **a verificar con capturas** (igual que se hizo con TEXT):

```
Specify first corner:
Specify opposite corner or [Height/Justify/Line spacing/Rotation/Style/Width/Columns]:
  Height        Specify height <2.5>:
  Justify       Enter justification [TL/TC/TR/ML/MC/MR/BL/BC/BR] <TL>:
  Line spacing  Enter line spacing type [At least/Exactly] <At least>:
                Enter line spacing factor or distance <1x>:
  Rotation      Specify rotation angle <0>:
  Style         Enter style name or [?] <Standard>:
  Width         Specify width:
-MTEXT, tras el marco:  MText:   (una línea por solicitud; Enter en vacío termina)
```

Lo verificado de cada opción:

- **Primera esquina / opuesta.** "As you click … one corner followed by the diagonal corner, a rectangle is
  displayed to show the location and size … Arrows within the rectangle indicate the direction of the
  paragraph's text flow." La anchura del objeto es la del rectángulo. "The justification point is based
  on the first point used to specify the rectangle."
- **MTJIGSTRING** (inicial `"abc"`): "the content of the sample text displayed at the cursor location
  when the MTEXT command is started … in the current text size and font."
- **Height, Rotation, Style, Justify, Line spacing** vuelven a la solicitud de la esquina opuesta ("The
  previous prompt is redisplayed until you specify the opposite corner"). La altura por defecto es la del
  estilo si es fija; si no, TEXTSIZE, y al cambiarla se actualiza TEXTSIZE.
- **Width** sustituye a la esquina opuesta y abre el editor. "If you specify a width of 0, word wrap is
  turned off and the width of the multiline text object is as wide as the longest line of text."
- **Justify** decide a la vez la alineación de las líneas (izquierda/centro/derecha dentro del marco) y el
  flujo ("Text flows from the insertion point, which can be at the middle, the top, or the bottom").
- **Interlineado.** "Single spacing is 1.66 times the height of the text characters"; ObjectARX lo da exacto:
  "line spacing is really 5/3 of the font size". Factor 0.25–4 (DXF 44), escrito con `x` (`2x`); sin `x` es
  una distancia absoluta. "At least" (por defecto) crece con el carácter más alto de la línea; "Exactly"
  no. Sin alturas en línea, **los dos dan lo mismo**; se guarda y se edita igual, por fidelidad del fichero.
- **Ajuste de línea.** "Words which exceed this width value will not be broken, but will extend beyond the
  given width" (.NET `MText.Width`). "Spaces entered at the end of a line are included … and affect the
  justification of the line."
- **Editor.** Guardar: "Click in the drawing outside the editor. / Press Ctrl+Enter." "Press Esc to exit
  the editor without saving your changes."
- **Edición.** Doble clic abre el editor in situ; TEXTEDIT acepta "a selected multiline or single-line
  text object". EXPLODE: "Multiline Text — Explodes into text objects."
- **Referencias.** Inserción: "Snaps to the insertion point of objects such as an attribute, a block, or
  text." OSNAPNODELEGACY 0 (inicial) deja a Node engancharse al MTEXT en puntos que dependen de la unión;
  cuáles, no lo dice.

## 2. Modelo

```ts
type MTextAttachment =
  "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br" // DXF 71
type LineSpacingStyle = "atLeast" | "exactly" // DXF 73

interface MTextEntity extends EntityBase {
  readonly type: "mtext"
  readonly position: Vec2 // DXF 10, el punto de unión
  readonly contents: string // la cadena de AutoCAD (DXF 1/3), con \P y escapes (véase D1)
  readonly height: number // DXF 40
  readonly width: number // DXF 41; 0 = sin ajuste
  readonly rotation: number // DXF 50, radianes
  readonly attachment: MTextAttachment
  readonly lineSpacingStyle: LineSpacingStyle
  readonly lineSpacingFactor: number // DXF 44, 0.25–4
  readonly styleId: TextStyleId
}
```

`MTextAttachment` es un subconjunto de `TextJustify` (los mismos ids), así que `horizontalExtent` y
`verticalExtent` de `text.ts` sirven tal cual para colgar el marco del punto.

**Códec, en `domain/mtext.ts`:** `mtextParagraphs(contents)` lee la cadena de AutoCAD de forma tolerante
(`\P` párrafo, `\~` espacio duro, `\\` `\{` `\}` literales; las llaves de grupo y los códigos que aún no
se pintan — `\L\l\O\o\K\k`, y los de valor hasta su `;` — se saltan sin perder el texto), y
`mtextContents(paragraphs)` escribe lo tecleado escapando `\`, `{` y `}`. Así un contenido con formato
que venga de fuera se muestra como texto y se conserva intacto mientras nadie lo reescriba.

**Derivado, en `domain/mtext.ts`:** `mtextLayout(entity)` → líneas `{ value, x, baseline }` en coordenadas
locales + anchura y altura reales. Parte cada párrafo por espacios con `measureTextWidth`; una palabra más
larga que la anchura se queda entera y sobresale. Paso entre líneas = factor × 5/3 × altura. Altura del
marco = altura + (n − 1) × paso (de la parte alta de las mayúsculas a la última línea base, como el marco
de TEXT). Anchura del marco = la definida, o la línea más larga si es 0. Una línea vacía cuenta.

**Dibujo:** una primitiva `text` por línea, con la alineación de la columna de la unión (izquierda, centro,
derecha). No hace falta una primitiva nueva.

## 3. El comando

`MTextTool` en `application/tools/`, siguiendo `cad-tools.instructions.md`:

- `corner` → primera esquina, con MTJIGSTRING (`abc`) a la altura actual junto al cursor. Enter en vacío
  termina.
- `opposite` → rectángulo elástico con la flecha del flujo; `Height`, `Justify`, `Line spacing`,
  `Rotation`, `Style`, `Width`. `Columns` no se ofrece (como TEXT no ofrece Align/Fit). La rotación gira el
  rectángulo.
- `edit` → el editor (§4). Guardar ejecuta un único `AddEntityCommand`: un gesto, un deshacer.
- Altura, rotación, unión, interlineado y estilo se recuerdan entre invocaciones, como en TextTool.

`-MTEXT`: la misma máquina, pero `edit` pregunta `MText:` línea a línea con el campo de texto de una línea;
Enter en vacío guarda y termina.

## 4. El editor

- Un tipo de campo nuevo en la entrada dinámica, `paragraphs`: `<textarea>` en
  `components/cad/dynamic-input.tsx`. Enter inserta un salto; Ctrl+Enter confirma; Esc cancela.
- Lo tecleado se dibuja en su sitio con `mtextLayout`, más el marco del objeto en `THEME.rubberBand`.
  No hay cursor de texto en el lienzo (la misma desviación que TEXT, con su `WHY`).
- Clic fuera del marco guarda y termina; clic dentro no hace nada.
- **Esc descarta.** TextTool guarda en `onDeactivate` porque en DTEXT salir conserva lo tecleado; aquí Esc
  tiene que distinguirse de las demás salidas. Hay que comprobar en `cad-runtime.instructions.md` el orden
  de las teclas y decidir si basta `onKeyDown` o hace falta un gancho de cancelación en `Tool`.
- MTEXTFIXED 2 (inicial) muestra el texto horizontal y legible mientras se teclea; se implementa como 0
  (WYSIWYG), anotado como desviación.

## 5. El checklist de entidad nueva

Todo lo de «Adding an entity type» en `cad-engine.instructions.md`, con estas decisiones:

- **Selección y medida:** el marco rotado; `closestOnEntity` lo trata como área rellena (como TEXT).
- **Transformaciones:** como TEXT; `scaleEntity` escala altura y anchura. La simetría sigue lo que hace
  hoy TEXT (MIRRTEXT sigue sin modelar).
- **Estirar:** mueve el punto de unión si cae dentro de la ventana.
- **Referencias:** Inserción, en `insertionProvider`. Node no (no se sabe dónde caen; §1).
- **Pinzamientos:** uno en el punto de unión, que mueve, y el de anchura (la flecha del borde derecho),
  que cambia la anchura definida. Un gesto, un deshacer.
- **Paleta:** Contents (solo lectura, como TEXT), Style, Justify, Text height, Rotation, Line space factor,
  Line space distance, Line space style, Defined width.
- **Fichero:** `VERSION` + 1, parser tolerante (factor fuera de 0.25–4 se recorta; unión desconocida → TL).
- **EXPLODE:** un TEXT por línea mostrada, en su línea base, con alineación izquierda/centro/derecha según
  la columna de la unión y la altura, rotación, estilo, capa y propiedades del MTEXT. El detalle no lo
  documenta Autodesk; se anota.
- **TEXTEDIT y doble clic:** abren el editor de §4 sobre el objeto, oculto mientras se edita.
- **Herramientas de edición** que no actúan sobre él (`EdgeEditTool`, `BreakTool`, `OffsetTool`,
  `DimensionTool`, `lastDrawnPoint`): `null` explícito. `test/arbitraries.ts` debe generarlo.

## 6. Textos

Catálogo `commands` en `cad/locales/en.json` y `es.json`: nombres, alias, solicitudes, palabras clave y el
nombre de la entidad en `interface.entity`, más las filas de `interface.property`. `npm run locales`.

## 7. Decisiones

- **D1. El contenido es la cadena de AutoCAD** (`\P` y escapes), no texto plano. Es el formato del objeto
  en AutoCAD y en DXF: el formato en línea, la importación y la exportación llegan sin cambiar el modelo
  ni migrar ficheros. El coste es el códec de §2, puro y con sus propiedades de ida y vuelta.
- **D2. Interlineado 5/3.** `TEXT_LINE_SPACING_FACTOR` pasa de 1.66 a 5/3, el valor exacto de ObjectARX
  (la ayuda redondea a 1.66), y lo usan TEXT y MTEXT. Mueve las líneas de DTEXT un 0,4 %.
- **D3. Alias en español: los del `acad.pgp` español.** `T` sigue en `TEXTO` (lo dan las transcripciones
  del fichero); la guía de atajos en español es una traducción de la inglesa y no cuenta. `TEXTOM` lleva
  el alias que den esas transcripciones, o ninguno.
- **D4. Pegar texto ajeno como MTEXT** es de PASTECLIP, no de MTEXT: fuera, anotado en su fila.
- **D5. `Mtext` en las cotas:** fuera; necesita texto de cota de varias líneas.

## 8. Pendiente de verificar al implementar

Las solicitudes literales (inglés y español, con las mayúsculas de las palabras clave), el prompt `MText:`
de `-MTEXT`, qué hace un clic sin arrastrar, si el marco incluye los descendentes, los pinzamientos
exactos y cómo reparte EXPLODE la alineación.
