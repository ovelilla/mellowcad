---
title: "Befehl EIGENSCHAFTEN (PROPERTIES) in AutoCAD"
description: "Wie EIGENSCHAFTEN (PROPERTIES, Strg+1) in AutoCAD die Eigenschaftenpalette öffnet: Farbe, Layer, Geometrie, mehrere Objekte. Zum Testen im Browser."
figure: "Ein Kreis, an der Eingabeaufforderung gewählt, seine Griffe sichtbar, dann EIGENSCHAFTEN: Die Palette öffnet sich neben der Zeichnung mit den Zeilen des Kreises."
sourceHash: "14d097ac5b0b"
---

EIGENSCHAFTEN (PROPERTIES) öffnet die Eigenschaftenpalette. Wie in AutoCAD ist sie eine Palette, kein Dialog: Sie bleibt neben der Zeichnung geöffnet, hier als Registerkarte des Palettenfelds, während Sie wählen und zeichnen, bis <Command id="PROPERTIESCLOSE" /> sie schließt. Strg+1 zeigt und verbirgt sie, und mit einem Apostroph eingegeben, `'EIGENSCHAFTEN`, öffnet sie sich innerhalb eines laufenden Befehls. In einem breiten Fenster ist sie von Anfang an offen.

Sind Objekte gewählt, zeigt sie deren Eigenschaften, und Sie ändern eine, indem Sie in ihrer Zeile einen neuen Wert eingeben oder wählen. Allgemein kommt zuerst, in der Reihenfolge von AutoCAD: Farbe, Layer, Linientyp, Linienstärke und Objekthöhe, `*VARIES*` wo sich die gewählten Objekte unterscheiden. Darunter die eigenen Zeilen jedes Typs: Start- und Endpunkt, Länge und Winkel einer Linie; Mittelpunkt, Radius, Durchmesser, Umfang und Fläche eines Kreises; die eines Bogens, einer Ellipse, die Scheitelpunkte und Breiten einer Polylinie, die Punkte eines Splines, die eines Textes, eines Blockreferenz. Koordinaten stehen im aktuellen BKS, und Zeilen, die nur anzeigen, etwa die Länge einer Linie, sind abgeblendet. Die Auswahlliste oben listet `Alle` und jeden Typ mit seiner Anzahl: Wählen Sie einen, um nur diesen Typ zu sehen und zu bearbeiten. Ist nichts gewählt, zeigt Allgemein den aktuellen Layer, die aktuelle Farbe, den aktuellen Linientyp und die aktuelle Linienstärke, die Sie dort für neue Objekte einstellen. Jede Bearbeitung ist ein Schritt, den <Command id="U" /> zurücknimmt.

## Missing

Der Linientypfaktor von Allgemein für mehrere Objekte auf einmal oder, wenn nichts gewählt ist, für neue Objekte (CELTSCALE); der Plotstil, die Transparenz und der Hyperlink sowie Material. Die Geometriezeilen mehrerer Objekte eines Typs auf einmal, der Inhalt eines Textes und Attributwerte lassen sich hier nicht bearbeiten. Schnellauswahl, der Schalter PICKADD, Automatisch ausblenden, Andocken und Schweben der Palette.

## Questions

### Wie lautet das Alias von EIGENSCHAFTEN (PROPERTIES) in AutoCAD?

Strg+1, was die Palette auch wieder verbirgt. Eingegeben: `EI` oder `E`, dann die Eingabetaste oder die Leertaste. Der volle Name funktioniert ebenfalls, und `_PROPERTIES` in jeder Sprache von AutoCAD.

### Die Eigenschaftenpalette ist verschwunden: Wie bekomme ich sie zurück?

Drücken Sie Strg+1 oder geben Sie `EI` ein: Die Palette erscheint wieder, als Registerkarte des Palettenfelds neben der Zeichnung. Strg+1, während sie sichtbar ist, verbirgt sie, und so ist sie oft verschwunden.

### Wie ändert man die Eigenschaften mehrerer Objekte auf einmal?

Wählen Sie alle und ändern Sie dann die Zeile: Jedes gewählte Objekt übernimmt den neuen Wert. Eine Zeile, deren Werte sich unterscheiden, zeigt `*VARIES*`, bis Sie sie festlegen. Um nur die Kreise darunter zu ändern, wählen Sie diesen Typ in der Auswahlliste oben.

### Was ist der Unterschied zwischen EIGENSCHAFTEN und EIGANPASS?

EIGENSCHAFTEN zeigt und setzt die Werte der gewählten Objekte. <Command id="MATCHPROP" /> kopiert sie von einem Objekt auf andere, ohne einen Wert einzugeben.
