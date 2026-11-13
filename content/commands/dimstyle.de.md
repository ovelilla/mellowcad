---
title: "Befehl BEMSTIL (DIMSTYLE) in AutoCAD"
description: "Wie BEMSTIL (DIMSTYLE, Alias BMS) in AutoCAD funktioniert: Bemaßungsstile ab ISO-25, Neu, Aktuell und Einstellungen für Texthöhe, Pfeile, Skala und Einheiten."
figure: "Bemaßungen im aktuellen Stil ISO-25 gezeichnet: Pfeile, der Text über der Linie und ein Komma als Dezimaltrennzeichen."
sourceHash: "a363c0740c11"
---

BEMSTIL (DIMSTYLE) verwaltet die Bemaßungsstile der Zeichnung: benannte Gruppen von Einstellungen, Pfeilgröße, Texthöhe, Gesamtskalierung, Einheiten und den Rest, die jede Bemaßung von ihrem Stil übernimmt. Eine neue Zeichnung beginnt mit ISO-25 als aktuellem Stil, dem metrischen Stil, mit dem AutoCAD beginnt. Wo AutoCAD das Dialogfeld Bemaßungsstil-Manager öffnet, öffnet BEMSTIL hier die Bemaßungstabelle der Palette Stile, eine Registerkarte des Palettenbereichs, die beim Zeichnen geöffnet bleibt; <Command id="STYLE" /> öffnet dieselbe Palette bei ihren Textstilen.

Die Palette listet die Stile auf, der aktuelle ist markiert. Neu erstellt eine Kopie des gewählten Stils, nach ihm benannt, und macht sie aktuell; ein Stil wird in der Liste umbenannt, und ein bereits verwendeter Name wird abgelehnt. ISO-25, der aktuelle Stil und ein verwendeter Stil können nicht gelöscht werden. Unter der Liste sind die Einstellungen des gewählten Stils unter den Namen der Registerkarten des Managers gruppiert: Linien (Basislinienabstand, Überstand über die Maßlinie, Abstand vom Ursprung), Symbole und Pfeile (Pfeilgröße, Größe der Mittelpunktmarkierung), Text (Texthöhe, Abstand von der Maßlinie), Einpassen (die Gesamtskalierung und ob zwischen den Maßhilfslinien eine Maßlinie gezeichnet wird) und Primäreinheiten (Genauigkeit, Dezimaltrennzeichen, nachgestellte Nullen, Winkelgenauigkeit). Eine Änderung zeichnet jede Bemaßung in diesem Stil sofort neu. Jede Änderung und jeder neue Stil, jede Umbenennung, Löschung und Änderung des aktuellen Stils ist ein Schritt, den <Command id="U" /> zurücknimmt.

## Missing

Das Dialogfeld Bemaßungsstil-Manager selbst: Die Palette hat keine Vorschau, keinen Listenfilter, kein Überschreiben, Vergleichen oder Beschreibung, keine Unterstile für eine Art von Bemaßung, keine Alternativeinheiten oder Toleranzen und nur die oben aufgeführten Einstellungen. Eine in der Befehlszeile eingegebene Bemaßungsvariable, etwa DIMSCALE, erzeugt keine Überschreibung des aktuellen Stils. Eine neue Zeichnung hat nur ISO-25, ohne die Stile Standard und Annotative, die eine neue metrische Zeichnung in AutoCAD ebenfalls enthält.

## Questions

### Wie lautet das Kürzel für BEMSTIL (DIMSTYLE) in AutoCAD?

`BMS`, dann die Eingabetaste oder die Leertaste; ebenso `BEM`, `DIMSTY` und `DDIM`, und `_DIMSTYLE` in jeder Sprache von AutoCAD. <Command id="-DIMSTYLE" /> funktioniert stattdessen in der Befehlszeile: Er speichert die aktuellen Einstellungen als neuen Stil oder macht einen Stil per Namen aktuell.

### Wie ändere ich die Größe des Bemaßungstexts in AutoCAD?

Wählen Sie den Stil in der Palette und ändern Sie Texthöhe unter Text oder Gesamtskalierung verwenden unter Einpassen, die jede Größe des Stils, auch Pfeile und Abstände, mit dem Text multipliziert. Jede Bemaßung in diesem Stil wird sofort neu gezeichnet. Um nur einige Bemaßungen zu ändern, geben Sie ihnen einen eigenen Stil.

### Wie weise ich vorhandenen Bemaßungen einen Bemaßungsstil zu?

Wählen Sie die Bemaßungen und wählen Sie den Stil in der Zeile Bemaßungsstil der Eigenschaftenpalette, oder klicken Sie mit der rechten Maustaste darauf und wählen Sie ihn unter Bemaßungsstil: in beiden Fällen ein Rückgängig-Schritt. Neue Bemaßungen übernehmen den aktuellen Stil, den Aktuell setzen in der Palette ändert.

### Wie ändere ich das Dezimaltrennzeichen der Bemaßungen?

ISO-25 schreibt ein Komma, etwa `82,5`. Setzen Sie unter Primäreinheiten das Dezimaltrennzeichen auf einen Punkt oder ein Leerzeichen; Genauigkeit und Nachgestellte Nullen unterdrücken finden sich dort ebenfalls. Die Befehlszeile meldet das Maß weiterhin mit einem Punkt, wie die von AutoCAD.

### Wie erstelle ich einen neuen Bemaßungsstil?

Wählen Sie den Stil, von dem Sie ausgehen, und drücken Sie Neu: Die Kopie wird nach ihm benannt, aktuell gesetzt und kann umbenannt und geändert werden. Jede danach gezeichnete Bemaßung übernimmt ihn.
