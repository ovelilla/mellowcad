---
title: "Befehl BKS (UCS) in AutoCAD"
description: "Wie BKS (UCS) in AutoCAD das Benutzerkoordinatensystem verschiebt und dreht, Schritt für Schritt: Ursprung, 3 Punkte, Objekt, Ansicht, X, Y, Z."
figure: "Ein Quader aus Südosten gesehen: BKS verschiebt den Ursprung auf seine Oberseite, und ein danach bei 30,20 gezeichneter Kreis liegt auf der Deckfläche, nicht am Boden."
sourceHash: "8ac3b844fe16"
---

BKS (UCS) legt das Benutzerkoordinatensystem fest: einen Ursprung und X- und Y-Achsen an beliebiger Stelle im Raum, sodass seine XY-Ebene auch geneigt sein kann. Die Koordinaten, die Sie eingeben, werden darin gelesen, und was Sie zeichnen, liegt in seiner XY-Ebene: Mit dem Ursprung auf der Oberseite eines Quaders liegt ein Kreis mit dem Mittelpunkt `30,20` auf der Oberseite. Zuerst nennt der Befehl den Namen des aktuellen BKS, `*WORLD*`, `*NO NAME*` oder den Namen, unter dem es gespeichert wurde, und fragt dann nach dem neuen Ursprung oder einer Option; die Eingabetaste kehrt dort zum WKS zurück. Ein Punkt ist der Ursprung, mit seinem Z-Wert; ein Punkt ohne Z-Wert liegt auf der aktuellen Erhebung. Danach folgen ein Punkt auf der positiven X-Achse und ein Punkt auf der XY-Ebene, gelesen im aktuellen BKS: Die Eingabetaste bei einem von beiden behält die Achsen bei. Ein Punkt verschiebt das BKS, drei drehen es beliebig.

Die Befehle arbeiten danach in der XY-Ebene des BKS: <Command id="LINE" /> und <Command id="CIRCLE" /> zeichnen darauf, <Command id="BOX" /> und <Command id="EXTRUDE" /> wachsen davon entlang seiner Z-Achse. Jedes Objekt behält seine eigene Ebene, wenn sich das BKS ändert, und <Command id="PLAN" /> blickt senkrecht auf das aktuelle BKS. Das BKS wird in der Zeichnung gespeichert, und jeder Aufruf ist ein Rückgängig-Schritt. Das 3D von MellowCAD besteht nur aus Volumenkörpern und ist noch unvollständig.

## Options

### Face

So aufgeführt, wie AutoCAD 2027 es aufführt, um das BKS an einer Fläche eines Volumenkörpers auszurichten. MellowCAD fragt nach der Fläche, richtet aber noch nicht daran aus: Jede Auswahl findet keine.

### NAmed

Gespeicherte BKS, nach Namen. <Keyword id="Save" /> speichert das aktuelle und fragt <Keyword id="Yes" /> oder <Keyword id="No" />, bevor es einen bereits gespeicherten Namen ersetzt; <Keyword id="Restore" /> macht ein gespeichertes aktuell, sein Name in beliebiger Groß- und Kleinschreibung eingegeben; <Keyword id="Delete" /> nimmt Namen, mit Kommas und Platzhaltern; <Keyword id="?" /> listet sie auf, jedes mit Ursprung und Achsen. Ein Name darf Leerzeichen enthalten, aber nicht `<>/\":;|,=*?` oder einen Gravis: <Message id="invalidUcsName" />.

### OBject

Richtet das BKS an einem Objekt aus, das Sie auswählen: einer Linie, einem Kreis, Bogen, einer Ellipse, Polylinie, einem Spline, Text, Mehrzeilentext, einer Attributdefinition oder einem Blockverweis. Ursprung und X-Achse liegen dort, wo AutoCAD sie für jede Art setzt, und Z ist die Normale des Objekts, sodass das BKS in der Ebene des Objekts liegt. Ein Objekt auf einem gesperrten Layer kann ausgewählt werden. Bei einer Schraffur erscheint <Message id="ucsNoCoordinateSystem" />, und BKS endet mit dem BKS, wie es war.

### Previous

Geht zum vorherigen BKS zurück, bis zu zehn Schritte in einer Sitzung, darunter benannte und orthogonale. Ist keines mehr übrig: <Message id="noPreviousUcs" />.

### View

Dreht die XY-Ebene senkrecht zu Ihrer Blickrichtung, X entlang der Horizontalen des Bildschirms, bei beibehaltenem Ursprung: Text, der danach gezeichnet wird, liegt in einer 3D-Ansicht flach auf dem Bildschirm.

### World

Zurück zum Weltkoordinatensystem, das sich nie bewegt. Es ist die Vorgabe der ersten Eingabeaufforderung, die Eingabetaste wählt es also dort, und es setzt auch die Erhebung auf 0 zurück.

### X

Dreht das BKS um seine X-Achse: standardmäßig 90 Grad, einen eingegebenen Winkel oder einen Punkt, der ihn vorgibt. Ein positiver Winkel dreht nach der Rechte-Hand-Regel, sodass 90 die XY-Ebene auf der alten X-Achse aufrichtet.

### Y

Dreht das BKS um seine Y-Achse, wie <Keyword id="X" /> um X.

### Z

Dreht das BKS um seine Z-Achse, wie <Keyword id="X" /> um X: 30 dreht X und Y um 30 Grad gegen den Uhrzeigersinn, von oben gesehen.

### ZAxis

Ein neuer Ursprung, wobei die Eingabetaste den aktuellen behält, dann ein Punkt auf der positiven Z-Achse: Die XY-Ebene steht senkrecht dazu, ihre X-Achse bleibt waagerecht zur XY-Ebene des WKS. Zwei Punkte, die identisch sind, ergeben <Message id="pointsAreCoincident" />. Seine Option <Keyword id="Object" /> nimmt eine Linie, einen Bogen, eine offene Polylinie oder einen Spline: der Ursprung am Ende, das der Auswahl am nächsten liegt, Z entlang des Objekts, vom Ursprung wegzeigend.

## Missing

<Keyword id="Face" />, das das BKS an der Fläche eines Volumenkörpers ausrichtet: Es fragt nach einer, findet aber noch keine. Apply und SEction, bei der ersten Eingabeaufforderung aufgeführt und hier abgelehnt, da es einen Ansichtsbereich und keine Schnittobjekte gibt. Der BKS-Dialog (UCSMAN), die Griffe des Symbols und sein Kontextmenü sowie das Symbol, das beim Platzieren das neue BKS zeigt. Das Fadenkreuz, das sich mit dem BKS dreht: Es bleibt auf dem Bildschirm aufrecht, bis <Command id="PLAN" /> die Ansicht danach ausrichtet. UCSFOLLOW, UCSVP und das dynamische BKS. <Keyword id="OBject" /> an einer Bemaßung und Group bei seiner Auswahl. Die Tiefe, die ein orthogonales BKS behält. Die Pause, Press ENTER to continue, in einer langen Liste.

## Questions

### Wie setze ich das BKS in AutoCAD auf WKS zurück?

Starten Sie BKS und drücken Sie die Eingabetaste: <Keyword id="World" /> ist die Vorgabe. Um wieder senkrecht auf die Zeichnung zu blicken, starten Sie <Command id="PLAN" /> und wählen Sie <Keyword command="PLAN" id="World" />.

### Wie drehe ich das BKS?

Starten Sie BKS, wählen Sie <Keyword id="Z" /> und geben Sie den Winkel ein: `30` dreht X und Y um 30 Grad gegen den Uhrzeigersinn. <Keyword id="X" /> und <Keyword id="Y" /> kippen die XY-Ebene auf, standardmäßig um 90 Grad.

### Was ist der Unterschied zwischen BKS und WKS?

Das Weltkoordinatensystem (WKS) bewegt sich nie; das Benutzerkoordinatensystem (BKS) ist das, das Sie verschieben und drehen. Am Anfang sind beide gleich, und BKS meldet das aktuelle als `*WORLD*`. Koordinaten, die Sie eingeben, werden im BKS gelesen, und was Sie zeichnen, liegt in seiner XY-Ebene.

### Wie zeichne ich auf einer Fläche eines 3D-Volumenkörpers?

Verschieben Sie das BKS darauf. Auf der Oberseite eines Quaders genügt sein Ursprung allein: BKS, dann eine Ecke der Oberseite, dann die Eingabetaste, wie in der Sitzung. Für eine Seitenfläche geben Sie drei Punkte an: den Ursprung an einer Ecke, einen Punkt entlang einer Kante für X und einen weiteren auf der Fläche für Y. Zeichnen Sie dann: Was Sie zeichnen, liegt auf der Fläche.
