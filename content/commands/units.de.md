---
title: "Befehl EINHEIT (UNITS) in AutoCAD"
description: "Wie EINHEIT (UNITS, Alias ET) in AutoCAD funktioniert: das Dialogfeld Zeichnungseinheiten, Genauigkeit von 0 bis 8 Stellen, der Einfügemaßstab in mm, cm oder m."
figure: "EINHEIT über einer Platte von 100 mal 60 geöffnet, dann ID an ihrer fernen Ecke: die Koordinaten mit der Genauigkeit der Zeichnung, zwei Stellen."
sourceHash: "1fd1973c3ebf"
---

EINHEIT (UNITS) öffnet das Dialogfeld Zeichnungseinheiten, das festlegt, wie die Zeichnung Längen schreibt und wofür eine Zeichnungseinheit steht. Wie in AutoCAD ist das Dialogfeld modal: Der Befehl dauert, bis OK oder Abbrechen es schließt, die Änderung von OK ist ein Schritt, den <Command id="U" /> zurücknimmt, und Abbrechen oder Esc ändert nichts. Mit Apostroph eingegeben, `'UNITS`, öffnet er sich innerhalb eines laufenden Befehls, der nach dem Schließen des Dialogfelds weitermacht. Auch die Einheiten der Statusleiste und die Zeichnungseinheiten des Anwendungsmenüs öffnen es.

Der Typ der Länge ist Dezimal, und seine Genauigkeit, von 0 bis 8 Dezimalstellen, bestimmt, womit jede Länge geschrieben wird: Koordinaten, Abstände, Flächen, die in den Eingabeaufforderungen angebotenen Vorgaben. Eine neue Zeichnung beginnt hier mit zwei Stellen, wo die metrische Vorlage von AutoCAD mit vier beginnt. Der Einfügemaßstab legt fest, was eine Zeichnungseinheit ist, Millimeter, Zentimeter oder Meter; die Statusleiste und die dynamische Eingabe zeigen es. Die Beispielausgabe zeigt einen Punkt mit der gewählten Genauigkeit.

## Missing

Die anderen Längentypen, Architektur, Technisch, Brüche und Wissenschaftlich, und die wissenschaftliche Schreibweise für eine riesige Länge. Die Gruppe Winkel: Winkel sind Dezimalgrad, gegen den Uhrzeigersinn von Osten, mit der Genauigkeit, die AUPREC festlegt, eingegeben. Die anderen Einfügeeinheiten, darunter Zoll und Fuß; Beleuchtung; Richtung; und -UNITS, die Form für die Befehlszeile.

## Questions

### Wie lautet das Kürzel für EINHEIT (UNITS) in AutoCAD?

`ET`, dann die Eingabetaste oder die Leertaste; ebenso `DDUNITS`. Der vollständige Name funktioniert ebenfalls, ebenso `_UNITS` in jeder Sprache von AutoCAD.

### Wie stelle ich die Zeichnungseinheiten auf Millimeter oder Meter?

Öffnen Sie EINHEIT und wählen Sie unter Einfügemaßstab Millimeter, Zentimeter oder Meter. Eine Zeichnungseinheit bleibt eine Einheit: Zeichnen Sie eine 5 m lange Wand als 5 in Metern oder 5000 in Millimetern. Die Wahl legt fest, welches, und die Statusleiste und die dynamische Eingabe zeigen es.

### Wie ändere ich die Anzahl der Dezimalstellen?

Wählen Sie in EINHEIT die Genauigkeit, von `0` bis `0.00000000`. Das ändert, wie Längen geschrieben werden, nie die Geometrie: Eine Linie, die 10,125 lang gezeichnet wurde, bleibt bei jeder Genauigkeit 10,125 lang.

### Warum folgen meine Bemaßungen nicht der in EINHEIT eingestellten Genauigkeit?

Eine Bemaßung schreibt ihren Wert mit der Genauigkeit ihres eigenen Bemaßungsstils, nicht der der Zeichnung. Ändern Sie sie in <Command id="DIMSTYLE" /> unter Primäreinheiten.

### Kann ich in Fuß und Zoll zeichnen?

Noch nicht: Längen sind dezimal, und der Einfügemaßstab bietet Millimeter, Zentimeter und Meter. Architektur- und technische Einheiten fehlen.
