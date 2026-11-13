---
title: "Befehl 3DPOLY in AutoCAD"
description: "So arbeitet AutoCADs 3DPOLY (3DP): 3D-Polylinie aus geraden Segmenten, jeder Punkt mit eigener Z-Höhe, Schließen, Zurück, und der Unterschied zu PLINIE."
figure: "Eine 3D-Polylinie, die an jeder Ecke eines Rechtecks 60 mal 40 am Boden um 15 steigt, von Südosten gesehen."
sourceHash: "b74d0c411c73"
---

3DPOLY zeichnet eine 3D-Polylinie: gerade Segmente durch Punkte, die jeweils eine eigene Z-Höhe haben, als ein Objekt. Geben Sie den Startpunkt an, dann für jedes Segment einen Endpunkt, bis die Eingabetaste endet; auch ein Startpunkt allein bleibt erhalten, als Polylinie aus einem Scheitelpunkt. Die Eingabetaste beim Startpunkt wird mit <Message id="invalidPoint" /> abgewiesen: Es gibt keine Option Fortsetzen, die LINIE hat. Ein mit Z getippter Punkt behält es, `30,0,15`; ein ohne Z getippter oder geklickter liegt auf der Höhe der Arbeitsebene, und ein auf ein Objekt gefangener Punkt übernimmt dort das Z des Objekts. Punkte werden im aktuellen BKS gelesen.

Anders als eine <Command id="PLINE" /> hat sie keine Ebene, keine Bögen, keine Breiten und keine Objekthöhe, und sie wird unabhängig von ihrem Linientyp, den sie behält, durchgehend gezeichnet. Die ganze Polylinie ist ein Schritt, den <Command id="U" /> zurücknimmt; Esc behält, was gezeichnet wurde. PEDIT bearbeitet sie mit einer kürzeren Liste von Optionen, und seine Spline-Kurve passt ihr eine glatte Kurve an.

## Options

### Close

Ab dem zweiten Segment: zeichnet ein Segment zurück zum Startpunkt und endet.

### Undo

Nimmt den letzten Scheitelpunkt zurück und macht vom vorigen aus weiter. Ist kein Segment mehr da: <Message id="all3dSegmentsUndone" />.

## Missing

Eine kurvenangepasste 3D-Polylinie zeigt in der Zeile Angleichen/Glätten der Eigenschaften-Palette Keine, was AutoCAD Quadratisch oder Kubisch nennt, und lässt sich dort nicht ändern. Sie kann keine Schraffurbegrenzung und kein Pfad von ARRAYPATH sein, und die Palette hat keine Zeile Material. Die dynamische Eingabe fragt den Startpunkt in einem Feld ab, sein Z nach einem zweiten Komma getippt, wo AutoCAD Felder für X, Y und Z zeigt. Die Hover-Menüs der Griffe, Strecken, Scheitelpunkt hinzufügen, Scheitelpunkt entfernen und der Rest.

## Questions

### Wie lautet das Kürzel für 3DPOLY in AutoCAD?

`3DP`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_3DPOLY` in jeder Sprache von AutoCAD.

### Was ist der Unterschied zwischen PLINIE und 3DPOLY?

Eine <Command id="PLINE" /> liegt in einer Ebene und kann Bögen und Breiten haben. Eine 3D-Polylinie hat nur gerade Segmente, aber jeder Scheitelpunkt kann auf einer anderen Höhe liegen: ein Rohrverlauf, die Mittellinie einer Straße, ein Kabel.

### Wie zeichne ich eine 3D-Polylinie auf unterschiedlichen Höhen?

Tippen Sie jeden Punkt mit seinem Z, `x,y,z`, oder fangen Sie auf Objekte in den gewünschten Höhen. Bei dynamischer Eingabe ist ein Punkt nach dem ersten relativ: `60,0,15` geht 60 entlang X und 15 nach oben vom letzten aus.

### Wie mache ich eine 3D-Polylinie glatt?

Bearbeiten Sie sie mit <Command id="PEDIT" /> und wählen Sie ihre Spline-Kurve: eine glatte Kurve, von den Scheitelpunkten umrahmt. Decurve macht sie wieder gerade.
