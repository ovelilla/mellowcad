---
title: "Befehl VOLKÖRPERBEARB (SOLIDEDIT) in AutoCAD"
description: "Wie VOLKÖRPERBEARB (SOLIDEDIT) in AutoCAD die Flächen eines 3D-Volumenkörpers bearbeitet: Extrudieren, Verschieben, Drehen, Versetzen, Verjüngen. Zum Testen."
figure: "Die obere Fläche eines Quaders, mit VOLKÖRPERBEARB um 15 nach oben und mit einer Verjüngung von 15 Grad extrudiert: ein Kegelstumpf auf dem Quader, von Südosten gesehen."
sourceHash: "775cdc271d4f"
---

VOLKÖRPERBEARB (SOLIDEDIT) bearbeitet einen 3D-Volumenkörper über seine Flächen. Der Befehl sagt, ob jede Bearbeitung geprüft wird, und fragt dann, was bearbeitet werden soll: <Keyword id="Face" />, dann die Flächenoption, dann die Flächen, dann das, was die Option verlangt. Jede Bearbeitung wird sofort ausgeführt, und die Flächenoptionen werden erneut abgefragt, sodass ein Aufruf mehrere Bearbeitungen umfassen kann; <Keyword id="eXit" /> oder die Eingabetaste verlässt die Flächenoptionen, dann den Befehl. Die Nachbarflächen folgen einer Fläche: Verschieben Sie die Oberseite eines Quaders nach oben, und seine Seiten wachsen mit.

Der Volumenkörper behält seinen Layer und seine Eigenschaften, verliert aber, wodurch er entstanden ist: Ein Quader ist danach kein Quader mehr. Der ganze Aufruf ist ein Rückgängig-Schritt, und sein <Keyword id="Undo" /> nimmt die Bearbeitungen darin einzeln zurück. Die Eingabetaste an der Eingabeaufforderung `Befehl:` führt ihn erneut ab der ersten Frage aus. Die Schaltfläche für Flächen im Bereich „Volumenkörper bearbeiten“ führt jede Flächenoption direkt aus. In MellowCAD gibt es nur 3D-Volumenkörper, und diese sind noch unvollständig.

## Options

### Face

Die Flächenoptionen. Jede fragt nach Flächen, bis Sie die Eingabetaste drücken: Ein Klick oder ein eingegebener Punkt wählt die Fläche, die Ihnen dort am nächsten liegt, oder die beiden Flächen einer Kante, und eine bereits gewählte Fläche gibt die dahinterliegende. Sobald eine Fläche gewählt ist, wählt <Keyword id="ALL" /> alle Flächen ihres Volumenkörpers; <Keyword id="Remove" /> nimmt stattdessen Flächen aus der Auswahl heraus, und <Keyword id="Undo" /> macht die letzte Wahl rückgängig. Eine Wahl ins Leere meldet <Message id="noSolidsDetected" />. Nur Flächen eines einzigen Volumenkörpers.

### Extrude

Fragt nach einer Höhe und einem Verjüngungswinkel: Jede Fläche wächst zu einem Prisma heran, das dem Volumenkörper hinzugefügt oder bei negativer Höhe aus ihm herausgenommen wird; bei positivem Winkel wird es nach oben schmaler. Die Eingabetaste bei der Höhe übernimmt die letzte Höhe, die die Grundkörper oder <Command id="EXTRUDE" /> verwendet haben.

### Move

Fragt nach einem Basispunkt und einem zweiten Punkt: Eine ebene Fläche bewegt sich so weit, wie diese Strecke entlang ihrer Normalen verläuft, ihre Nachbarn nimmt sie mit. Die Eingabetaste beim zweiten Punkt übernimmt den Basispunkt als Verschiebung.

### Rotate

Fragt nach einer Achse, durch zwei Punkte oder entlang der <Keyword id="Xaxis" />, <Keyword id="Yaxis" /> oder <Keyword id="Zaxis" /> des BKS oder senkrecht zum Bildschirm mit <Keyword id="View" />, dann nach einem Winkel: Die Fläche dreht sich um sie nach der Rechte-Hand-Regel.

### Offset

Fragt nach einem Abstand: Die Fläche bewegt sich entlang ihrer Normalen nach außen oder bei einem negativen Wert nach innen, ihre Nachbarn nimmt sie mit, runde Flächen auch um ihre Achse. Ein Versatz nach innen, der die halbe längste Seite des Quaders um den Volumenkörper erreicht, wird abgelehnt, und die Meldung nennt, wie weit er gehen darf.

### Taper

Fragt nach einem Basispunkt, einem Punkt entlang der Verjüngungsachse und einem Winkel: Die Fläche neigt sich um die Stelle, an der sie die Ebene durch den Basispunkt trifft; ein positiver Winkel neigt sie entlang der Achse nach innen.

### Delete

Entfernt die Wand eines Lochs und schließt es damit, oder den Streifen einer Abrundung oder einer Fase und gibt die Kante zurück, die er ersetzt hat.

### Copy

Erzeugt aus jeder ebenen Fläche eine Region, dort wo sie liegt oder um zwei Punkte verschoben, auf dem aktuellen Layer und mit den aktuellen Eigenschaften.

### Undo

Macht bei den Flächenoptionen die letzte Bearbeitung dieses Aufrufs rückgängig; ist keine mehr übrig, meldet <Message id="commandCompletelyUndone" />.

### eXit

Verlässt die Flächenoptionen zur ersten Frage, und deren eXit verlässt den Befehl; die Eingabetaste tut dasselbe.

## Missing

<Keyword id="Edge" /> und <Keyword id="Body" /> sowie <Keyword id="coLor" /> und <Keyword id="mAterial" /> der Flächen, die angeboten und abgelehnt werden, ebenso <Keyword id="Path" /> beim Extrudieren, die Achse nach Objekt beim Drehen und deren <Keyword id="Reference" />-Winkel. Kreuzen, Zaun und KPolygon zum Wählen von Flächen. Das Verschieben, Drehen, Verjüngen oder Kopieren einer gekrümmten Fläche, das Versetzen einer Fläche zwischen anderen Nachbarn, das Löschen einer Fläche, die weder Lochwand noch Streifen ist, und eine Bearbeitung, die die Form des Volumenkörpers so stark ändert, dass eine Fläche eine andere aufzehrt. Bearbeitungen neben einer verjüngt extrudierten Fläche. Ein Versatz nach außen, der zu weit geht: AutoCAD lässt ihn stillschweigend fallen, MellowCAD führt ihn aus. Eine Vorschau, während Sie einen Abstand oder einen Winkel angeben.

## Questions

### Wie bearbeitet man einen 3D-Volumenkörper in AutoCAD?

Starten Sie VOLKÖRPERBEARB, wählen Sie <Keyword id="Face" /> und dann, was geschehen soll: <Keyword id="Extrude" /> oder <Keyword id="Move" /> einer Fläche, um den Volumenkörper höher zu machen, <Keyword id="Delete" />, um ein Loch zu füllen, <Keyword id="Taper" />, um eine Seite zu neigen. Wählen Sie die Flächen, drücken Sie die Eingabetaste und beantworten Sie die Fragen der Option. Zum schnellen Drücken oder Ziehen zieht <Command id="PRESSPULL" /> ebenfalls eine Fläche.

### Wie extrudiert man eine Fläche eines 3D-Volumenkörpers?

VOLKÖRPERBEARB, <Keyword id="Face" />, <Keyword id="Extrude" />, die Fläche wählen und die Eingabetaste drücken, dann die Höhe und den Verjüngungswinkel: Die `15` und `15` der Sitzung erzeugen einen Kegelstumpf auf der Oberseite eines Quaders.

### Wie entfernt man ein Loch aus einem Volumenkörper?

VOLKÖRPERBEARB, <Keyword id="Face" />, <Keyword id="Delete" />, die Wand des Lochs wählen und die Eingabetaste drücken: Das Loch wird gefüllt. Auf dieselbe Weise lässt sich eine Abrundung oder eine Fase entfernen.

### Was ist der Unterschied zwischen VOLKÖRPERBEARB und PRESSPULL?

<Command id="PRESSPULL" /> bewegt eine Fläche durch Ziehen oder mit einem Abstand, senkrecht zu ihr selbst. VOLKÖRPERBEARB kann das und mehr: Es verjüngt, dreht, versetzt, löscht und kopiert Flächen, auch mehrere auf einmal.
