---
title: "Befehl BEMWEITER (DIMCONTINUE) in AutoCAD"
description: "So reiht AutoCADs BEMWEITER (DIMCONTINUE, Alias BMWT) Bemaßungen Ende an Ende ab der letzten: nächste Ursprünge, Wählen und Zurück. Gratis im Browser testen."
figure: "Ein gestuftes Profil mit 30 bemaßt, dann mit 40 und 30 auf derselben Linie weitergeführt: zwei Ursprünge, dann zweimal die Eingabetaste."
sourceHash: "11fa474694fd"
---

BEMWEITER (DIMCONTINUE) zeichnet eine Kette von Bemaßungen Ende an Ende: Jede beginnt an der zweiten Maßhilfslinie der vorigen und misst bis zum nächsten Punkt, den Sie angeben, auf derselben Maßlinie. Er führt die zuletzt seit dem Öffnen der Zeichnung erstellte lineare oder ausgerichtete Bemaßung weiter, folgt also meist auf <Command id="DIMLINEAR" /> oder <Command id="DIMALIGNED" />; ohne eine fragt er, welche weitergeführt werden soll. Die Befehlszeile nennt jedes Maß, wenn es erstellt wird. Die Eingabetaste bei der Eingabeaufforderung für den Ursprung wählt <Keyword id="Select" />, und die Eingabetaste dort beendet den Befehl, wie Esc es tut.

Wie in AutoCAD misst jede neue Bemaßung in der Richtung ihrer Basis und übernimmt den Bemaßungsstil und den Layer der Basis, mit der aktuellen Farbe, dem aktuellen Linientyp und der aktuellen Linienstärke.

## Options

### Select

Fragt nach der Bemaßung, von der aus weitergeführt wird: Wählen Sie eine lineare oder ausgerichtete, nahe der Maßhilfslinie, von der aus es weitergehen soll. Auch ein dort getippter Punkt wählt. Eine Radius- oder Durchmesserbemaßung wird mit <Message id="associativeDimensionRequired" /> abgelehnt und die Frage erneut gestellt.

### Undo

Nimmt die letzte Bemaßung der Kette zurück und macht von der davor weiter, so oft, wie es welche gibt. Ist keine mehr da, lautet die Antwort <Message id="commandCompletelyUndone" /> und die Eingabeaufforderung bleibt.

## Missing

Eine Bemaßung ist nicht assoziativ: Eine Kette folgt den Objekten, die sie misst, nicht. Eine Winkelbemaßung lässt sich nicht weiterführen: AutoCAD führt eine zuletzt erstellte oder gewählte weiter; hier fragt der Befehl, wenn sie zuletzt erstellt wurde, nach einer Bemaßung, und eine gewählte wird wie eine Radiale abgelehnt. Ordinatenbemaßungen gibt es noch nicht.

## Questions

### Wie lautet das Kürzel für BEMWEITER (DIMCONTINUE) in AutoCAD?

`BMWT`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_DIMCONTINUE` in jeder Sprache von AutoCAD.

### Was ist der Unterschied zwischen BEMWEITER und BEMBASISLINIE?

BEMWEITER setzt die Bemaßungen Ende an Ende auf eine Linie, jede von dort, wo die letzte endete. <Command id="DIMBASELINE" /> misst sie alle von derselben Maßhilfslinie, jede auf einer weiter außen liegenden Linie.

### Wie führe ich von einer Bemaßung weiter, die nicht die letzte ist?

Drücken Sie bei der ersten Eingabeaufforderung die Eingabetaste, oder wählen Sie <Keyword id="Select" />, und wählen Sie die Bemaßung nahe der Maßhilfslinie, von der aus es weitergehen soll: Die Kette wächst von dort.

### Warum bittet mich BEMWEITER, eine Bemaßung zu wählen?

Er hat keine Bemaßung zum Weiterführen: Seit dem Öffnen der Zeichnung wurde keine lineare oder ausgerichtete erstellt, wie in AutoCAD nach dem Öffnen einer Zeichnung, oder die zuletzt erstellte ist eine Winkelbemaßung. Wählen Sie die, von der aus es weitergehen soll.
