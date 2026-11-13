---
title: "Befehl FARBE (COLOR) in AutoCAD"
description: "So legt AutoCADs FARBE (COLOR, Alias FAR) die Farbe neuer Objekte fest: VonLayer, eine Indexfarbe nach Name oder Nummer, oder eine True Color in RGB. Testen."
figure: "Eine Platte VonLayer gezeichnet, ihr Loch in Rot, ihre Bohrung in der True Color 0,128,255, dann FARBE zurück auf VonLayer gesetzt."
sourceHash: "93793c2915da"
---

FARBE (COLOR) legt die Farbe fest, mit der neue Objekte gezeichnet werden. AutoCAD öffnet das Dialogfeld Farbe wählen; MellowCAD hat noch keines, sodass FARBE die Befehlszeilenform ausführt, die AutoCAD auch hat, <Command id="-COLOR" />. Er fragt nach der Standardfarbe für Objekte und bietet die aktuelle an, `VONLAYER` in einer neuen Zeichnung: VonLayer bedeutet, dass jedes Objekt die Farbe seines Layers annimmt, und eine stattdessen gewählte Farbe ist die eigene des Objekts. Geben Sie die Nummer oder den Namen einer Indexfarbe ein, oder wählen Sie <Keyword id="Truecolor" />. Die Eingabetaste behält die aktuelle Farbe, und die Änderung ist ein Schritt, den <Command id="U" /> zurücknimmt.

Ein Wort, das er nicht versteht, ergibt <Message id="colorRequired" />, und 0, eine negative Zahl oder eine über 255 <Message id="invalidColorNumber" />; er fragt erneut. Mit Apostroph innerhalb eines Befehls getippt, `'FARBE`, übernimmt jedes danach gezeichnete Objekt die neue Farbe: Jedes Segment eines <Command id="LINE" /> übernimmt die Farbe, die gilt, wenn es beginnt. FARBE legt nur fest, was als Nächstes kommt; die Eigenschaften-Palette oder die Farbliste der oberen Leiste ändert bereits gezeichnete Objekte.

## Options

### Truecolor

Fragt nach einer Farbe als drei Werten von 0 bis 255, Rot, Grün und Blau, durch Kommas ohne Leerzeichen getrennt: `0,128,255` ist ein mittleres Blau. Eine Farbe, die auch eine Indexfarbe ist, `255,0,0`, wird als diese Indexfarbe gespeichert.

### BYLAYER

Neue Objekte übernehmen die Farbe ihres Layers, wie zu Beginn.

### RED

Indexfarbe 1, auch als `1` getippt.

### YELLOW

Indexfarbe 2, auch als `2` getippt.

### GREEN

Indexfarbe 3, auch als `3` getippt.

### CYAN

Indexfarbe 4, auch als `4` getippt.

### BLUE

Indexfarbe 5, auch als `5` getippt.

### MAGENTA

Indexfarbe 6, auch als `6` getippt.

### WHITE

Indexfarbe 7, auch als `7` getippt: Weiß auf dunklem Hintergrund und Schwarz auf hellem.

## Missing

Das Dialogfeld Farbe wählen, Farbbücher und die HSL-Form. Die Indexfarben 8 bis 255: Nur 1 bis 7 werden genommen. VonBlock. Eine True Color, die einer Indexfarbe entspricht, wird als diese Indexfarbe gespeichert, wo AutoCAD das RGB behält. Transparenz (CETRANSPARENCY) und die typbezogenen Vorgaben HPCOLOR, HPLAYER, DIMLAYER und TEXTLAYER.

## Questions

### Wie lautet das Kürzel für FARBE (COLOR) in AutoCAD?

`FAR` oder `FE`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_COLOR` in jeder Sprache von AutoCAD.

### Wie ändere ich die Farbe eines Objekts in AutoCAD?

Wählen Sie es aus und wählen Sie die Farbe in der Farbliste der oberen Leiste oder in der Zeile Farbe der Eigenschaften-Palette: Sie ändert sich in einem Schritt. Oder kopieren Sie die Farbe eines anderen Objekts mit <Command id="MATCHPROP" />. FARBE legt nur die Farbe der danach gezeichneten Objekte fest.

### Was bedeutet VonLayer in AutoCAD?

Dass das Objekt die Farbe seines Layers annimmt, sodass eine Änderung der Layerfarbe im Layer-Eigenschaften-Manager jedes Objekt VonLayer darauf ändert. Es ist die Vorgabe und hält die Farben einer Zeichnung nach Layern geordnet: <Command id="LAYER" />.

### Wie verwende ich RGB-Farben in AutoCAD?

Wählen Sie <Keyword id="Truecolor" /> und geben Sie die drei Werte durch Kommas getrennt ein, etwa `0,128,255`.
