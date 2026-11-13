---
title: "Befehl KLICKZIEHEN (PRESSPULL) in AutoCAD"
description: "Wie KLICKZIEHEN (PRESSPULL) in AutoCAD drückt oder zieht, was Sie anklicken: ein geschlossenes Objekt, ein Bereich in Objekten, eine Fläche."
figure: "Der Bereich zwischen einem Rechteck und einem Kreis um 8 nach unten gedrückt: eine Platte mit Loch, von Südosten im visuellen Stil Verdeckt gesehen."
sourceHash: "b806d59060e1"
---

KLICKZIEHEN (PRESSPULL) extrudiert, was Sie anklicken: ein geschlossenes Objekt, einen Bereich, den Objekte um den Klick schließen, oder eine ebene Fläche eines 3D-Volumenkörpers. Klicken Sie, geben Sie dann die Höhe ein oder bewegen Sie den Cursor und klicken Sie: Eine positive Höhe zieht, eine negative drückt. Ein geschlossenes Objekt oder ein Bereich wird ein neuer Volumenkörper, den auch <Command id="EXTRUDE" /> erzeugen würde, und die Objekte bleiben; die Inseln eines Bereichs sind Löcher darin, wie in der Sitzung. Eine Fläche fügt ihr Prisma ihrem Volumenkörper hinzu oder nimmt es heraus: Die gezogene Oberseite eines Quaders macht ihn höher. Die Eingabeaufforderung kommt für den nächsten Klick wieder, bis die Eingabetaste gedrückt wird, und der ganze Durchlauf ist ein Schritt, den Rückgängig zurücknimmt.

Halten Sie Strg gedrückt, und die Fläche, die ein Klick nähme, leuchtet auf; Strg+Klick versetzt stattdessen diese Fläche, ihre Nachbarn werden bis zu ihr weitergeführt, sodass eine geneigte Seite ihre Neigung behält. Wie in AutoCAD arbeitet KLICKZIEHEN mit Klicks: Eine Zahl oder ein Punkt, die bei der ersten Eingabeaufforderung eingegeben werden, werden mit <Message id="presspullClick" /> beantwortet, und es wird erneut gefragt.

## Options

### Multiple

Bei der Eingabeaufforderung der Höhe oder des Versatzabstands: Klicken Sie weiter, um mehr hinzuzufügen — geschlossene Objekte und Bereiche oder Flächen eines Volumenkörpers —, und drücken Sie dann die Eingabetaste; eine Höhe gilt für alle. Eine nach einem Objekt oder einem Bereich angeklickte Fläche wird herausgefiltert.

## Missing

Eine gekrümmte Fläche, die AutoCAD ebenfalls versetzt: Hier findet der Klick keine Fläche. Ein Versatz, dessen Nachbarflächen Kegel, Kugeln oder Tori sind, oder Ebenen und gekrümmte Flächen zusammen, oder der eine Fläche durch die gegenüberliegende drücken würde: Der Volumenkörper bleibt, wie er war. Die Bereiche, die IMPRINT und IMPLIEDFACE auf einer Fläche erzeugen, und Strg+Umschalttaste+E. Ein offenes Objekt, das AutoCAD zu einer Fläche extrudiert: Es gibt noch keine Flächen. Beim Ziehen zeigt die Vorschau das Prisma der Fläche oder den neuen Volumenkörper, nicht den Volumenkörper, wie er wird, und eine Fläche leuchtet nur mit Strg auf. Ein Bereich, der außerhalb der Ebene des BKS begrenzt ist, ist ungetestet.

## Questions

### Was ist der Unterschied zwischen KLICKZIEHEN (PRESSPULL) und EXTRUSION (EXTRUDE)?

<Command id="EXTRUDE" /> nimmt geschlossene Objekte, die Sie auswählen, löscht sie, wie DELOBJ es vorgibt, und bietet eine Richtung, eine Verjüngung und einen Ausdruck. KLICKZIEHEN nimmt Klicks — ein geschlossenes Objekt, den Bereich in mehreren Objekten oder eine Fläche eines Volumenkörpers, die es diesem hinzufügt oder davon abschneidet — und behält die Objekte. Aus einem Objekt erzeugen beide denselben Volumenkörper.

### Wie extrudiere ich eine Fläche eines Volumenkörpers?

Starten Sie KLICKZIEHEN, klicken Sie die Fläche an und geben Sie den Abstand an: Ein positiver zieht sie heraus, und der Volumenkörper wächst, ein negativer drückt sie hinein. Halten Sie beim Klicken Strg gedrückt, um die Fläche stattdessen zu versetzen. Bisher nur ebene Flächen.

### Warum funktioniert KLICKZIEHEN nicht?

Es braucht einen Klick auf etwas Geschlossenes. KLICKZIEHEN beantwortet eine Zahl oder einen Punkt, die bei der ersten Eingabeaufforderung eingegeben werden, und einen Klick auf ein offenes Objekt oder eine gekrümmte Fläche mit <Message id="presspullClick" /> und fragt erneut. Klicken Sie auf ein geschlossenes Objekt, in einen Bereich, den Objekte in der Draufsicht schließen, oder auf eine ebene Fläche eines Volumenkörpers.

### Gibt es ein Kürzel für KLICKZIEHEN (PRESSPULL)?

Es hat keinen Alias: Geben Sie KLICKZIEHEN ein, oder `_PRESSPULL` in jeder Sprache von AutoCAD. Strg+Umschalttaste+E, die Taste von AutoCAD dafür, ist noch nicht gebaut.
