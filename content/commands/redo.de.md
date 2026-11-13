---
title: "Befehl ZLÖSCH (REDO) in AutoCAD: Wiederherstellen"
metaTitle: "Befehl ZLÖSCH (REDO) in AutoCAD"
description: "Wie ZLÖSCH (REDO) in AutoCAD wiederherstellt, was das letzte Z oder ZURÜCK zurückgenommen hat: nur direkt danach, MZLÖSCH und Strg+Y. Zum Testen."
figure: "Eine in einer Platte gezeichnete Bohrung, mit Z zurückgenommen und mit ZLÖSCH wiederhergestellt."
sourceHash: "be2e44b98ac0"
---

ZLÖSCH (REDO) macht das letzte <Command id="U" /> oder <Command id="UNDO" /> rückgängig: Was es zurückgenommen hat, wird wieder gezeichnet, alles davon, sodass ZLÖSCH nach einem ZURÜCK von fünf Befehlen die fünf wiederherstellt. Er schreibt dabei die Namen der Befehle, dann <Message id="everythingRedone" />, sobald nichts mehr wiederherzustellen ist. Er fragt nichts und hat keine Optionen.

Er funktioniert nur direkt nach dem Zurücknehmen. Sonst meldet er <Message id="redoMustFollowUndo" />, und sobald ein anderer Befehl gelaufen ist, auch einer, der nichts ändert wie LISTE oder ZOOM, <Message id="nothingToRedo" />. Ist das Zurücknehmen durch Control Keine von ZURÜCK ausgeschaltet, meldet ZLÖSCH, dass es deaktiviert ist.

<Command id="MREDO" /> stellt Schritt für Schritt wieder her: Er fragt nach einer Anzahl von Aktionen oder <Keyword command="MREDO" id="All" /> oder <Keyword command="MREDO" id="Last" /> und stellt so viele der Schritte wieder her, die die Rücknahmen zurückgenommen haben, was auch Z, ZURÜCK und ZLÖSCH seither ausgeführt haben; Last ist das Ganze der letzten Rücknahme, einmal (<Message id="alreadyRedone" />). Strg+Y und der Eintrag Wiederherstellen des Kontextmenüs führen MZLÖSCH mit 1 aus und brechen den laufenden Befehl ab.

## Missing

Strg+Umschalt+Z stellt ebenfalls wieder her, still, obwohl AutoCAD nichts darauf legt. Die Schaltflächen Rückgängig und Wiederherstellen der oberen Leiste schreiben nichts in den Verlauf, wo die Schnellzugriff-Werkzeugleiste von AutoCAD ihren eigenen schreibt.

## Questions

### Wie lautet das Alias von ZLÖSCH (REDO) in AutoCAD?

Strg+Y, das einen Schritt wiederherstellt (MZLÖSCH 1). ZLÖSCH selbst hat kein Alias: Geben Sie `ZLÖSCH` ein, oder `_REDO` in jeder Sprache von AutoCAD.

### Warum funktioniert ZLÖSCH nicht?

ZLÖSCH macht nur das Z oder ZURÜCK direkt davor rückgängig. Nach jedem anderen Befehl gibt es nichts wiederherzustellen, auch wenn er nichts geändert hat: erst zurücknehmen, dann sofort wiederherstellen.

### Was ist der Unterschied zwischen ZLÖSCH und MZLÖSCH?

ZLÖSCH stellt das Ganze der letzten Rücknahme wieder her, und nur direkt danach. <Command id="MREDO" /> stellt eine Anzahl der zurückgenommenen Schritte einzeln wieder her, oder alle, und funktioniert auch nach einem ZLÖSCH noch.

### Wie wiederholt man den letzten Befehl in AutoCAD?

Drücken Sie die Eingabetaste oder die Leertaste an der Eingabeaufforderung `Befehl:`: Der letzte Befehl startet erneut. ZLÖSCH wiederholt keinen Befehl; er macht eine Rücknahme rückgängig.
