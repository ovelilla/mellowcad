---
title: "Befehl EIGÄNDR (CHPROP) in AutoCAD"
description: "Wie EIGÄNDR (CHPROP) in AutoCAD Eigenschaften in der Befehlszeile ändert: Farbe, Layer, Linientyp und sein Faktor, Linienstärke, Objekthöhe. Gratis testen."
figure: "EIGÄNDR an einer Linie quer über der Bohrung einer Platte: Farbe 1 und Linientyp CENTER, eine Achse, auf dem Layer, auf dem sie war."
sourceHash: "4ba30c3c6070"
---

EIGÄNDR (CHPROP) ändert die Eigenschaften der gewählten Objekte in der Befehlszeile: die Zeilen „Allgemein“ der Eigenschaftenpalette, als Eingabeaufforderungen abgefragt. Wählen Sie die Objekte, oder wählen Sie sie vor dem Befehl, dann wählen Sie eine Eigenschaft zum Ändern; er fragt nach jeder erneut nach einer, bis die Eingabetaste ihn beendet. Die Eingabeaufforderung jeder Eigenschaft bietet den Wert der Auswahl als Vorgabe an, <Message id="varies" /> wo die Objekte sich unterscheiden, und die Eingabetaste dort lässt jedem Objekt seinen eigenen. Was Sie einstellen, wird beim Beenden des Befehls angewendet, sodass Esc jedes Objekt lässt, wie es war. Objekte auf einem gesperrten Layer werden gezählt und ausgelassen, jedes mit der Meldung <Message id="objectOnLockedLayer" />. Der ganze Durchlauf ist ein Schritt, den <Command id="U" /> zurücknimmt.

## Options

### Color

Eine Farbnummer von 1 bis 255, ein Name wie `red`, `BYLAYER` oder <Keyword id="Truecolor" /> und sein `Red,Green,Blue`, wie <Command id="COLOR" /> sie annimmt; was COLOR ablehnt, wird auch hier abgelehnt und erneut abgefragt.

### LAyer

Der Name eines Layers, in beliebiger Schreibweise. Bei einem Namen, der kein Layername sein kann, meldet der Befehl <Message id="invalidLayerName" />, bei einem, der nicht in der Zeichnung ist, dass er nicht gefunden wurde; beide Male fragt er erneut. EIGÄNDR legt keine Layer an.

### LType

Der Name eines Linientyps, in beliebiger Schreibweise, oder `ByLayer`. Einer, den die Zeichnung nicht geladen hat, wird aus acad.lin geladen, AutoCADs Datei in Zoll, wie AutoCAD es auch in einer metrischen Zeichnung tut; bei einem Namen, den auch diese Datei nicht enthält, meldet der Befehl, er sei nicht gefunden worden, und kehrt zur Eingabeaufforderung der Eigenschaften zurück.

### ltScale

Der eigene Linientypfaktor der Objekte, mit dem der von <Command id="LTSCALE" /> nur für sie multipliziert wird: ein Abstand, eingegeben oder durch zwei Punkte gemessen; ein negativer wird als sein Betrag genommen, und bei 0 meldet der Befehl <Message id="valueMustBeNonzero" /> und fragt erneut.

### LWeight

Eine Linienstärke in Millimetern, auf die nächste Standardstärke gerundet, wie <Command id="LWEIGHT" /> sie rundet, oder `ByLayer`; `?` listet sie auf.

### Thickness

Ein Abstand, eingegeben oder durch zwei Punkte gemessen, auch negativ und null. Er wird an den Linien, Kreisen, Bögen und Polylinien der Auswahl gesetzt, entlang der eigenen Normalen jedes Objekts; bei jedem anderen Typ meldet er beim Beenden, dass dessen Objekthöhe nicht geändert werden kann.

## Missing

TRansparency, Material und Annotative, die Objekte hier nicht haben, sodass die Eingabeaufforderung sie nicht auflistet. VonBlock bei Color, LType und LWeight und Default bei LWeight. Eine True Color, die einer Indexfarbe entspricht, wird als Indexfarbe zurückgelesen: `255,0,0` wird als `1 (red)` angeboten. Farbbücher. Die Objekthöhe eines Textes und einer Attributdefinition, die so bleibt, wie sie ist. CHANGE, dessen Properties dieselbe Eingabeaufforderung mit Elev fragt.

## Questions

### Gibt es ein Alias für EIGÄNDR (CHPROP) in AutoCAD?

Er hat kein Alias: Geben Sie `EIGÄNDR` ein, oder `_CHPROP` in jeder Sprache von AutoCAD. Die Eingabetaste an der Eingabeaufforderung `Befehl:` wiederholt ihn.

### Was ist der Unterschied zwischen EIGÄNDR und EIGENSCHAFTEN?

Sie ändern dieselben Eigenschaften. <Command id="PROPERTIES" /> zeigt sie in einer Palette, auch mit der Geometrie jedes Objekts; EIGÄNDR fragt sie in der Befehlszeile ab, sodass Ihre Hände auf der Tastatur bleiben.

### Wie ändert man die Farbe von Objekten in der Befehlszeile?

Geben Sie `EIGÄNDR` ein, wählen Sie die Objekte, drücken Sie die Eingabetaste, wählen Sie <Keyword id="Color" /> und geben Sie die Farbe ein, etwa `1` für Rot. Drücken Sie die Eingabetaste erneut, um abzuschließen.

### Wie verschiebt man mehrere Objekte auf einen anderen Layer?

Starten Sie EIGÄNDR, wählen Sie sie, wählen Sie <Keyword id="LAyer" /> und geben Sie den Namen des Layers ein. Der Layer muss existieren: Legen Sie ihn zuerst in <Command id="LAYER" /> an.
