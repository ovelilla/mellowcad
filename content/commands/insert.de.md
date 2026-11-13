---
title: "Befehl EINFÜGE (INSERT): Block einfügen in AutoCAD"
metaTitle: "Befehl EINFÜGE (INSERT) in AutoCAD"
description: "So fügt AutoCADs EINFÜGE (INSERT, Alias EIN) einen Block ein: die Palette Blöcke oder -EINFÜGE in der Befehlszeile mit Maßstab, Drehung, Attributen."
figure: "Ein Stuhl, zum Block gemacht und dann zweimal an einem Tisch eingefügt: einmal nach seinem Punkt um 180 gedreht, einmal vor ihm mit Drehen um 90."
sourceHash: "e9859c7871f3"
---

EINFÜGE (INSERT) setzt einen in der Zeichnung definierten Block als Blockreferenz ein: eine weitere Kopie von ihm, mit eigenem Punkt, Maßstab und eigener Drehung, gezeichnet aus der einen Definition, die <Command id="BLOCK" /> erstellt hat. Wie das EINFÜGE von AutoCAD 2027 öffnet er die Palette Blöcke, die die Blöcke der Zeichnung zeigt; klicken Sie einen an, und die Befehlszeile fragt nach seinem Einfügepunkt, der Block hängt dabei am Cursor, dann nach Maßstab und Drehung. Die Palette bleibt offen, sodass jeder weitere Block nur ein Klick ist.

<Command id="-INSERT" /> fragt alles in der Befehlszeile ab: den Namen des Blocks (die Eingabetaste übernimmt den angebotenen: den zuletzt eingefügten Block, sonst den zuletzt definierten), den Einfügepunkt, dann den Maßstabsfaktor X, den Maßstabsfaktor Y (die Eingabetaste übernimmt den von X) und den Drehwinkel. Ein negativer Faktor spiegelt den Block, und ungleiche strecken ihn: Ein Kreis darin wird als Ellipse gezeichnet. Ein Block mit Attributen fragt dann jeden Wert mit seiner Eingabeaufforderung ab und bietet seine Vorgabe an. Die Objekte des Blocks auf Layer 0 übernehmen den Layer der Blockreferenz, die anderen behalten ihren. Jedes Einfügen ist ein Rückgängig-Schritt.

## Options

### ?

Beim Namen des Blocks: listet die Blöcke der Zeichnung auf, wie <Command id="BLOCK" /> es tut, und endet.

### Scale

Beim Einfügepunkt: fragt einen Faktor für beide Achsen ab, dann erneut nach dem Punkt, der Block in dieser Größe am Cursor. Nach dem Punkt werden die Faktoren X und Y nicht mehr gefragt.

### Rotate

Beim Einfügepunkt: fragt den Winkel ab, eingegeben oder zwischen zwei Punkten, dann erneut nach dem Punkt, der Block gedreht am Cursor. Nach dem Punkt wird die Drehung nicht mehr gefragt.

## Missing

Eine andere Zeichnungsdatei einfügen: Es lassen sich nur in der Zeichnung definierte Blöcke einfügen, und ein Name, den sie nicht enthält, wird abgelehnt. Beim Einfügepunkt Basispunkt, X, Y, Z, Zerlegen und Wiederholen; beim Maßstab X Ecke und XYZ sowie ein für die gegenüberliegende Ecke gewählter Punkt. Bei ungleichen Faktoren X und Y wird ein Text oder ein Attribut in der Größe von X gezeichnet statt gestreckt, und der Bogen einer Polylinie bleibt ein Bogen; ein negatives X schreibt keinen Text rückwärts. ATTDIA 1, das Dialogfeld Attribute bearbeiten beim Einfügen, und ATTREQ 0. Die Einträge Annotativ, Blockeinheit und Einheitenfaktor der Eigenschaften-Palette. VonBlock: Ein Objekt in einem Block kann nicht die Farbe, den Linientyp oder die Linienstärke der Blockreferenz annehmen, wie es ein mit VonBlock gezeichnetes in AutoCAD tut.

## Questions

### Wie lautet das Kürzel für EINFÜGE (INSERT) in AutoCAD?

`EIN`, danach Eingabetaste oder Leertaste: Er öffnet die Palette Blöcke, wie das von AutoCAD 2027. `-EIN` ist <Command id="-INSERT" />, das in der Befehlszeile fragt. `_INSERT` funktioniert in jeder Sprache von AutoCAD.

### Wie füge ich einen Block über die Befehlszeile ein?

Geben Sie `-EIN` und den Namen des Blocks ein, wählen Sie dann den Einfügepunkt und beantworten Sie Maßstab und Drehung, wobei die Eingabetaste jeweils die Vorgabe behält. <Keyword id="?" /> beim Namen listet die vorhandenen Blöcke auf.

### Wie füge ich einen Block in einem anderen Maßstab ein?

Geben Sie den Maßstabsfaktor X nach dem Einfügepunkt ein und drücken Sie bei Faktor Y die Eingabetaste, damit beide gleich bleiben; oder wählen Sie <Keyword id="Scale" /> vor dem Punkt und geben Sie einen Faktor für beide ein. Ein negativer Faktor spiegelt den Block.

### Wie füge ich einen Block aus einer anderen Zeichnung ein?

Nicht aus ihrer Datei: EINFÜGE setzt nur in der Zeichnung definierte Blöcke ein. Kopieren Sie stattdessen eine Blockreferenz von ihm (Strg+C), öffnen Sie die Zeichnung, in die er soll, und fügen Sie ihn ein (Strg+V): Sein Block kommt mit, es sei denn, diese Zeichnung hat bereits einen Block dieses Namens, dessen Definition behalten wird.
