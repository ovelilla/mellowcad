---
title: "Befehl DIFFERENZ (SUBTRACT) in AutoCAD"
description: "Wie DIFFERENZ (SUBTRACT, Alias DI) in AutoCAD funktioniert: die Volumenkörper oder Regionen, die bleiben, dann die abzuziehenden, mit Löchern und Flächen."
figure: "Ein Zylinder, mit DIFFERENZ aus einem Quader herausgenommen, ein Loch hindurch: erst der Quader gewählt, dann der Zylinder."
sourceHash: "416991f5f4d1"
---

DIFFERENZ (SUBTRACT) zieht 3D-Volumenkörper von anderen Volumenkörpern ab, oder Regionen von Regionen in derselben Ebene: Ein aus einem Quader herausgenommener Zylinder hinterlässt ein Loch hindurch, ein aus einem Quadrat herausgenommener Kreis ein Quadrat mit Loch. Der Befehl fragt zweimal. Zuerst meldet er <Message id="subtractFrom" /> und fragt bis zur Eingabetaste nach den Objekten, die bleiben; dann <Message id="subtractWhat" /> und fragt wieder bis zur Eingabetaste nach den Objekten, die abgezogen werden. Wie in AutoCAD 2027 wird eine vorher gewählte Menge verworfen und erneut abgefragt.

Die Volumenkörper der ersten Menge werden zu einem Volumenkörper, und jeder Volumenkörper der zweiten Menge wird davon abgezogen und gelöscht, ob er sich überschnitten hat oder nicht. Regionen werden Ebene für Ebene behandelt: Die Regionen der ersten Menge in einer Ebene werden vereinigt, die der zweiten Menge in dieser Ebene davon abgezogen und gelöscht, und eine Region in einer Ebene, in der die erste Menge keine hat, bleibt, wie sie war. Ein Volumenkörper als Ergebnis ist ein zusammengesetzter Volumenkörper, kein Quader oder Zylinder mehr, ohne Verlauf. Bleibt nichts übrig, meldet der Befehl <Message id="nullSolid" /> oder <Message id="nullRegion" /> und löscht sie. Der ganze Befehl ist ein Rückgängig-Schritt. Das 3D von MellowCAD ist noch unvollständig: Volumenkörper gibt es, Flächen und Netze nicht.

## Missing

Flächen, die es hier nicht gibt. Gekrümmte Flächen, die sich entlang einer Kurve treffen und für die MellowCAD noch keine exakte Form hat: Zylinder, Kegel, Kugeln oder Tori, deren Achsen weder zusammenfallen noch parallel verlaufen (zwei Zylinder dürfen sich auch kreuzen); ein Kegel mit etwas anderem als einer Ebene oder einem Volumenkörper auf seiner Achse; ein Torus oder ein Rotationskörper mit einer Ebene, die weder senkrecht zu seiner Achse steht noch durch sie geht, oder mit einem Volumenkörper abseits seiner Achse; ein extrudierter Volumenkörper mit etwas anderem als einer Ebene oder einer in seine Richtung extrudierten Fläche. Diese werden abgelehnt, und die Volumenkörper bleiben, wie sie waren; ebenso ein Schnitt, der eine Kante tangential trifft, Flächen, die fast, aber nicht ganz auf einer Fläche liegen, und ein sehr dünner Span zwischen einem Schnitt und einer Kante. Previous nach DIFFERENZ meldet, dass es keine vorherige Auswahlmenge gibt, wo AutoCAD keines der gelöschten Objekte findet. Es wird kein Volumenkörperverlauf geführt (SOLIDHIST, SHOWHISTORY).

## Questions

### Wie lautet das Kürzel für DIFFERENZ (SUBTRACT) in AutoCAD?

`DI`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_SUBTRACT` in jeder Sprache von AutoCAD.

### Wie ziehe ich einen Volumenkörper von einem anderen ab?

Zeichnen Sie den abzuziehenden Volumenkörper dort, wo er den anderen überschneidet: einen Zylinder durch einen Quader, für ein Loch. Starten Sie DIFFERENZ, wählen Sie den Quader und drücken Sie die Eingabetaste, wählen Sie dann den Zylinder und drücken Sie die Eingabetaste: Der Quader behält ein Loch, und der Zylinder ist weg. Die Reihenfolge ist wichtig, denn was Sie zuerst wählen, bleibt übrig.

### Warum funktioniert DIFFERENZ nicht?

Oft liegt es an der Reihenfolge: Was bleiben soll, gehört in die erste Menge, was abgezogen wird, in die zweite. Enthält die erste Menge keinen Volumenkörper und keine Region, oder die zweite keinen, der nicht schon in der ersten ist, meldet der Befehl <Message id="noSolidsOrRegionsSelected" /> und endet; kann nichts der zweiten Menge von der ersten abgezogen werden, etwa ein Volumenkörper von einer Region oder eine Region in einer anderen Ebene, meldet er <Message id="subtractNeedsTwo" /> und ändert nichts. Linien und Polylinien müssen zuerst zu Regionen gemacht werden. Meldet er, dass eine boolesche Operation fehlgeschlagen ist, treffen die Volumenkörper so aufeinander, dass MellowCAD es noch nicht berechnen kann, und bleiben, wie sie waren.

### Wie ziehe ich eine Fläche in AutoCAD ab?

Um eine 2D-Form aus einer anderen auszuschneiden, machen Sie beide mit <Command id="REGION" /> zu Regionen und ziehen Sie mit DIFFERENZ die innere von der äußeren ab: Ein Quadrat ohne Kreis wird zu einer Region mit Loch. Um eine Fläche zu messen, ohne die Zeichnung zu ändern, nimmt <Command id="AREA" /> mit <Keyword command="AREA" id="Subtract" /> Flächen aus seiner laufenden Summe heraus.

### Kann ich abziehen, ohne das Objekt zu löschen?

DIFFERENZ löscht, was es abzieht, wie das von AutoCAD. Um es zu behalten, kopieren Sie es zuerst an Ort und Stelle: <Command id="COPY" />, das Objekt und die Eingabetaste, ein Basispunkt von 0,0, dann wieder die Eingabetaste, um es um 0,0 zu kopieren, auf sich selbst. DIFFERENZ verbraucht dann eines der beiden.
