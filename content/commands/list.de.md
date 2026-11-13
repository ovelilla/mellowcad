---
title: "Befehl LISTE (LIST) in AutoCAD"
description: "Wie LISTE (LIST, Alias LS) in AutoCAD die Daten eines Objekts ausgibt: Typ, Layer, Länge, Fläche und Koordinaten der Punkte. Zum Testen im Browser."
figure: "LISTE für die Bohrung einer Platte: Layer, Mittelpunkt, Radius, Umfang und Fläche des Kreises."
sourceHash: "d0ebcf466ff5"
---

LISTE (LIST) schreibt einen Bericht über jedes Objekt, das Sie an der Eingabeaufforderung wählen, in den Spalten und Worten von AutoCAD 2027. Jeder beginnt mit seinem Typ, seinem Layer und seinem Bereich, dann seiner Farbe, seinem Linientyp, seiner Linienstärke und seiner Objekthöhe, wo sie nicht VonLayer oder null sind, dann dem, was der Typ hat: die Enden, die Länge, der Winkel und die Deltas einer Linie; Mittelpunkt, Radius, Umfang und Fläche eines Kreises; die Winkel und die Länge eines Bogens; die Scheitelpunkte, Breiten, Fläche und Länge einer Polylinie; die Kontroll- und Anpassungspunkte eines Splines; Stil, Höhe und Ausrichtung eines Textes; Typ, Punkte und Stil einer Bemaßung; Muster, Maßstab und Fläche einer Schraffur; Name, Einfügepunkt, Maßstäbe und Attribute eines Blockverweises; Zeilen und Elemente einer Anordnung; Fläche, Umfang und Umgrenzungsrahmen einer Region.

Punkte stehen im aktuellen BKS, Längen in der Genauigkeit der Zeichnung und Winkel in AUPREC. Objekte, die vor LISTE gewählt wurden, werden sofort aufgelistet, ohne die Eingabeaufforderung, und die Eingabetaste ins Leere beendet ihn ohne ein Wort. Jede Zeile kommt sofort: Das Textfenster von AutoCAD hält bei jeder Bildschirmseite bei `Drücken Sie die EINGABETASTE, um fortzufahren` an, während der Verlauf hier scrollt. Es gibt keine Zeile `Handle`: Objekte haben hier keine Handles.

## Missing

Die Fläche einer offenen Polylinie mit Kurvenanpassung: Hier ist es die Fläche der Kurve, durch ihre Sehne geschlossen, und die von AutoCAD ist größer. Die Länge eines Splines ist hier exakt, wo die von AutoCAD eine enge Näherung ist. Eine aus zwei Linien erzeugte DIMANGULAR wird durch ihre drei Punkte aufgelistet, und keine Bemaßung ist jemals `associative: yes`. Die Pause und das Textfenster von AutoCAD. Was Objekte hier nicht haben: VonBlock, eine Linienstärke Standard, einen eigenen Linientypfaktor, Transparenz und Gruppen.

## Questions

### Wie lautet das Alias von LISTE (LIST) in AutoCAD?

`LS` oder `LIS`, dann die Eingabetaste oder die Leertaste. Der volle Name funktioniert ebenfalls, und `_LIST` in jeder Sprache von AutoCAD.

### Was zeigt der Befehl LISTE?

Alles, was LISTE von AutoCAD über das Objekt sagt: seinen Typ, Layer, Bereich und die Eigenschaften, die nicht VonLayer sind, dann seine Geometrie, jeden Punkt und jede Länge als Zahlen. Wählen Sie mehrere Objekte, und jedes erhält seinen Bericht.

### Wie ermittelt man die Länge oder Fläche eines Objekts?

Listen Sie es auf: die Länge einer Linie, Umfang und Fläche eines Kreises, Länge oder Umfang und Fläche einer Polylinie. Um mehrere Flächen zu addieren, verwenden Sie <Command id="AREA" />.

### Wie sieht man die Koordinaten der Endpunkte einer Linie?

Listen Sie die Linie auf: `von Punkt` und `nach Punkt`, im aktuellen BKS. Für einen einzelnen Punkt <Command id="ID" /> mit einem Objektfang.

### Was ist der Unterschied zwischen LISTE und EIGENSCHAFTEN?

LISTE schreibt einen Bericht, den Sie lesen und aus dem Verlauf kopieren. <Command id="PROPERTIES" /> zeigt dieselben Werte in einer Palette, in der Sie sie ändern können.
