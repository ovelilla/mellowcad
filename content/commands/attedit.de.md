---
title: "Befehl ATTEDIT in AutoCAD: Blockattribute bearbeiten"
metaTitle: "Befehl ATTEDIT in AutoCAD"
description: "Wie ATTEDIT (Alias AE) in AutoCAD die Attributwerte eines Blockverweises ändert: das Feld je Attribut, Tab, Eingabetaste und der Unterschied zu EATTEDIT."
figure: "Drei Türschilder, Verweise auf einen Block mit dem Attribut NUM: ATTEDIT wählt das letzte, als 2 eingefügt, und sein Feld macht es zu 3."
sourceHash: "4a8ee28ecc53"
---

ATTEDIT ändert die Attributwerte eines Blockverweises. Er fordert Sie auf, den Verweis zu wählen, und öffnet dann ein Feld mit einem Eingabefeld für jedes seiner Attribute, beschriftet mit der Eingabeaufforderung des Attributs und gefüllt mit seinem Wert, wie der Dialog „Attribute bearbeiten“ von AutoCAD. Geben Sie die Werte neu ein, Tab springt von einem Feld zum nächsten, und die Eingabetaste, das OK von AutoCAD, wendet sie in einem Schritt an, den <Command id="U" /> zurücknimmt; Esc, sein Abbrechen, ändert nichts.

Die Wahl nimmt das Objekt unter dem Feld. Alles außer einem Blockverweis wird abgelehnt, ebenso ein Verweis, dessen Block keine Attribute hat, und die Frage wird erneut gestellt; eine Wahl ins Leere fragt schweigend erneut. Die Definition des Blocks wird nicht geändert, auch nicht seine anderen Verweise: Jeder trägt eigene Werte. <Command id="EATTEDIT" /> bearbeitet dieselben Werte in einem nach Tags beschrifteten Feld, und ein Doppelklick auf einen Verweis mit Attributen führt es aus.

## Missing

`-ATTEDIT`, die Befehlszeilenform, die Attribute einzeln oder global bearbeitet, und ihre Aliase `-ATE` und `ATTE`. Die Schaltflächen „Vorheriges“ und „Nächstes“ von „Attribute bearbeiten“, für einen Block mit mehr Attributen, als eine Seite fasst, und seine Zeile „Blockname“. ATTIPEDIT, das ein Attribut an Ort und Stelle bearbeitet, und sein Strg+Doppelklick. Der eigene Griff eines nicht gesperrten Attributs an einem Verweis und die Attributzeilen der Eigenschaftenpalette.

## Questions

### Wie lautet das Alias von ATTEDIT in AutoCAD?

`AE`, dann die Eingabetaste oder die Leertaste; `DDATTE` ebenfalls. `_ATTEDIT` funktioniert in jeder Sprache von AutoCAD.

### Wie bearbeitet man Blockattribute in AutoCAD?

Geben Sie `AE` ein und wählen Sie den Verweis, oder doppelklicken Sie ihn, was <Command id="EATTEDIT" /> ausführt. Ändern Sie die Werte im Feld und drücken Sie die Eingabetaste. Um die Attribute selbst zu ändern, ihr Tag, ihre Eingabeaufforderung oder ihre Position, bearbeiten Sie die Definitionen und definieren Sie den Block mit <Command id="BLOCK" /> neu.

### Warum meldet ATTEDIT, dass der Block keine bearbeitbaren Attribute hat?

Weil der Block des gewählten Verweises keine Attribute enthält: ATTEDIT bearbeitet die Werte eines Verweises auf einen Block, der welche hat. Eine Definition, die noch keinem Block beigetreten ist, wird mit <Command id="TEXTEDIT" /> bearbeitet, per Doppelklick darauf.

### Was ist der Unterschied zwischen ATTEDIT und EATTEDIT?

Beide bearbeiten die Werte eines Verweises. Das Feld von ATTEDIT beschriftet jedes Eingabefeld mit der Eingabeaufforderung des Attributs, wie der Dialog „Attribute bearbeiten“ von AutoCAD; das von <Command id="EATTEDIT" />, der Erweiterte Attribut-Editor, mit seinem Tag. In AutoCAD hat EATTEDIT außerdem Registerkarten für die Textoptionen und Eigenschaften jedes Attributs.
