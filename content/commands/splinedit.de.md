---
title: "Befehl SPLINEEDIT (SPLINEDIT) in AutoCAD"
description: "Wie SPLINEEDIT (SPLINEDIT, Alias SIE) in AutoCAD funktioniert: Schließen, Verbinden, Fit-Daten, Scheitelpunkt, in Polylinie umwandeln, Umkehren."
figure: "Ein Spline durch fünf Fit-Punkte, mit SPLINEEDIT geschlossen: eine glatte Schleife durch alle."
sourceHash: "bedcaab2fac3"
---

SPLINEEDIT (SPLINEDIT) bearbeitet einen Spline. Wählen Sie bei `Select spline:` einen aus oder wählen Sie ihn vor dem Befehl aus; ein Doppelklick auf einen Spline startet SPLINEEDIT ebenfalls darauf. Alles andere ergibt <Message id="objectNotSpline" /> und es wird erneut gefragt; eine mit der Option Spline von PEDIT angepasste Polylinie wird ohne Meldung in einen Spline derselben Kurve umgewandelt. Danach fragt der Befehl immer wieder nach einer Option, jede sofort angewendet, bis <Keyword id="eXit" /> oder die Eingabetaste. Der Spline zeigt die Griffe seiner Fit-Punkte, beim Bearbeiten seiner Scheitelpunkte seine Kontrollscheitelpunkte und sein Netz. Die ganze Bearbeitung ist ein Schritt, den <Command id="U" /> zurücknimmt. Das eingegebene `'ZOOM` funktioniert bei jeder seiner Eingabeaufforderungen.

## Options

### Close

Schließt den Spline glatt: ein Fit-Spline durch seine Fit-Punkte, ein CV-Spline über seinen Scheitelpunkten. Bei einem geschlossenen Spline lautet die Option <Keyword id="Open" />, und Join wird nicht angeboten.

### Join

Verbindet offene Kurven, die an seinen Enden zusammentreffen, nach den JOIN-Regeln für einen Spline, und meldet, wie viele es verbunden hat.

### Fit data

Bearbeitet die Punkte, durch die der Spline verläuft. Ein CV-Spline, der keine hat, erhält zunächst Fit-Punkte auf seiner Kurve. Seine Optionen: <Keyword id="Add" /> wählt einen Fit-Punkt und fügt danach neue hinzu, immer wieder (am ersten Punkt eines offenen Splines <Keyword id="After" /> oder <Keyword id="Before" />); <Keyword id="Delete" /> entfernt Fit-Punkte, bis auf zwei, bei einem geschlossenen Spline drei (<Message id="cannotDeleteBeyond" />); <Keyword id="Move" /> geht die Fit-Punkte mit <Keyword id="Next" /> und <Keyword id="Previous" /> durch, oder mit <Keyword id="Select point" />, und verschiebt den aktuellen an den Punkt, den Sie angeben; <Keyword id="Purge" /> verwirft die Fit-Daten und lässt einen CV-Spline zurück; <Keyword id="Tangents" /> legt die Start- und Endrichtung fest oder <Keyword id="System default" />; <Keyword id="Close" /> und <Keyword id="eXit" /> wie bei der ersten Eingabeaufforderung. Eine Auswahl, die kein Fit-Punkt ist, ergibt <Message id="notAFitPoint" />.

### Edit vertex

Bearbeitet die Kontrollscheitelpunkte; ein Fit-Spline verliert bei der ersten Änderung seine Fit-Daten. <Keyword id="Add" /> setzt einen Scheitelpunkt an dem Punkt, den Sie auf dem Spline wählen; <Keyword id="Delete" /> entfernt einen, bis auf zwei, bei einem geschlossenen Spline drei; <Keyword id="Elevate order" /> erhöht die Ordnung, bis zu 26, nie nach unten; <Keyword id="Move" /> verschiebt Scheitelpunkte, schrittweise wie Move bei Fit data; <Keyword id="Weight" /> legt das Gewicht eines Scheitelpunkts fest, nach <Message id="splineMadeRational" />, sodass die Kurve näher an ihn herangezogen oder weiter von ihm weggedrückt wird. Eine Auswahl, die kein Scheitelpunkt ist, ergibt <Message id="notAControlVertex" />.

### convert to Polyline

Fragt eine Genauigkeit von 0 bis 99, standardmäßig 10, und ersetzt den Spline durch eine Polylinie aus geraden Segmenten, je mehr, desto höher die Genauigkeit; eine 3D-Polylinie, wo der Spline nicht eben liegt, parallel zur XY-Ebene. Das beendet den Befehl. Die Genauigkeit bleibt für die Sitzung erhalten, und auch die Umwandlung von PEDIT verwendet sie.

### Reverse

Kehrt den Spline um, sein erster Punkt wird der letzte: <Message id="splineReversed" />.

### Undo

Nimmt die letzte Option zurück, ein ganzes Fit data oder Edit vertex auf einmal. Ist keine mehr übrig: <Message id="commandCompletelyUndone" />.

### eXit

Beendet den Befehl, wie die Eingabetaste.

## Missing

Kink, das eine scharfe Ecke an einem Fit-Punkt oder Scheitelpunkt setzt; toLerance, das den Spline innerhalb einer Toleranz neu anpasst; Tangents eines geschlossenen Splines. convert to Polyline erzeugt bei einem Fit-Spline weit mehr Scheitelpunkte als AutoCAD, nie Bögen, und ersetzt den Spline immer. Group bei `Select spline:`. Das `+`, das AutoCAD beim Durchgehen der Punkte auf den aktuellen Punkt zeichnet.

## Questions

### Wie lautet das Kürzel für SPLINEEDIT in AutoCAD?

`SIE`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_SPLINEDIT` in jeder Sprache von AutoCAD. Ein Doppelklick auf einen Spline startet den Befehl auch.

### Wie wandle ich einen Spline in eine Polylinie um?

Starten Sie SPLINEEDIT, wählen Sie den Spline und wählen Sie <Keyword id="convert to Polyline" />; eine Genauigkeit von 10 ergibt eine glatte Polylinie. Auch <Command id="PEDIT" /> auf einem Spline bietet die Umwandlung an.

### Wie füge ich Punkte eines Splines hinzu oder verschiebe sie?

Wählen Sie <Keyword id="Fit data" />, um an den Punkten zu arbeiten, durch die er verläuft, dann <Keyword id="Add" /> oder <Keyword id="Move" />. Wählen Sie <Keyword id="Edit vertex" />, um an den Kontrollscheitelpunkten zu arbeiten, die ihn umrahmen.

### Wie schließe ich einen Spline?

Wählen Sie <Keyword id="Close" />: Er schließt sich glatt, ohne Ecke an der Stelle, an der er sich selbst trifft. <Keyword id="Open" /> öffnet ihn wieder.

### Wie verbinde ich zwei Splines?

Wählen Sie <Keyword id="Join" /> und wählen Sie den Spline, dessen Ende auf dieses trifft, oder verwenden Sie <Command id="JOIN" />.
