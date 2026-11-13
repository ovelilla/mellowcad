---
title: "Befehl DRSICHT (PLAN) in AutoCAD"
description: "Wie DRSICHT (PLAN) in AutoCAD senkrecht auf das aktuelle BKS blickt, auf ein gespeichertes oder das WKS: Aktuelles BKS, BKS, Welt, und zurück zur Draufsicht."
figure: "Der gestufte Block von Südwesten gesehen, sein BKS um 30 Grad um Z gedreht: DRSICHT und die Eingabetaste blicken senkrecht auf dieses BKS, seine X-Achse nach rechts, der Block erscheint also gedreht."
sourceHash: "50d157803309"
---

DRSICHT (PLAN) blickt senkrecht auf die XY-Ebene eines BKS, seine X-Achse nach rechts gerichtet: die Draufsicht, wie Sie sie gezeichnet haben. Der Befehl fragt, welches BKS — das aktuelle, ein gespeichertes oder das WKS —, und die Eingabetaste nimmt das aktuelle. Dann zeigt er die ganze Zeichnung und meldet <Message id="regeneratingModel" />.

Nichts in der Zeichnung bewegt sich, und das BKS bleibt, wie es war: DRSICHT dreht nur die Ansicht. Es ist ein Rückgängig-Schritt, <Command id="U" /> nimmt die Ansicht also zurück, und <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> geht zur vorherigen Ansicht zurück. Es ist der Weg zurück zur Draufsicht nach <Command id="3DORBIT" /> oder einer isometrischen <Command id="VIEW" />. Das 3D von MellowCAD besteht nur aus Volumenkörpern und ist noch unvollständig.

## Options

### Current ucs

Die Draufsicht des aktuellen BKS, die Vorgabe. Nachdem <Command id="UCS" /> das BKS um 30 Grad um Z gedreht hat, erscheint die Zeichnung um 30 Grad im Uhrzeigersinn gedreht, sodass die X-Achse des BKS nach rechts zeigt; nach einem BKS auf einer geneigten Fläche blickt sie senkrecht auf diese Fläche.

### Ucs

Die Draufsicht eines mit <Keyword command="UCS" id="NAmed" /> von <Command id="UCS" /> gespeicherten BKS, das Sie per Namen eingeben. Bei einem nicht gespeicherten Namen meldet der Befehl, dass er dieses BKS nicht finden kann, und fragt erneut; <Keyword id="?" /> listet die gespeicherten auf, wie BKS, und fragt ebenfalls erneut. Das aktuelle BKS ändert sich nicht.

### World

Die Draufsicht des Weltkoordinatensystems: die Zeichnung wie am Anfang, X nach rechts und Y nach oben, welches BKS auch aktuell ist, das bleibt, wie es war.

## Missing

Ist nichts gezeichnet, lässt DRSICHT den Zoom, wo er war, wo AutoCAD die Zeichnungsgrenzen zeigt.

## Questions

### Wie kehre ich in AutoCAD zur Draufsicht zurück?

Geben Sie `DRSICHT` ein und drücken Sie zweimal die Eingabetaste: Die zweite Eingabe nimmt <Keyword id="Current ucs" />. Ist das BKS gedreht und Sie möchten die Draufsicht des WKS, wählen Sie stattdessen <Keyword id="World" />.

### Was ist der BKS-Befehl für die Draufsicht?

DRSICHT mit <Keyword id="Current ucs" />: Er blickt auf das aktuelle BKS, seine X-Achse nach rechts. Drehen Sie zuerst das BKS mit <Command id="UCS" />, starten Sie dann DRSICHT und drücken Sie zweimal die Eingabetaste, und Sie zeichnen auf der gedrehten Draufsicht, als wäre sie gerade.

### Warum ist meine Zeichnung in der Draufsicht gedreht?

Die Ansicht ist die Draufsicht eines gedrehten BKS. Starten Sie DRSICHT und wählen Sie <Keyword id="World" />, um die Zeichnung wieder mit dem X des WKS nach rechts zu sehen; <Command id="UCS" /> und die Eingabetaste setzen das BKS ebenfalls auf WKS zurück.

### Ändert DRSICHT das BKS?

Nein. Es dreht nur die Ansicht; das BKS bleibt, wie es war. Die orthogonalen Ansichten von <Command id="VIEW" /> sind es, die auch das BKS drehen.
