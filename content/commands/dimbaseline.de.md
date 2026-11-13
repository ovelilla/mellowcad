---
title: "Befehl BEMBASISL (DIMBASELINE) in AutoCAD"
description: "Wie BEMBASISL (DIMBASELINE, Alias BMB) in AutoCAD Bemaßungen von einer Basislinie aus stapelt: nächste Ursprünge, Abstand, Wählen und Zurück."
figure: "Ein gestuftes Profil, 30 von seiner linken Kante bemaßt, dann 70 und 100 von derselben Kante, jede eine Linie weiter außen."
sourceHash: "cd7902f90b59"
---

BEMBASISL (DIMBASELINE) zeichnet Bemaßungen, die alle von einer Maßhilfslinie aus messen, der Basis: Jede verläuft von der ersten Maßhilfslinie der letzten Bemaßung zum nächsten Punkt, den Sie angeben, ihre Maßlinie einen Schritt weiter außen. Er beginnt bei der zuletzt erzeugten linearen oder ausgerichteten Bemaßung, seit die Zeichnung geöffnet wurde, folgt also meist auf <Command id="DIMLINEAR" /> oder <Command id="DIMALIGNED" />; ohne eine fragt er, von welcher er ausgehen soll. Die Befehlszeile meldet jedes Maß, sobald es erzeugt ist. Die Eingabetaste bei der Eingabeaufforderung des Ursprungs wählt <Keyword id="Select" />, und die Eingabetaste dort beendet den Befehl, wie Esc.

Der Schritt ist der Basislinienabstand des aktuellen Bemaßungsstils, in ISO-25 3,75, mal die Gesamtskalierung der Basis. Wie in AutoCAD misst jede neue Bemaßung entlang der Richtung ihrer Basis und übernimmt den Bemaßungsstil und den Layer der Basis, mit der aktuellen Farbe, dem aktuellen Linientyp und der aktuellen Linienstärke.

## Options

### Select

Fragt nach der Basisbemaßung: Wählen Sie eine lineare oder ausgerichtete, nahe der Maßhilfslinie, von der aus gemessen wird. Ein dort eingegebener Punkt wählt ebenfalls. Eine Radius- oder Durchmesserbemaßung wird mit <Message id="associativeDimensionRequired" /> abgelehnt, und die Frage wird erneut gestellt.

### Undo

Nimmt die zuletzt erzeugte Bemaßung zurück und macht bei der vorherigen weiter, so oft, wie es welche gibt. Ist keine mehr übrig, lautet die Meldung <Message id="commandCompletelyUndone" />, und die Eingabeaufforderung bleibt.

## Missing

Eine Bemaßung ist nicht assoziativ: Die Bemaßungen folgen den Objekten, die sie messen, nicht. Eine Winkelbemaßung kann keine Basis sein: AutoCAD nimmt eine zuletzt erzeugte oder gewählte; hier fragt der Befehl, wenn sie zuletzt erzeugt wurde, nach einer Bemaßung, und gewählt wird sie wie eine radiale abgelehnt. Koordinatenbemaßungen gibt es noch nicht.

## Questions

### Wie lautet das Kürzel für BEMBASISL (DIMBASELINE) in AutoCAD?

`BMB`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_DIMBASELINE` in jeder Sprache von AutoCAD.

### Wie ändere ich den Abstand der Basislinienbemaßungen?

Er ist der Basislinienabstand des Bemaßungsstils: <Command id="DIMSTYLE" /> (`D`) öffnet die Stile in der Palette Stile, wo er wie in AutoCAD unter Linien steht. Bereits gezeichnete Bemaßungen behalten ihre Plätze; <Command id="DIMSPACE" /> ordnet sie wieder gleichmäßig an.

### Wie beginne ich bei einer anderen Bemaßung?

Drücken Sie die Eingabetaste bei der ersten Eingabeaufforderung oder wählen Sie <Keyword id="Select" /> und wählen Sie die Bemaßung nahe der Maßhilfslinie, von der aus gemessen wird: Jede neue Bemaßung beginnt dort.

### Was ist der Unterschied zwischen BEMBASISL (DIMBASELINE) und BEMWEITER (DIMCONTINUE)?

BEMBASISL misst jede Bemaßung von derselben Maßhilfslinie aus, jede auf einer Linie weiter außen. <Command id="DIMCONTINUE" /> setzt sie Ende an Ende auf eine Linie, jede von dort, wo die letzte endete.
