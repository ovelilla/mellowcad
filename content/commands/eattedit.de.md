---
title: "Befehl EATTEDIT in AutoCAD"
description: "So bearbeitet AutoCADs EATTEDIT die Attributwerte eines Blocks im Erweiterten Attributeditor, und warum ein Doppelklick auf einen Block ihn startet. Testen."
figure: "Zwei Schreibtische, Referenzen auf einen Block mit den Attributen NUM und PART: EATTEDIT wählt den zweiten, und sein Feld PART wird B-200."
sourceHash: "3517c89fd5da"
---

EATTEDIT öffnet AutoCADs Erweiterten Attributeditor für eine Blockreferenz: Er bittet Sie, einen Block zu wählen, und zeigt dann für jedes seiner Attribute ein Feld, mit dem Tag beschriftet und mit seinem Wert gefüllt, wie die Registerkarte Attribut des Editors sie auflistet. Tippen Sie die Werte neu, wobei Tab von Feld zu Feld springt, und die Eingabetaste wendet sie in einem Schritt an, den <Command id="U" /> zurücknimmt; Esc ändert nichts.

Ein Doppelklick auf eine Referenz mit Attributen startet EATTEDIT, wie in AutoCAD: Die Befehlszeile schreibt ihn mit dem Punkt, auf den Sie doppelgeklickt haben, als Antwort, und das Fenster öffnet sich sofort. Die Wahl nimmt das Objekt unter dem Fenster: Alles außer einer Blockreferenz wird abgelehnt, ebenso ein Block ohne Attribute, und die Frage wird erneut gestellt. Nur die gewählte Referenz ändert sich; die Definition des Blocks und seine anderen Referenzen behalten ihre Werte.

## Missing

Die Registerkarte Textoptionen des Editors (Stil, Ausrichtung, Höhe, Drehung, Breitenfaktor und der Rest des Textes jedes Attributs) und seine Registerkarte Eigenschaften (Layer, Linientyp, Farbe, Linienstärke) und seine Schaltfläche Block wählen. ATTIPEDIT, das ein Attribut an Ort und Stelle bearbeitet, und sein Strg+Doppelklick. Der eigene Griff eines nicht gesperrten Attributs an einer Referenz und die Attributzeilen der Eigenschaften-Palette. `-ATTEDIT`.

## Questions

### Wie öffne ich den Erweiterten Attributeditor in AutoCAD?

Doppelklicken Sie auf eine Blockreferenz mit Attributen, oder tippen Sie `EATTEDIT` und wählen Sie sie. `_EATTEDIT` funktioniert in jeder Sprache von AutoCAD.

### Wie ändere ich einen Attributwert in AutoCAD?

Doppelklicken Sie auf den Block, tippen Sie den neuen Wert in das Feld des Attributs und drücken Sie die Eingabetaste. Jede Referenz behält ihre eigenen Werte: Die Änderung einer lässt die anderen, wie sie sind.

### Warum kann ich nicht doppelklicken, um die Attribute eines Blocks zu bearbeiten?

EATTEDIT öffnet sich für eine Referenz, deren Block Attribute enthält, und ein Block, der ohne sie erstellt wurde, hat keine: Definieren Sie sie mit <Command id="ATTDEF" /> und wählen Sie sie mit den anderen Objekten aus, wenn Sie den Block erstellen. Zeigt sich der Wert eines Attributs nicht, prüfen Sie <Command id="ATTDISP" />, der die unsichtbaren Attribute oder alle verbergen kann.

### Was ist der Unterschied zwischen EATTEDIT und ATTEDIT?

Sie bearbeiten dieselben Werte. EATTEDIT beschriftet jedes Feld mit seinem Tag, wie die Registerkarte Attribut des Erweiterten Attributeditors es tut; <Command id="ATTEDIT" /> mit seiner Eingabeaufforderung, wie das Dialogfeld Attribute bearbeiten es tut. In AutoCAD bearbeitet EATTEDIT auch die Textoptionen und Eigenschaften jedes Attributs.
