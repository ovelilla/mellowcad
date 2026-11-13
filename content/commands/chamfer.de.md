---
title: "Befehl FASE (CHAMFER) in AutoCAD"
description: "So arbeitet AutoCADs FASE (CHAMFER, Alias FA): zwei Abstände, zwei Linien oder die Ecken einer Polylinie, Mehrfach, Umschalttaste. Gratis im Browser testen."
figure: "Vier Linien, dann Abstand 10 für beide und Mehrfach: zwei Ecken angefast, zwei bleiben scharf."
sourceHash: "e43c5b72ffc8"
---

FASE (CHAMFER) schneidet die Ecke zwischen zwei Linien mit einer geraden Schräge ab. Wählen Sie die erste Linie, dann die zweite: Jede wird bis zur Schräge gestutzt oder gedehnt, die erste um den ersten Abstand und die zweite um den zweiten, und die Schräge verbindet sie. Er arbeitet mit zwei Linien, mit zwei geraden Segmenten einer Polylinie oder mit einer Linie und einer Polylinie, die er zu einer Polylinie verbindet. Wie in AutoCAD meldet seine erste Zeile die aktuellen Abstände, die in der Zeichnung gespeichert sind; beide 0, die Vorgabe, ergibt eine scharfe Ecke, die Linien treffen sich. Während Sie die zweite Linie wählen, wird die Ecke, die sie ergäbe, über den Linien gezeigt.

## Options

### Undo

Nimmt die letzte Fase dieses Durchlaufs zurück, und eine Änderung der Abstände mit ihr.

### Polyline

Fragt nach einer 2D-Polylinie und fast jede ihrer Ecken an, und meldet dann, wie viele Linien angefast wurden und warum einige nicht.

### Distance

Fragt nach dem ersten und dem zweiten Fasenabstand. Der zweite bietet den ersten an, sodass die Eingabetaste dort die Schräge gleichmäßig macht, bei einer rechtwinkligen Ecke unter 45 Grad.

### Multiple

Fragt nach jeder Fase weiter nach einer ersten Linie, bis zur Eingabetaste oder Esc.

## Missing

Winkel, der die Schräge durch einen Abstand und einen Winkel festlegt, Methode und Stutzen: FASE arbeitet immer mit zwei Abständen und stutzt die Linien immer. Die Schräge übernimmt in AutoCAD den Linientypfaktor der zweiten Linie, hier nicht.

## Questions

### Wie lautet das Kürzel für FASE (CHAMFER) in AutoCAD?

`FA`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_CHAMFER` in jeder Sprache von AutoCAD.

### Wie mache ich in AutoCAD eine Fase von 45 Grad?

Wählen Sie <Keyword id="Distance" />, geben Sie den Abstand ein und drücken Sie beim zweiten die Eingabetaste: Bei einer rechtwinkligen Ecke ergeben zwei gleiche Abstände eine Schräge von 45 Grad.

### Was ist der Unterschied zwischen FASE und ABRUNDEN?

FASE verbindet zwei Linien mit einer geraden Schräge; <Command id="FILLET" /> mit einem Bogen, der beide tangential berührt. Beide stutzen oder dehnen die Linien bis dorthin, und beide machen bei 0 oder mit gedrückter Umschalttaste bei der zweiten Linie eine scharfe Ecke.

### Warum funktioniert FASE nicht?

Er nennt den Grund: <Message id="chamferDistanceTooLarge" />, wenn ein Abstand über das Ende seiner Linie hinausreicht, <Message id="linesParallel" /> bei parallelen Linien und <Message id="chamferRequiresLines" /> bei einem Bogen oder Kreis. Mit beiden Abständen 0 macht er eine Ecke, keine Schräge.

### Wie fase ich jede Ecke eines Rechtecks an?

Ein Rechteck ist eine Polylinie: Wählen Sie <Keyword id="Polyline" /> und wählen Sie es, und jede Ecke wird mit den aktuellen Abständen angefast.
