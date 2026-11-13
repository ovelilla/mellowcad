---
title: "Befehl SCHNITTMENGE (INTERSECT) in AutoCAD"
description: "Wie SCHNITTMENGE (INTERSECT, Alias SM) in AutoCAD funktioniert: nur das behalten, was 3D-Volumenkörper oder Regionen gemeinsam haben. Zum Testen im Browser."
figure: "Ein Quader und eine Kugel, die ihn überlappt, mit SCHNITTMENGE verschnitten: Was sie gemeinsam haben, ist eine Kugel mit sechs ebenen Flächen, von Südosten gesehen."
sourceHash: "c8ea61c0525d"
---

SCHNITTMENGE (INTERSECT) behält nur das, was zwei oder mehr 3D-Volumenkörper oder zwei oder mehr Regionen in einer Ebene gemeinsam haben, und löscht den Rest: Ein Quader und eine Kugel, die ihn überlappt, hinterlassen eine Kugel mit ebenen Flächen. Er fragt nach Objekten bis zur Eingabetaste, wie es <Command id="UNION" /> tut, und übergeht, was weder Volumenkörper noch Region ist. Wie in AutoCAD 2027 wird eine vorher gewählte Auswahl verworfen und erneut abgefragt. Volumenkörper und Regionen werden getrennt berechnet, die Regionen Ebene für Ebene.

Das zuerst gewählte Objekt wird zum Ergebnis, mit seinem Layer und seiner Farbe, und die anderen werden gelöscht; bei einem Fenster, Kreuzen oder ALL ist es das neueste davon. Das Ergebnis ist ein zusammengesetzter Volumenkörper, weder Quader noch Kugel mehr, ohne Verlauf. Haben die Objekte nichts gemeinsam, meldet er <Message id="nullSolid" /> oder <Message id="nullRegion" /> und löscht sie alle, wie es AutoCAD tut. Der ganze Befehl ist ein Rückgängig-Schritt. Das 3D von MellowCAD ist noch unvollständig: Volumenkörper gibt es, Flächen und Netze nicht.

## Missing

Flächen, die es hier nicht gibt. Gekrümmte Flächen, die sich entlang einer Kurve treffen, für die MellowCAD noch keine exakte Form hat: Zylinder, Kegel, Kugeln oder Tori, deren Achsen weder zusammenfallen noch parallel verlaufen (zwei Zylinder dürfen sich auch kreuzen); ein Kegel mit etwas anderem als einer Ebene oder einem Volumenkörper auf seiner Achse; ein Torus oder ein Rotationskörper mit einer Ebene, die weder senkrecht zu seiner Achse steht noch durch sie geht, oder mit einem Volumenkörper abseits seiner Achse; ein Extrusionskörper mit etwas anderem als einer Ebene oder einer in seiner Richtung extrudierten Fläche. Diese werden mit einer Meldung abgelehnt, dass eine boolesche Operation fehlgeschlagen ist, und die Volumenkörper bleiben, wie sie waren; ebenso ein Schnitt, der eine Kante tangential trifft, Flächen, die fast, aber nicht ganz auf einer Oberfläche liegen, und ein sehr dünner Span zwischen einem Schnitt und einer Kante. Ein Zylinder entlang der Fläche eines Quaders vereinigt sich zum richtigen Volumen, aber mit einer Kante und einer Fläche weniger als bei AutoCAD. Ein Verlauf der Volumenkörper wird nicht geführt (SOLIDHIST, SHOWHISTORY), und welches Objekt ein Zaun oder Vorher behält, ist ungeprüft.

## Questions

### Wie lautet das Alias von SCHNITTMENGE (INTERSECT) in AutoCAD?

`SM`, dann die Eingabetaste oder die Leertaste. `IN` des englischen AutoCAD gibt es in der deutschen Version nicht. Der volle Name funktioniert ebenfalls, und `_INTERSECT` in jeder Sprache von AutoCAD.

### Was ist der Unterschied zwischen VEREINIG, DIFFERENZ und SCHNITTMENGE?

Alle drei machen aus 3D-Volumenkörpern oder Regionen in einer Ebene ein Objekt. <Command id="UNION" /> behält alles, was irgendeines davon bedeckt, <Command id="SUBTRACT" /> behält die erste Menge abzüglich der zweiten, und SCHNITTMENGE behält nur das, was alle gemeinsam haben. Jeder ist ein Rückgängig-Schritt, und jeder löscht die Objekte, die er aufgebraucht hat.

### Wie bildet man den Schnitt von Linien in AutoCAD?

Nicht mit SCHNITTMENGE, der mit Volumenkörpern und Regionen arbeitet und Linien übergeht. Um zu finden, wo sich zwei Linien kreuzen, fangen Sie mit dem Objektfang Schnittpunkt darauf; damit sie sich treffen, verwenden Sie <Command id="FILLET" /> mit dem Radius 0, <Command id="TRIM" /> oder <Command id="EXTEND" />.

### Warum löscht SCHNITTMENGE meine Objekte?

Weil sie nichts gemeinsam haben: Ohne gemeinsamen Teil meldet er <Message id="nullSolid" />, bei Regionen <Message id="nullRegion" />, und löscht sie, wie es AutoCAD tut. <Command id="U" /> bringt sie zurück. Ein Volumenkörper und eine Region oder zwei Regionen in verschiedenen Ebenen werden gar nicht verschnitten: Er meldet <Message id="booleanNeedsTwo" /> und ändert nichts.
