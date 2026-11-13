---
title: "Befehl BEMDURCHM (DIMDIAMETER) in AutoCAD"
description: "Wie BEMDURCHM (DIMDIAMETER, Alias BMD) in AutoCAD einen Kreis oder Bogen bemaßt: wählen, dann den Durchmesser innen oder außen platzieren."
figure: "Ein großer Kreis innen bemaßt und ein kleiner außen: jeder Kreis gewählt, dann der Text platziert."
sourceHash: "76537f5f9854"
---

BEMDURCHM (DIMDIAMETER) bemaßt den Durchmesser eines Kreises, eines Bogens oder eines Bogensegments einer Polylinie, mit den Eingabeaufforderungen von <Command id="DIMRADIUS" />: Wählen Sie die Kurve, und die Befehlszeile meldet sofort das Maß; platzieren Sie dann die Bemaßung, und der Befehl endet. Ihr Text ist der Durchmesser nach dem Durchmesserzeichen. Innerhalb des Kreises platziert, verläuft eine Linie vom Text zu einer Pfeilspitze am Rand; außerhalb platziert, durchquert die Linie den Kreis von Rand zu Rand, ihre ferne Pfeilspitze zeigt von einem kurzen Stück zurück nach innen, wie ISO-25 es zeichnet.

## Options

### Text

Fragt nach dem Text, der anstelle des Maßes geschrieben wird, das als Vorgabe angeboten wird: Die Eingabetaste behält das Maß. In dem, was Sie eingeben, steht `<>` für das Maß mit seinem Zeichen, `<> THRU` schreibt also den Durchmesser gefolgt von THRU.

### Angle

Fragt nach dem Winkel des Texts, der dann in diesem Winkel gezeichnet wird, seine Mitte auf der Linie, und die Linie endet an ihm. 0 legt ihn wieder entlang der Linie.

## Missing

Mtext: Der Text einer Bemaßung ist eine Zeile, in der Befehlszeile mit <Keyword id="Text" /> festgelegt, nie im Texteditor. Das Zeichen wird als Ø gezeichnet, wo AutoCAD ∅ schreibt: Die Zeichnungsschrift hat kein ∅. Bei einem Bogen bleiben die Pfeilspitzen zwischen seinen Enden, wo AutoCAD eine Maßhilfslinie als Bogen zeichnet. Wie bei <Command id="DIMRADIUS" /> kann eine Kurve in einem Blockverweis nicht gewählt werden, die Mittellinien des Stils werden nicht gezeichnet, und seine Einstellungen für Text außerhalb der Kurve werden nicht angeboten. Eine Bemaßung ist nicht assoziativ: Sie folgt der Kurve, die sie misst, nicht.

## Questions

### Wie lautet das Kürzel für BEMDURCHM (DIMDIAMETER) in AutoCAD?

`BMD`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_DIMDIAMETER` in jeder Sprache von AutoCAD.

### Wie bemaße ich ein kleines Loch?

Platzieren Sie den Text außerhalb des Kreises: Die Maßlinie durchquert das Loch dann mit einer Pfeilspitze auf jeder Seite, und der Text steht frei daneben. Innen braucht der Text Platz im Kreis.

### Kann BEMDURCHM einen Bogen bemaßen?

Ja: einen Bogen oder das Bogensegment einer Polylinie, wie einen Kreis, und der Befehl meldet den Durchmesser des Kreises des Bogens. Alles andere ergibt <Message id="notCircleOrArc" />, und es wird erneut gefragt.

### Wie füge ich einer Durchmesserbemaßung THRU oder eine Anmerkung hinzu?

Wählen Sie <Keyword id="Text" /> vor dem Platzieren und geben Sie `<> THRU` ein: `<>` ist das Maß mit seinem Zeichen. Nach dem Platzieren ändert die Textüberschreibung der Palette Eigenschaften es.
