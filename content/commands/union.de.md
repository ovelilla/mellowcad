---
title: "Befehl VEREINIG (UNION) in AutoCAD"
description: "So arbeitet AutoCADs VEREINIG (UNION, Alias VEE): 3D-Volumenkörper oder Regionen in einer Ebene vereinen, was er übergeht, warum er zwei braucht."
figure: "Zwei Quader, die sich überlappen, mit VEREINIG zu einem Volumenkörper vereint: von Südosten gesehen, verdeckte Kanten entfernt."
sourceHash: "be43813a7dee"
---

VEREINIG (UNION) vereint zwei oder mehr 3D-Volumenkörper zu einem Volumenkörper, oder zwei oder mehr Regionen, die in einer Ebene liegen, zu einer Region: Wo sie sich überlappen, zählt es einmal, und die Kanten im Inneren verschwinden. Er fragt nach Objekten, so vielen, wie Sie wollen, und die Eingabetaste vereint sie. Wie in AutoCAD 2027 wird eine vorher gewählte Auswahl verworfen und neu abgefragt, und alles, was weder ein Volumenkörper noch eine Region ist, wird übergangen. Volumenkörper und Regionen werden getrennt vereint: alle Volumenkörper zu einem, die Regionen Ebene für Ebene.

Das zuerst gewählte Objekt wird zum Ergebnis, mit seinem Layer und seiner Farbe, und die anderen werden gelöscht; bei einem Fenster, einer Kreuzenden Auswahl oder ALL ist es das neueste von ihnen. Das Ergebnis ist ein zusammengesetzter Volumenkörper: kein Quader oder Zylinder mehr, ohne Historie (<Command id="LIST" /> zeigt History = None), und gewählt zeigt er einen Griff, der ihn als Ganzes verschiebt. Volumenkörper, die sich nicht berühren, werden zu einem Objekt aus zwei Teilen. Der ganze Befehl ist ein Schritt für Rückgängig. MellowCADs 3D ist noch unvollständig: Volumenkörper gibt es, Flächen und Netze nicht.

## Missing

Flächen, die es hier nicht gibt. Gekrümmte Flächen, die sich entlang einer Kurve treffen, für die MellowCAD noch keine exakte Form hat: Zylinder, Kegel, Kugeln oder Tori, deren Achsen weder zusammenfallen noch parallel verlaufen (zwei Zylinder dürfen sich auch kreuzen); ein Kegel mit etwas anderem als einer Ebene oder einem Volumenkörper auf seiner Achse; ein Torus oder ein Rotationskörper mit einer Ebene, die weder senkrecht zu seiner Achse noch durch sie verläuft, oder mit einem Volumenkörper außerhalb seiner Achse; ein extrudierter Volumenkörper mit etwas anderem als einer Ebene oder einer in seiner Richtung extrudierten Fläche. Diese werden abgelehnt, und die Volumenkörper bleiben, wie sie waren; ebenso ein Schnitt, der eine Kante tangential trifft, Flächen, die fast, aber nicht genau auf einer Fläche liegen, und ein sehr dünner Splitter zwischen einem Schnitt und einer Kante. Ein Zylinder, der entlang der Fläche eines Quaders liegt, wird zum richtigen Volumen vereint, aber mit einer Kante und einer Fläche weniger als bei AutoCAD. Es wird keine Volumenkörper-Historie geführt (SOLIDHIST, SHOWHISTORY).

## Questions

### Wie lautet das Kürzel für VEREINIG (UNION) in AutoCAD?

`VEE`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_UNION` in jeder Sprache von AutoCAD.

### Warum funktioniert VEREINIG nicht?

Er braucht zwei Volumenkörper oder zwei Regionen in derselben Ebene: Bei weniger meldet er <Message id="booleanNeedsTwo" /> und ändert nichts. Linien, Bögen und Polylinien sind keine Regionen, auch nicht geschlossen: Machen Sie sie zuerst mit <Command id="REGION" /> zu Regionen. Vor VEREINIG gewählte Objekte werden verworfen, wie in AutoCAD 2027: Wählen Sie sie bei seiner Eingabeaufforderung. Meldet er, dass eine boolesche Operation fehlgeschlagen ist, treffen sich die Volumenkörper auf eine Weise, die MellowCAD noch nicht berechnen kann, und bleiben, wie sie waren.

### Wie mache ich eine Vereinigung rückgängig?

<Command id="U" /> oder Strg+Z, direkt danach: Der ganze Befehl geht in einem Schritt zurück, die Objekte so, wie sie waren. Später gibt es nichts mehr zu trennen, da der vereinte Volumenkörper seine Teile nicht aufzeichnet. Die entgegengesetzte Operation ist <Command id="SUBTRACT" />, das Volumenkörper wegnimmt, statt sie hinzuzufügen.

### Wie vereine ich Regionen mit VEREINIG?

Machen Sie jede geschlossene Form mit <Command id="REGION" /> zu einer Region und vereinen Sie sie dann: Die Regionen jeder Ebene werden zu einer Region, ihre gemeinsamen Seiten verschmolzen. Formen, die sich um eine Lücke schließen, lassen ein Loch, und getrennte Regionen werden zu einer Region aus einzelnen Teilen. Eine Region allein in ihrer Ebene bleibt, wie sie ist.
