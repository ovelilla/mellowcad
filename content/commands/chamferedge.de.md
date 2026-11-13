---
title: "Befehl GEFASTEKANTE (CHAMFEREDGE) in AutoCAD"
description: "Wie GEFASTEKANTE (CHAMFEREDGE) in AutoCAD die Kanten eines 3D-Volumenkörpers fast, Schritt für Schritt: Kanten einer Fläche, Schleife, Abstand 1 und 2."
figure: "Ein Quader aus Südosten gesehen: GEFASTEKANTE mit beiden Abständen 6 fast die zwei oberen Kanten an seiner vorderen Ecke, die sich in einer Linie treffen."
sourceHash: "43b1908ad4b3"
---

GEFASTEKANTE (CHAMFEREDGE) fast die Kanten eines 3D-Volumenkörpers. Der Befehl meldet die zwei aktuellen Abstände und fragt dann nach einer Kante und, nach der ersten, nach weiteren auf derselben Fläche, bis zur Eingabetaste: Ein Klick nimmt die Kante unter dem Cursor, ein eingegebener Punkt die Kante, die durch ihn verläuft. Eine Kante, mit der die ersten keine Fläche teilen, ergibt <Message id="edgesOneFace" />, eine eines anderen Volumenkörpers <Message id="chamferMultipleBodies" />. Während Kanten gewählt werden, wird der Volumenkörper so gezeichnet, wie er wird. Die Eingabetaste bittet dann, zur Annahme erneut die Eingabetaste zu drücken oder die Abstände für diese Fase zu ändern; diese Eingabe erzeugt sie.

Der erste Abstand verläuft entlang der Fläche, die die Kanten teilen; bei einer einzelnen Kante entlang der Fläche, die AutoCAD nimmt: der vorderen bei der oberen vorderen Kante eines Quaders und der oberen beim Rand eines Zylinders. Eine gerade Kante zwischen zwei ebenen Flächen wird zu einem ebenen Streifen, die runde Kante eines Lochs oder eines Rands zu einem Streifen eines Kegels, und Fasen, die an einer Ecke zusammentreffen, werden in einer Linie verbunden. Die Abstände werden beim nächsten Mal wieder angeboten. Der Volumenkörper behält seinen Layer und seine Eigenschaften, verliert aber, woraus er entstand: Ein Quader ist kein Quader mehr. Der ganze Befehl ist ein Rückgängig-Schritt. Das 3D von MellowCAD besteht nur aus Volumenkörpern und ist noch unvollständig.

## Options

### Loop

Nimmt jede Kante rund um eine Fläche: Wählen Sie eine Kante, dann <Keyword id="Accept" /> für die gezeigte Schleife oder <Keyword id="Next" /> für die Schleife der anderen Fläche, zu der die Kante gehört. <Keyword id="Edge" /> geht zu einzelnen Kanten zurück.

### Distance

Fragt nach dem ersten Abstand, dann nach dem zweiten, jeweils eingegeben oder als Abstand zwischen zwei Punkten; 0 oder weniger ergibt <Message id="distanceTooSmall" />. <Keyword id="Expression" /> nimmt einen als Formel. Bei der Eingabeaufforderung zur Annahme fragt er nach dem Abstand der Basisfläche und dem der anderen Fläche, nur für diese Fase.

## Missing

Eine Ecke, an der drei gefaste Kanten zusammentreffen. Eine gerade Kante neben einer gekrümmten Fläche, eine runde Kante abseits der Achse ihres Zylinders und jede Kante einer Kugel, eines Torus, eines Extrusionskörpers oder eines Rotationskörpers: Hier schlagen sie mit einem Modellierungsfehler fehl. Die zwei Pfeilgriffe, die AutoCAD bei der Eingabeaufforderung zur Annahme zeigt, einer je Abstand. <Command id="CHAMFER" />, das die Kante eines Volumenkörpers wählt, was AutoCAD ebenfalls erlaubt. Die Fase als Netz gezeichnet, während Sie wählen, und Flächen.

## Questions

### Wie fase ich eine Kante eines 3D-Volumenkörpers in AutoCAD?

Starten Sie GEFASTEKANTE, wählen Sie <Keyword id="Distance" /> und geben Sie beide Abstände an, wählen Sie die Kanten einer Fläche und drücken Sie dann zweimal die Eingabetaste: einmal, um die Auswahl zu beenden, einmal zur Annahme. Die `6` und `6` der Sitzung fasen zwei obere Kanten eines Quaders.

### Warum meldet GEFASTEKANTE, dass die Kanten zu einer Fläche gehören müssen?

Die Kanten einer Fase teilen eine Fläche: Der erste Abstand verläuft entlang dieser Fläche. Fasen Sie die Kanten einer anderen Fläche in einem zweiten Durchlauf.

### Warum funktioniert FASE (CHAMFER) nicht an einem 3D-Volumenkörper?

<Command id="CHAMFER" /> von AutoCAD fast auch die Kante eines Volumenkörpers an, das von MellowCAD aber noch nicht: Verwenden Sie GEFASTEKANTE und, um eine Kante abzurunden, <Command id="FILLETEDGE" />.

### Wie fase ich die Kante eines Lochs?

Wählen Sie seine runde Kante dort, wo sie auf die ebene Fläche trifft: Die Fase ist ein Streifen eines Kegels um das Loch.
