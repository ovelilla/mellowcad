---
title: "Befehl STUTZEN (TRIM) in AutoCAD"
description: "Wie STUTZEN (TRIM, Alias SU) in AutoCAD funktioniert, Schritt für Schritt: Modi Schnell und Standard, Schnittkanten, Zaun, Kreuzen und Umschalttaste zum Dehnen."
figure: "Eine Linie, bis zu den beiden Linien zurückgestutzt, die sie kreuzen: jedes Ende einmal gewählt, im Modus Schnell."
sourceHash: "fcbf44618cf3"
---

STUTZEN (TRIM) schneidet ein Objekt bis dorthin zurück, wo andere Objekte es kreuzen: Sie wählen das Stück, das weg soll, und es verschwindet bis zum nächsten Schnittpunkt auf jeder Seite. Er beginnt im Modus Schnell, wie der von AutoCAD: Jedes Objekt ist eine Schnittkante, und ein Objekt, das nichts kreuzt, wird ganz gelöscht. Halten Sie beim Wählen die Umschalttaste gedrückt, dehnt er das Objekt stattdessen bis zur nächsten Kante, wie es <Command id="EXTEND" /> tut. Jede Wahl ist ein Schritt, den Rückgängig zurücknimmt; die Eingabetaste beendet den Befehl.

## Options

### cuTting

Wählt, welche Objekte schneiden: Wählen Sie sie, oder drücken Sie die Eingabetaste, um jedes Objekt zu nehmen. Von da an schneiden nur diese, in jedem Modus, bis der Befehl endet.

### Fence

Fragt nach den Punkten einer Linie, beliebig viele bis zur Eingabetaste: Jedes Objekt, das sie kreuzt, wird dort gestutzt, wo sie es kreuzt, in einem Schritt. Der Modus Standard listet ihn auf; der Modus Schnell nimmt ihn ebenfalls an, und eine Wahl ins Leere beginnt dort von selbst einen Zaun aus zwei Punkten.

### Crossing

Fragt nach den beiden Ecken eines Fensters: Alles, was sein Umriss kreuzt, wird gestutzt, in einem Schritt. Ein Objekt ganz innerhalb des Fensters ist keines, das es kreuzt.

### mOde

Schaltet zwischen <Keyword id="Quick" /> und <Keyword id="Standard" /> um. Im Modus Standard fragt STUTZEN zuerst nach den Schnittkanten (die Eingabetaste nimmt alle), lässt ein Objekt, das keine Kante kreuzt, mit <Message id="doesNotIntersectCuttingEdge" /> unverändert, listet Fence und Edge auf, und eine Wahl ins Leere beginnt ein Kreuzen-Fenster. Der Modus gilt für STUTZEN und DEHNEN zugleich und hält für die Sitzung.

### Edge

Nur im Modus Standard. Mit <Keyword id="Extend" /> schneidet eine Kante auch dort, wo sie kreuzen würde, wenn sie verlängert wäre, eine Linie in beide Richtungen, ein Bogen auf seinem Kreis; <Keyword id="No extend" /> ist die Vorgabe.

### eRase

Löscht Objekte, ohne den Befehl zu verlassen: Wählen Sie sie, dann löscht die Eingabetaste sie, als ein Schritt von STUTZEN, den Rückgängig zurücknehmen kann.

### Undo

Aufgeführt, sobald die Eingabeaufforderung eine Antwort hatte, eine Wahl, einen Zaun, ein Fenster: nimmt das letzte Stutzen zurück und meldet, wenn nichts mehr zurückzunehmen ist, genau das.

## Missing

Projizieren: Die Projektionsoption von AutoCAD (Keine, BKS, Ansicht) wird nicht angeboten, und alles wird auf die XY-Ebene des BKS projiziert berechnet, was AutoCADs Vorgabe BKS ist. Ein Zaun lässt sich noch nicht mit dem Fadenkreuz ziehen, nur Punkt für Punkt wählen. Der Stutzmodus und die Wahl von Kante gelten für die Sitzung, während AutoCAD sie von einer Sitzung zur nächsten behält. Ein Objekt, das schräg zum BKS liegt, ein Spline ausgenommen, schneidet weder, noch wird es gestutzt.

## Questions

### Wie lautet das Alias von STUTZEN in AutoCAD?

`SU`, dann die Eingabetaste oder die Leertaste. `TR` des englischen AutoCAD gibt es in der deutschen Version nicht. Der volle Name funktioniert ebenfalls, und `_TRIM` in jeder Sprache von AutoCAD.

### Warum löscht STUTZEN die ganze Linie?

Weil STUTZEN im Modus Schnell ist, AutoCADs Vorgabe seit der Version 2021: Eine Wahl auf einem Objekt, das keine Kante kreuzt, löscht es. Wählen Sie <Keyword id="mOde" /> und dann <Keyword id="Standard" />, damit STUTZEN es stehen lässt und das meldet.

### Wie stutzt man viele Linien auf einmal?

Wählen Sie an einer leeren Stelle und geben Sie einen zweiten Punkt an: Jedes Objekt, das dieser Zaun kreuzt, wird in einem Schritt gestutzt. Oder wählen Sie <Keyword id="Crossing" /> und ziehen Sie ein Fenster über die zu entfernenden Stücke.

### Wie verlängert man eine Linie mit STUTZEN?

Halten Sie beim Wählen der Linie nahe dem zu dehnenden Ende die Umschalttaste gedrückt: Sie wächst bis zur nächsten Kante, wie bei <Command id="EXTEND" />, und die nächste Wahl ohne Umschalttaste stutzt wieder.
