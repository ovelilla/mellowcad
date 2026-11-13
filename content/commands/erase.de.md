---
title: "Befehl LÖSCHEN (ERASE) in AutoCAD"
description: "Wie LÖSCHEN (ERASE, Alias LÖ) in AutoCAD Objekte löscht: wählen, Eingabetaste, Entf-Taste, alles löschen und das Gelöschte zurückholen. Zum Testen im Browser."
figure: "Ein Rechteck und seine beiden Diagonalen: eine Diagonale gewählt, dann die Eingabetaste, und sie ist gelöscht."
sourceHash: "2de33971060a"
---

LÖSCHEN (ERASE) entfernt die gewählten Objekte aus der Zeichnung. Wählen Sie sie bei `Objekte wählen:`, durch Anklicken oder mit einem der Auswahlmodi von AutoCAD, darunter ein Fenster oder Kreuzen, dann drücken Sie die Eingabetaste oder die Leertaste: Sie sind weg, und der Befehl sagt nichts weiter. Esc beendet ihn, ohne etwas zu löschen. Wie in AutoCAD werden vor dem Befehl gewählte Objekte sofort gelöscht, und die Entf-Taste mit gewählten Objekten führt LÖSCHEN für sie aus. Während Sie wählen, werden das Objekt unter dem Fadenkreuz und die bereits gewählten verblasst gezeichnet, wie AutoCAD vorab zeigt, was es löschen wird. Das ganze Löschen ist ein Schritt, den Rückgängig zurücknimmt.

## Missing

OOPS, das in AutoCAD die zuletzt von LÖSCHEN gelöschte Auswahl zurückbringt, auch nach anderen Befehlen. Hier nimmt <Command id="U" /> oder Strg+Z das Löschen zurück, mit allem, was danach kam.

## Questions

### Wie lautet das Alias von LÖSCHEN (ERASE) in AutoCAD?

`LÖ`, dann die Eingabetaste oder die Leertaste; `DELETE` ist ebenfalls ein Alias. Das `E` des englischen AutoCAD gehört in der deutschen Version zu EIGENSCHAFTEN. Oder wählen Sie die Objekte bei `Befehl:` und drücken Sie die Entf-Taste. Der volle Name funktioniert auch, und `_ERASE` in jeder Sprache von AutoCAD.

### Wie löscht man alles in einer Zeichnung?

Starten Sie LÖSCHEN und geben Sie bei `Objekte wählen:` `ALLE` ein, dann die Eingabetaste. Objekte auf einem gesperrten Layer werden ausgelassen, und die Auswahl sagt, wie viele es waren.

### Wie holt man zurück, was man gelöscht hat?

Geben Sie sofort <Command id="U" /> ein oder drücken Sie Strg+Z: Das Löschen ist ein Rückgängig-Schritt. OOPS, das die zuletzt gelöschte Auswahl auch nach anderen Befehlen zurückbringt, ist noch nicht gebaut.

### Was ist der Unterschied zwischen LÖSCHEN und STUTZEN?

LÖSCHEN entfernt ganze Objekte. <Command id="TRIM" /> entfernt nur den Teil eines Objekts, der über die Kanten hinausläuft, die er trifft, und behält den Rest.
