---
title: "Befehl LAYER (DDLMODI) in AutoCAD"
description: "Wie LAYER (Alias LA) in AutoCAD funktioniert: die Spalten des Layer-Eigenschaften-Managers, Neu, Löschen, Aktuell und wie Ein und Sperren auf Objekte wirken."
figure: "Drei Layer, jeder vor dem Zeichnen darauf aktuell gesetzt: Wände in Weiß, eine Tür in Gelb, eine Achse in Rot mit dem Linientyp Center."
sourceHash: "e195245adf85"
---

LAYER öffnet den Layer-Eigenschaften-Manager, in dem die Layer einer Zeichnung angelegt, benannt und eingestellt werden. Wie in AutoCAD ist er eine Palette, kein Dialogfeld: Er bleibt beim Zeichnen geöffnet, schwebend über der Zeichnung oder an einer Seite fixiert, bis <Command id="LAYERCLOSE" /> ihn schließt, und mit vorangestelltem Apostroph innerhalb eines anderen Befehls eingegeben, öffnet er sich, ohne diesen Befehl zu beenden. Jedes Objekt liegt auf einem Layer, und seine Farbe, sein Linientyp und seine Linienstärke sind, wenn sie VonLayer sind, die des Layers. Neue Objekte kommen auf den aktuellen Layer.

Jeder Layer ist eine Zeile, in der Spaltenreihenfolge von AutoCAD: Status, ein Häkchen auf dem aktuellen Layer, dann Name, Ein, Sperren, Farbe, Linientyp und Linienstärke; die Zeilen sind nach Namen sortiert, und die Statuszeile darunter zählt sie. Neu fügt einen Layer mit Farbe, Linientyp und Linienstärke des gewählten Layers hinzu, sein Name zur Eingabe offen, und lässt den aktuellen Layer, wie er ist. Aktuell setzen oder ein Doppelklick auf eine Zeile macht einen Layer aktuell. Ein Klick auf den Namen des gewählten Layers oder F2 benennt ihn um, und ein bereits verwendeter Name oder einer mit Zeichen, die AutoCAD verbietet, wird abgelehnt, wie auch bei Layer 0. Löschen entfernt einen Layer, aber nie Layer 0, den aktuellen Layer oder einen, der Objekte enthält: Das Dialogfeld Layer – Nicht gelöscht von AutoCAD nennt den Grund. Jede Änderung im Manager ist ein Schritt, den <Command id="U" /> zurücknimmt, aufeinanderfolgende gemeinsam. Mit der Tastatur im Manager sind Alt+N, Alt+L und Alt+A Neu, Löschen und Aktuell setzen, wie ihre QuickInfos sagen, und die Pfeiltasten bewegen sich durch die Zeilen und Zellen. In der Befehlszeile erledigt -LAYER dasselbe ohne die Palette, mit den Eingabeaufforderungen von AutoCAD, auch in Skripten.

## Missing

LAYDEL und die anderen Werkzeuge des Bereichs Layer: Layer des Objekts aktuell setzen, Layer angleichen, Layer vorher und der Rest, sowie die Symbole Ein, Frieren und Sperren in seiner Dropdown-Liste. Layer können nicht gefroren werden, und der Manager hat keine Spalten Frieren, Plot, Transparenz, Plotstil, Neue VP frieren oder Beschreibung, keine Umordnung der Spalten und keine Sortierung nach einer anderen, keine Layerfilter, keinen Baum und keine Suche, keine Layerstatus und kein Einstellungsdialogfeld. Das Starten von LAYER ist kein eigener Rückgängig-Schritt. Ein neuer Layer wird sofort einsortiert, wo AutoCAD ihn bis zur Umbenennung unter dem gewählten zeigt, und die Linienstärke von Layer 0 ist 0,25 mm, nicht Standard. LAYLOCKFADECTL kann nicht eingegeben werden: Die Objekte eines gesperrten Layers werden immer zur Hälfte abgeblendet.

## Questions

### Wie lautet das Kürzel für LAYER in AutoCAD?

`LA`, dann die Eingabetaste oder die Leertaste; ebenso `DDLMODI`, und `_LAYER` in jeder Sprache von AutoCAD. Er öffnet den Layer-Eigenschaften-Manager, und <Command id="LAYERCLOSE" /> schließt ihn.

### Wie ändere ich den Layer eines Objekts?

Wählen Sie das Objekt, dann den Layer in der Dropdown-Liste Layer der Multifunktionsleiste (Registerkarte Start): Es wechselt dorthin in einem Rückgängig-Schritt, und der aktuelle Layer bleibt, wie er war. Die Zeile Layer der Eigenschaftenpalette tut dasselbe. Ist nichts gewählt, macht die Dropdown-Liste den gewählten Layer aktuell.

### Wie lösche ich einen Layer in AutoCAD?

Wählen Sie ihn im Layer-Eigenschaften-Manager und drücken Sie Entf. Layer 0, der aktuelle Layer und ein Layer, der Objekte enthält, auch in einer Blockdefinition, können nicht gelöscht werden: Löschen oder verschieben Sie zuerst seine Objekte und machen Sie einen anderen Layer aktuell.

### Was ist der Unterschied zwischen Ausschalten und Sperren eines Layers?

Ein ausgeschalteter Layer blendet seine Objekte aus: Sie können nicht gewählt oder gefangen werden und verlassen die Auswahl. Die Objekte eines gesperrten Layers bleiben sichtbar, abgeblendet, und können gefangen und gewählt werden, aber kein Befehl bearbeitet sie: Ein Befehl, dem sie gegeben werden, zählt sie und lässt sie aus. Das Ausschalten des aktuellen Layers fragt zuerst, wie in AutoCAD.

### Wie lege ich einen neuen Layer an?

Drücken Sie Neu im Layer-Eigenschaften-Manager und geben Sie seinen Namen ein: Der Layer übernimmt Farbe, Linientyp und Linienstärke des gewählten, die Sie dann in seiner Zeile ändern. Setzen Sie ihn aktuell, um darauf zu zeichnen.
