---
title: "Befehl REGION in AutoCAD"
description: "Wie REGION (Alias RIO) in AutoCAD geschlossene Formen in Regionen verwandelt, welche Konturen es findet, warum keine entsteht und wofür eine Region dient."
figure: "Vier Linien Ende an Ende geschlossen und ein Kreis darin: REGION mit einem Fenster um beide erzeugt zwei Regionen und löscht die Objekte."
sourceHash: "69a5423c3d5c"
---

REGION verwandelt geschlossene Formen in Regionen: ebene Flächen ohne Dicke, jede von ihren Konturen begrenzt. Wählen Sie die Objekte und drücken Sie die Eingabetaste; jede Kontur, die sie bilden, wird eine Region. Ein geschlossenes Objekt ist eine eigene Kontur: ein Kreis, eine Ellipse, eine geschlossene Polylinie oder ein Spline. Offene — Linien, Bögen, Ellipsenbögen, offene Polylinien und Splines — werden Ende an Ende verkettet, nie dort, wo sie sich kreuzen, und eine Kette, die sich nicht schließt, wird verworfen. Die Befehlszeile zählt dann die gefundenen Konturen, die abgelehnten samt Grund und die erzeugten Regionen; die Eingabetaste ohne Auswahl ergibt <Message id="regionNoneFound" />.

Die Objekte, die in eine Region eingegangen sind, werden gelöscht, die anderen bleiben, und die Regionen übernehmen den aktuellen Layer und die aktuellen Eigenschaften, nicht die der Objekte. Eine Kontur innerhalb einer anderen ergibt eine eigene Region, kein Loch darin: <Command id="SUBTRACT" /> zieht eine von der anderen ab. Eine Region wird als ihre Kanten gezeichnet und fängt an ihnen; die Palette Eigenschaften zeigt ihre Fläche und ihren Umfang, die auch <Command id="AREA" />, <Command id="LIST" /> und <Command id="MASSPROP" /> messen. <Command id="UNION" />, <Command id="SUBTRACT" /> und <Command id="INTERSECT" /> kombinieren Regionen in einer Ebene, <Command id="EXTRUDE" />, <Command id="REVOLVE" /> und <Command id="PRESSPULL" /> machen daraus 3D-Volumenkörper, und <Command id="EXPLODE" /> gibt ihre Linien, Bögen und Kreise zurück. Der ganze Befehl ist ein Rückgängig-Schritt.

## Missing

`DELOBJ` von AutoCAD: Die Objekte, die in eine Region eingegangen sind, werden hier immer gelöscht. BOUNDARY, das eine Region aus dem Bereich um einen Punkt erzeugen kann, und eine Region aus der Kontur einer Schraffur. Das Bearbeiten einer Region über ihre Griffe: Sie werden angezeigt, aber das Ziehen eines Griffs ändert nichts. Ihre Kanten als Schneid- oder Grenzkante für <Command id="TRIM" /> und <Command id="EXTEND" /> im Modus Schnell, und <Command id="HATCH" /> einer Region mit elliptischer oder Spline-Kante. Mit Flächen kombinierte Regionen, die MellowCAD nicht hat, und die Zeile Material in der Palette Eigenschaften.

## Questions

### Wie verwende ich den Befehl REGION in AutoCAD?

Starten Sie REGION (oder `RIO`), wählen Sie die geschlossenen Formen oder die Linien, die eine Ende an Ende schließen, und drücken Sie die Eingabetaste. Das Fenster der Sitzung um vier Linien und einen Kreis erzeugt zwei Regionen, und die Befehlszeile zählt zwei extrahierte Konturen und zwei erzeugte Regionen.

### Warum erzeugt REGION keine Region?

Die Form ist nicht Ende an Ende geschlossen. Linien, die sich kreuzen oder voreinander enden, schließen nichts: REGION verkettet offene Objekte nur über ihre Enden, und eine haarfeine Lücke genügt, um die Kette zu verwerfen. Eine Kontur, die sich selbst kreuzt, wie eine Schleife, wird abgelehnt und unter Selbstüberschneidungen gezählt. Verbinden Sie die Enden mit <Command id="FILLET" /> mit Radius 0, oder kürzen Sie mit <Command id="TRIM" />, was übersteht, und versuchen Sie es erneut.

### Wie erzeuge ich eine Region mit Loch?

Machen Sie eine Region aus dem Umriss und eine aus dem Loch, starten Sie dann <Command id="SUBTRACT" />: den Umriss wählen, die Eingabetaste, das Loch, die Eingabetaste. Das Ergebnis ist eine Region, und <Command id="EXTRUDE" /> macht daraus einen Volumenkörper mit dem Loch hindurch.

### Wie ermittle ich die Fläche einer Region?

Wählen Sie sie und lesen Sie Fläche in der Palette Eigenschaften ab, oder starten Sie <Command id="AREA" />, wählen Sie <Keyword command="AREA" id="Object" /> und wählen Sie sie. <Command id="MASSPROP" /> ergänzt den Umfang, den Schwerpunkt und die Trägheitsmomente.
