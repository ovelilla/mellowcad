---
title: "Befehl VSAKTUELL (VSCURRENT) in AutoCAD"
description: "So legt AutoCADs VSAKTUELL (VSCURRENT, Alias VSA) den visuellen Stil fest: 2D-Drahtmodell, Hidden und Conceptual, was jeder zeichnet und wie es zurückgeht."
figure: "Ein Block mit einem Loch quer hindurch, von Südosten gesehen: VSCURRENT Conceptual schattiert seine Flächen und zeichnet seine Kanten darüber."
sourceHash: "ddb8f2338e68"
---

VSAKTUELL (VSCURRENT) legt den visuellen Stil fest: wie die Ansicht 3D-Volumenkörper zeichnet. Er fragt nach einem Stil, bietet den aktuellen als Vorgabe an, und die Eingabetaste behält ihn. <Keyword id="2dwireframe" /> zeichnet jede Kante, auch die dahinter; <Keyword id="Hidden" /> blendet aus, was Flächen verdecken; <Keyword id="Conceptual" /> malt die Flächen, schattiert. Der Stil gehört zur Ansicht und wird mit der Zeichnung gespeichert, und jeder Aufruf ist ein Schritt für Rückgängig. Innerhalb eines anderen Befehls lässt er sich nicht verwenden.

Was kein Volumenkörper ist, Linien, Kreise, Regionen, Text, wird unabhängig vom Stil wie in 2D-Drahtmodell in seinen eigenen Farben gezeichnet. In Hidden und Conceptual wählt ein Klick den Volumenkörper, dessen Fläche Ihnen unter dem Cursor am nächsten ist, nie einen durch eine Fläche hindurch, die ihn verdeckt, und die Objektfänge finden weiterhin jede Kante. Ein Volumenkörper auf einem gesperrten Layer zeichnet seine Kanten blasser. MellowCADs 3D besteht nur aus Volumenkörpern und ist noch unvollständig.

## Options

### 2dwireframe

Jede Kante jedes Volumenkörpers, auch die dahinter, mit den Linien, die seine gekrümmten Flächen zeigen; die Vorgabe in einer neuen Zeichnung. Bei der Rückkehr zu ihm von einem anderen Stil meldet VSAKTUELL <Message id="regeneratingModel" />.

### Hidden

Die Kanten jedes Volumenkörpers und die Umrisse seiner gekrümmten Flächen, wo keine Fläche eines Volumenkörpers sie verdeckt, in der Farbe des Objekts: Ein Volumenkörper hinter einem anderen wird von ihm verdeckt. Die Linien, die in 2D-Drahtmodell eine gekrümmte Fläche zeigen, werden nicht gezeichnet.

### Conceptual

Die Ihnen zugewandten Flächen in der Farbe des Objekts gemalt, auf der vom Licht abgewandten Seite ins kühle Blau übergehend, wobei das Licht Ihrem Blickpunkt folgt, und die Kanten von Hidden in einer Farbe darüber gezeichnet, unabhängig vom Objekt. Hier und in Hidden zeigt ein Zylinder oder Kegel in der Draufsicht nur seinen Kreis, wie in AutoCAD.

## Missing

Die anderen Stile von AutoCAD, Drahtmodell, Realistisch, Schattiert, Schattiert mit Kanten, Graustufen, Skizzenhaft und Röntgen, und einen Stil benennen oder sie mit `?` auflisten: Die Eingabeaufforderung listet nur die drei Stile auf, die es gibt, und weist jede andere Antwort ab.

## Questions

### Wie ändere ich den visuellen Stil in AutoCAD?

Starten Sie VSAKTUELL (oder `VSA`) und wählen Sie den Stil: <Keyword id="Hidden" />, um die Kanten dahinter auszublenden, <Keyword id="Conceptual" />, um die Flächen zu schattieren. Es ändert nur die Ansicht, nicht die Objekte.

### Wie gehe ich zurück zu 2D-Drahtmodell?

Starten Sie VSAKTUELL und wählen Sie <Keyword id="2dwireframe" />, sein Buchstabe `2`.

### Was ist der Unterschied zwischen Hidden und Conceptual?

Beide blenden aus, was Flächen verdecken. Hidden zeichnet nur Kanten, auf dem Hintergrund, als Strichzeichnung; Conceptual malt auch die Flächen, vom Licht schattiert, mit denselben Kanten darüber.

### Warum sehe ich noch Linien durch meinen Volumenkörper?

Sie gehören nicht zu einem Volumenkörper. Linien, Kreise und Regionen werden in jedem Stil wie in 2D-Drahtmodell gezeichnet, sodass eine Linie hinter einem Quader weiter zu sehen ist. In <Keyword id="2dwireframe" /> sind auch die eigenen Kanten des Volumenkörpers dahinter zu sehen: Wählen Sie <Keyword id="Hidden" />.
