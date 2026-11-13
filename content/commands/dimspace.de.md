---
title: "Befehl BEMPLATZ (DIMSPACE) in AutoCAD"
description: "Wie BEMPLATZ (DIMSPACE) in AutoCAD den Abstand zwischen Bemaßungen angleicht oder sie auf 0 ausrichtet, mit Automatisch aus der Texthöhe. Kostenlos im Browser."
before: "Die Oberkante einer Platte in einer Kette von drei Bemaßungen bemaßt, jede in einer eigenen Höhe platziert, wie sie gezeichnet wurden."
figure: "BEMPLATZ von der ersten Bemaßung aus, die anderen zwei gewählt und der Abstand 0: die Kette auf einer Linie ausgerichtet."
sourceHash: "7ec7c0eb9883"
---

BEMPLATZ (DIMSPACE) passt den Abstand zwischen parallelen linearen und ausgerichteten Bemaßungen an. Sie wählen die Basisbemaßung, die bleibt, wo sie ist, dann die Bemaßungen, deren Abstand angepasst wird; die Eingabetaste beendet die Auswahl und fragt nach dem Abstand. Die Linie jeder Bemaßung wird dann verschoben, von der Basis weg in der Reihenfolge, in der sie liegen, in diesem Abstand von der davor. Ein Abstand von 0 richtet alle auf der Linie der Basis aus: Eine Kette, die so versetzt ist, wie sie gezeichnet wurde, liest sich dann wie eine. Seine einzige Änderung ist die Lage der Maßlinien, in einem Schritt, den <Command id="U" /> zurücknimmt.

Die Basis wird gewählt oder als Punkt eingegeben oder mit `Last` genommen; eine, die keine Bemaßung ist, ergibt <Message id="selectedObjectNotDimension" />, und es wird erneut gefragt. Eine vor dem Befehl gewählte Menge ist die Menge, deren Abstand angepasst wird. Eine Bemaßung in einem Winkel zur Basis wird gezählt und bleibt, wo sie ist, und ein negativer Abstand wird mit <Message id="negativeSpacing" /> abgelehnt.

## Options

### Auto

Die Vorgabe, die Eingabetaste: ein Abstand vom Doppelten der Texthöhe des Bemaßungsstils der Basis, mit seiner Gesamtskalierung skaliert, sodass der Stapel zu seinem eigenen Text passt.

## Missing

Winkelbemaßungen, deren Abstand BEMPLATZ noch nicht anpasst. AutoCAD verschiebt eine Bemaßung nur dort, wo es nötig ist; hier wird jede gewählte Bemaßung neu angeordnet.

## Questions

### Wie richte ich Bemaßungen in AutoCAD aus?

Starten Sie BEMPLATZ, wählen Sie die Bemaßung, an der sich die anderen ausrichten sollen, wählen Sie sie aus, drücken Sie die Eingabetaste und geben Sie `0` ein: Jede Maßlinie wandert auf die der Basis.

### Wie erzeuge ich gleiche Abstände zwischen Bemaßungen?

Starten Sie BEMPLATZ, wählen Sie die Bemaßung nahe dem Objekt als Basis, wählen Sie den Rest und drücken Sie zweimal die Eingabetaste: <Keyword id="Auto" /> ordnet sie im Abstand der doppelten Texthöhe an. Oder geben Sie den gewünschten Abstand ein, etwa `8`.

### Wie groß ist der Standardabstand von Bemaßungen in AutoCAD?

<Keyword id="Auto" /> von BEMPLATZ ist die doppelte Texthöhe des Bemaßungsstils. <Command id="DIMBASELINE" /> verwendet stattdessen den Basislinienabstand des Stils, in ISO-25 3,75, für jede Bemaßung, die es hinzufügt.

### Warum verschiebt BEMPLATZ eine Bemaßung nicht?

Es ordnet nur Bemaßungen parallel zur Basis an: Eine in einem anderen Winkel wird gezählt und bleibt, wo sie ist. Winkelbemaßungen werden noch nicht angeordnet.
