---
title: "Befehl BEMSTIL (DIMSTYLE) in AutoCAD"
description: "Wie BEMSTIL (DIMSTYLE, Alias BMS) in AutoCAD funktioniert: Bemaßungsstile ab ISO-25, Neu, Aktuell und Einstellungen für Texthöhe, Pfeile, Skala und Einheiten."
figure: "Bemaßungen im aktuellen Stil ISO-25 gezeichnet: Pfeile, der Text über der Linie und ein Komma als Dezimaltrennzeichen."
sourceHash: "7bcae870d3ae"
---

BEMSTIL (DIMSTYLE) verwaltet die Bemaßungsstile der Zeichnung: benannte Gruppen von Einstellungen, Pfeilgröße, Texthöhe, Gesamtskalierung, Einheiten und den Rest, die jede Bemaßung von ihrem Stil übernimmt. Eine neue Zeichnung beginnt mit ISO-25 als aktuellem Stil, dem metrischen Stil, mit dem AutoCAD beginnt. BEMSTIL öffnet den Bemaßungsstil-Manager, wie in AutoCAD; mit Apostroph innerhalb eines Befehls eingegeben, `'BEMSTIL`, öffnet er sich, ohne diesen Befehl zu beenden.

Der Manager nennt den aktuellen Stil und listet die Stile auf, alle oder nur die verwendeten. Als aktuell einstellen macht den gewählten Stil aktuell. Neu... fragt nach einem Namen, `Kopie von` und dem Stil, mit dem er beginnt, und öffnet dann die Einstellungen des neuen Stils; er ist aktuell, sobald der Manager geschlossen wird. Ändern... öffnet die Einstellungen des gewählten Stils auf den Registerkarten des Managers: Linien (Basislinienabstand, Überstand über die Maßlinie, Abstand vom Ursprung), Symbole und Pfeile (Pfeilgröße, Zentrumspunkte), Text (Texthöhe, Abstand von der Maßlinie), Anpassen (die Gesamtskalierung und ob zwischen den Maßhilfslinien eine Maßlinie gezeichnet wird) und Primäreinheiten (Genauigkeit, Dezimaltrennzeichen, nachgestellte Nullen, Winkelgenauigkeit). OK übernimmt sie, und jede Bemaßung in diesem Stil wird sofort neu gezeichnet. Ein Rechtsklick auf einen Stil benennt ihn um oder löscht ihn; ein bereits verwendeter Name wird abgelehnt, und ISO-25, der aktuelle Stil und ein verwendeter Stil können nicht gelöscht werden. Alles, was im Manager geschieht, ist ein Schritt, den <Command id="U" /> zurücknimmt.

## Missing

Die Vorschau des Managers, Beschreibung, Überschreiben und Vergleichen, keine Unterstile für eine Art von Bemaßung, keine Alternativeinheiten oder Toleranzen und nur die oben aufgeführten Einstellungen. Eine in der Befehlszeile eingegebene Bemaßungsvariable, etwa DIMSCALE, erzeugt keine Überschreibung des aktuellen Stils. Eine neue Zeichnung hat nur ISO-25, ohne die Stile Standard und Annotative, die eine neue metrische Zeichnung in AutoCAD ebenfalls enthält.

## Questions

### Wie lautet das Kürzel für BEMSTIL (DIMSTYLE) in AutoCAD?

`BMS`, dann die Eingabetaste oder die Leertaste; ebenso `BEM`, `DIMSTY` und `DDIM`, und `_DIMSTYLE` in jeder Sprache von AutoCAD. <Command id="-DIMSTYLE" /> funktioniert stattdessen in der Befehlszeile: Er speichert die aktuellen Einstellungen als neuen Stil oder macht einen Stil per Namen aktuell.

### Wie ändere ich die Größe des Bemaßungstexts in AutoCAD?

Wählen Sie den Stil im Manager, drücken Sie Ändern... und ändern Sie Texthöhe auf der Registerkarte Text oder Globaler Skalierfaktor auf der Registerkarte Anpassen, der jede Größe des Stils, auch Pfeile und Abstände, mit dem Text multipliziert. Jede Bemaßung in diesem Stil wird sofort neu gezeichnet. Um nur einige Bemaßungen zu ändern, geben Sie ihnen einen eigenen Stil.

### Wie weise ich vorhandenen Bemaßungen einen Bemaßungsstil zu?

Wählen Sie die Bemaßungen und wählen Sie den Stil in der Zeile Bemaßungsstil der Eigenschaftenpalette, oder klicken Sie mit der rechten Maustaste darauf und wählen Sie ihn unter Bemaßungsstil: in beiden Fällen ein Rückgängig-Schritt. Neue Bemaßungen übernehmen den aktuellen Stil, den Als aktuell einstellen im Manager ändert.

### Wie ändere ich das Dezimaltrennzeichen der Bemaßungen?

ISO-25 schreibt ein Komma, etwa `82,5`. Setzen Sie auf der Registerkarte Primäreinheiten das Dezimaltrennzeichen auf einen Punkt oder ein Leerzeichen; Genauigkeit und Nachgestellte Nullen unterdrücken finden sich dort ebenfalls. Die Befehlszeile meldet das Maß weiterhin mit einem Punkt, wie die von AutoCAD.

### Wie erstelle ich einen neuen Bemaßungsstil?

Drücken Sie Neu..., geben Sie einen Namen ein und wählen Sie den Stil, mit dem er beginnt, dann Weiter: Seine Einstellungen öffnen sich, und OK erstellt ihn. Er ist aktuell, sobald der Manager geschlossen wird, und jede danach gezeichnete Bemaßung übernimmt ihn.
