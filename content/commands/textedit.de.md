---
title: "Befehl TEXTBEARB (TEXTEDIT) in AutoCAD"
description: "Wie TEXTBEARB (TEXTEDIT, Alias TBEARB) in AutoCAD Text bearbeitet: einzeiliger und mehrzeiliger Text, Attributdefinitionen, Modus Einzeln und Mehrfach."
figure: "Ein falsch geschriebenes PALTE auf einem Typenschild, mit TEXTBEARB gewählt und als PLATE neu eingegeben, dann Esc zum Beenden des Befehls."
sourceHash: "2d0ed6fe5acc"
---

TEXTBEARB (TEXTEDIT) bearbeitet Beschriftungsobjekte: Er nennt den aktuellen Bearbeitungsmodus, zunächst Multiple, und fordert Sie auf, eines zu wählen. Ein einzeiliger Text öffnet sich zum Neueingeben an Ort und Stelle, ein mehrzeiliger Text im Editor von <Command id="MTEXT" />, eine Attributdefinition als ihr Tag, ihre Eingabeaufforderung und ihr Vorgabewert. Im Modus Multiple fragt er dann nach dem nächsten Objekt, bis Esc oder die Eingabetaste den Befehl beendet, und der ganze Durchlauf ist ein Schritt, den <Command id="U" /> zurücknimmt. Ein Doppelklick auf einen Text oder eine Attributdefinition führt TEXTBEARB aus, und bei einem mehrzeiligen Text öffnet er den Editor für dieses eine Objekt.

Esc im Editor eines einzeiligen Textes verwirft diese Bearbeitung und fragt nach dem nächsten Objekt; ein zweites Esc beendet den Befehl. Ein Objekt auf einem gesperrten Layer meldet <Message id="objectOnLockedLayer" /> und fragt erneut, und eine Wahl auf etwas anderem fragt schweigend erneut. Ein vor dem Befehl gewählter Text öffnet sich sofort.

## Options

### Undo

Nimmt die letzte Bearbeitung dieses Durchlaufs zurück und fragt erneut; ist keine mehr übrig, meldet er, dass der Befehl vollständig zurückgenommen wurde.

### Mode

Fragt nach dem Bearbeitungsmodus: <Keyword id="Single" /> beendet den Befehl nach einem Objekt, <Keyword id="Multiple" /> fragt nach einem weiteren. Der Modus bleibt für das nächste TEXTBEARB erhalten, in jeder Zeichnung.

## Missing

Bemaßungstext: TEXTBEARB bearbeitet den Text einer Bemaßung nicht, den die Option Text von <Command id="DIMLINEAR" /> beim Platzieren festlegt. Das Bearbeiten des Inhalts eines Textes in der Eigenschaftenpalette. MTEDIT, eingegeben, und -MTEDIT. Solange der Editor offen ist, zeigt die Befehlszeile `TEXTBEARB:`, da AutoCAD an Ort und Stelle bearbeitet und nichts fragt.

## Questions

### Wie lautet das Alias von TEXTBEARB (TEXTEDIT) in AutoCAD?

`TBEARB`, dann die Eingabetaste oder die Leertaste; `TBEAR` und `DDEDIT` ebenfalls, AutoCADs ältere Namen. `_TEXTEDIT` funktioniert in jeder Sprache von AutoCAD.

### Wie bearbeitet man Text in AutoCAD?

Doppelklicken Sie ihn, oder geben Sie `TBEARB` ein und wählen Sie ihn; geben Sie ihn neu ein und drücken Sie die Eingabetaste. TEXTBEARB fragt dann nach dem nächsten zu bearbeitenden Text, bis Esc. Seine Höhe und Drehung sind Zeilen der Eigenschaftenpalette, und sein Stil die Zeile Stil.

### Wie bearbeitet man mehrere Texte nacheinander?

Lassen Sie TEXTBEARB im Modus <Keyword id="Multiple" />, seiner Vorgabe: Nach jedem Text fragt er nach dem nächsten. <Keyword id="Mode" /> und <Keyword id="Single" /> lassen ihn nach einem enden, wie es ein Doppelklick tut.

### Warum bearbeitet der Doppelklick meinen Text nicht?

Der Text liegt möglicherweise auf einem gesperrten Layer: Entsperren Sie den Layer im Layer-Eigenschaften-Manager. Der Text einer Bemaßung wird von TEXTBEARB noch nicht bearbeitet, und die Attributwerte eines Blocks öffnen <Command id="EATTEDIT" />.
