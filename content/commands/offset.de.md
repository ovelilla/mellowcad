---
title: "Befehl VERSETZ (OFFSET) in AutoCAD"
description: "Wie VERSETZ (OFFSET, Alias VS) in AutoCAD funktioniert: ein Abstand oder Durchgang, Löschen und Layer, ein Objekt und eine Seite nach der anderen."
figure: "Ein Rechteck um 6 nach innen versetzt und ein Kreis um 6 nach außen, jeweils gewählt, dann seine Seite."
sourceHash: "b495af1e1410"
---

VERSETZ (OFFSET) zeichnet eine Kopie eines Objekts parallel dazu, in einem Abstand, den Sie eingeben, oder durch einen Punkt, den Sie wählen: Eine Linie ergibt eine parallele Linie, ein Kreis oder ein Bogen einen konzentrischen, eine Polylinie einen Umriss innerhalb oder außerhalb, eine Ellipse oder ein Spline einen Spline, der ihr folgt. Wie in AutoCAD nimmt der Befehl ein Objekt nach dem anderen: Sie geben den Abstand einmal an, wählen dann ein Objekt und die Seite, auf die seine Kopie kommt, so oft Sie möchten. Die Eingabetaste beendet ihn.

## Options

### Through

Anstelle eines Abstands verläuft jede Kopie durch einen Punkt, den Sie wählen oder eingeben. Es ist die Vorgabe der ersten Eingabeaufforderung, die Eingabetaste wählt es dort also, bis ein Abstand angegeben wurde; von da an wiederholt die Eingabetaste den letzten Abstand, in dieser Zeichnung.

### Erase

Fragt, ob jedes Ausgangsobjekt nach dem Versetzen gelöscht werden soll, <Keyword id="Yes" /> oder <Keyword id="No" /> (die Vorgabe). Mit <Keyword id="Yes" /> ersetzt die Kopie das Objekt. Die Wahl bleibt für den Rest der Sitzung erhalten, und das nächste VERSETZ zeigt sie in seiner ersten Zeile.

### Layer

Fragt, wohin die Kopien kommen: auf den <Keyword id="Current" />-Layer oder auf den des <Keyword id="Source" />-Objekts (die Vorgabe). Ebenfalls für die Sitzung beibehalten.

### Exit

Beendet den Befehl, wie die Eingabetaste bei der Eingabeaufforderung des Objekts.

### Multiple

Bei der Eingabeaufforderung der Seite: Versetzt dasselbe Objekt weiter, ohne es erneut zu wählen, jede Kopie einen Abstand weiter außen als die letzte, bis zur Eingabetaste oder <Keyword id="Exit" />.

### Undo

Nimmt die letzte Kopie zurück, von welchem Objekt sie auch stammt, und fragt erneut nach einem Objekt. Ist keine Kopie mehr zurückzunehmen, meldet der Befehl es.

## Missing

OFFSETGAPTYPE 1 und 2: Die Ecken einer versetzten Polylinie werden immer wie bei 0 geschlossen, die Segmente bis zum Treffen verlängert. Der Versatz eines Splines oder einer Ellipse liegt innerhalb der Toleranz von AutoCAD, aber seine Knoten liegen dort, wo MellowCAD sie setzt, nicht dort, wo AutoCAD sie setzt. Through an einem Spline zeigt in seiner QuickInfo X und Y, nicht den Abstand.

## Questions

### Wie lautet das Kürzel für VERSETZ (OFFSET) in AutoCAD?

`VS`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_OFFSET` in jeder Sprache von AutoCAD.

### Warum kann ich ein Objekt nicht versetzen?

VERSETZ versetzt Linien, Bögen, Kreise, 2D-Polylinien, Ellipsen und Splines. Text, Absatztext, Blockreferenzen, Bemaßungen und Schraffuren lehnt der Befehl mit <Message id="cannotOffsetObject" /> ab, ebenso, wenn der Abstand einen Kreis, einen Bogen oder eine Polylinie auf nichts schrumpfen ließe. Ein Objekt auf einem gesperrten Layer kann nicht gewählt werden, und eine 3D-Polylinie wird übergangen.

### Wie versetze ich dieselbe Linie mehrmals?

Wählen Sie die Linie, geben Sie dann bei der Eingabeaufforderung der Seite den Buchstaben von <Keyword id="Multiple" /> ein: Jede Auswahl auf dieser Seite erzeugt eine weitere Kopie, jede einen Abstand hinter der letzten. Oder behalten Sie die Vorgabe und wählen Sie jedes Mal die neueste Kopie.

### Wie lege ich die versetzten Kopien auf den aktuellen Layer?

Wählen Sie bei der ersten Eingabeaufforderung <Keyword id="Layer" />, dann <Keyword id="Current" />. Von da an kommt jede Kopie auf den aktuellen Layer, bis Sie wieder <Keyword id="Source" /> wählen.
