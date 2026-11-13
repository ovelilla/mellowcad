---
title: "Befehl AUSSCHNT (VIEW) in AutoCAD"
description: "So wechselt AutoCADs AUSSCHNT (VIEW, -VIEW) in die sechs orthogonalen und die vier isometrischen Ansichten und setzt das BKS jeder Ansicht. Online testen."
figure: "Ein gestufter Block im Grundriss: -VIEW und SW Isometric, und er wird von Südwesten und von oben gesehen, im visuellen Stil Hidden."
sourceHash: "261c8657f5f7"
---

AUSSCHNT (VIEW) dreht die Ansicht in eine der zehn voreingestellten Ansichten von AutoCAD: sechs orthogonale, die frontal auf eine Seite des Modells blicken, und vier isometrische, die von einer Ecke herabblicken. In der Zeichnung bewegt sich nichts. AUSSCHNT startet <Command id="-VIEW" />, die Befehlszeilenform: Ihre erste Eingabeaufforderung listet <Keyword id="Orthographic" /> auf, die dann nach der Seite fragt, und sie nimmt auch gleich den Namen einer Ansicht entgegen, wie AutoCADs Menüs es beantworten: <Command id="-VIEW" />, dann <Keyword id="SWiso" />. Jede Ansicht zeigt die gesamte Zeichnung und meldet <Message id="regeneratingModel" />.

Die Ansichtssteuerung oben links in der Zeichnung listet dieselben zehn Ansichten auf und startet <Command id="-VIEW" />, und auch die Flächen und Ecken des ViewCube drehen in sie, wobei das BKS bleibt, wie es ist. Jeder AUSSCHNT ist ein Schritt, den <Command id="U" /> zurücknimmt, samt dem BKS, das er gesetzt hat. Mit Apostroph innerhalb eines anderen Befehls getippt, weist er mit <Message id="requiresRegen" /> ab. MellowCADs 3D besteht nur aus Volumenkörpern und ist noch unvollständig.

## Options

### Orthographic

Fragt nach der Seite, auf die geblickt wird, standardmäßig <Keyword id="Top" />, sodass die Eingabetaste dort die Draufsicht ergibt: <Keyword id="Top" />, <Keyword id="Bottom" />, <Keyword id="Front" />, <Keyword id="BAck" />, <Keyword id="Left" /> oder <Keyword id="Right" />. Jede steht aufrecht: Top zeigt X nach rechts und Y nach oben, Front X nach rechts und Z nach oben, und Bottom, von unten gesehen, X nach links. Bei der ersten Eingabeaufforderung getippt, funktioniert jede Seite auch ohne die Option.

Jede dreht außerdem das BKS so, dass es Ihnen zugewandt ist, aus den Achsen des Weltkoordinatensystems, wie auch immer das BKS vorher stand, mit seinem Ursprung bei `0,0,0`, wie es die orthogonale Option von <Command id="UCS" /> tut: Nach Front ist seine XY-Ebene die Vorderseite, sodass das, was Sie zeichnen, flach auf dem Bildschirm liegt, und das BKS heißt `*FRONT*`. Nach Top hat es die Achsen des WKS und heißt `*TOP*`.

### SWiso

Isometrie Südwest: blickt von der Ecke vorn links herab und sieht die Vorderseite, die linke Seite und die Oberseite. Das BKS bleibt, wie es ist. Es ist die Ansicht der Sitzung.

### SEiso

Isometrie Südost: blickt von der Ecke vorn rechts herab und sieht die Vorderseite, die rechte Seite und die Oberseite. Das BKS bleibt, wie es ist.

### NEiso

Isometrie Nordost: blickt von der Ecke hinten rechts herab und sieht die Rückseite, die rechte Seite und die Oberseite. Das BKS bleibt, wie es ist.

### NWiso

Isometrie Nordwest: blickt von der Ecke hinten links herab und sieht die Rückseite, die linke Seite und die Oberseite. Das BKS bleibt, wie es ist.

## Missing

Benannte Ansichten: <Keyword id="Orthographic" /> ist die einzige Option, die die erste Eingabeaufforderung auflistet, wo die von AutoCAD auch `?`, Löschen, Wiederherstellen, Speichern, Einstellungen und Fenster auflistet, und ein dort getippter Name wird abgelehnt. Der Ansichten-Manager, den AUSSCHNT in AutoCAD öffnet. Bei leerer Zeichnung behält eine Ansicht den Zoom, bei dem AutoCAD die Zeichnungsgrenzen zeigt. UCSORTHO und UCSBASE als Variablen: Eine orthogonale Ansicht richtet das BKS immer aus, ausgehend von den Achsen des WKS. Das ausgerichtete BKS in der Liste der Option <Keyword command="UCS" id="Previous" /> von <Command id="UCS" />.

## Questions

### Wie bekomme ich in AutoCAD eine isometrische Ansicht?

Geben Sie <Command id="-VIEW" /> ein, dann <Keyword id="SWiso" /> für die Isometrie Südwest; <Keyword id="SEiso" />, <Keyword id="NEiso" /> und <Keyword id="NWiso" /> ergeben die anderen drei Ecken. Oder wählen Sie SW Isometric in der Ansichtssteuerung oben links, oder klicken Sie auf eine obere Ecke des ViewCube. <Command id="VSCURRENT" /> mit <Keyword command="VSCURRENT" id="Hidden" /> blendet die Kanten dahinter aus.

### Welcher Befehl ergibt die Draufsicht?

<Command id="-VIEW" />, dann <Keyword id="Top" />, was auch das BKS auf die Achsen des WKS setzt. <Command id="PLAN" /> blickt stattdessen auf das aktuelle BKS herab und lässt es, wie es ist.

### Warum hat sich mein BKS nach einer Vorderansicht geändert?

Eine orthogonale Ansicht dreht das BKS so, dass es Ihnen zugewandt ist, damit das, was Sie zeichnen, auf dem Bildschirm liegt. <Command id="UCS" /> und die Eingabetaste gehen zurück zum WKS; <Command id="U" /> nimmt die Ansicht und ihr BKS zusammen zurück.

### Ist eine isometrische Ansicht dasselbe wie eine isometrische Zeichnung?

Nein. Eine isometrische Ansicht blickt von einer Ecke auf ein 3D-Modell. Eine isometrische Zeichnung ist 2D, gezeichnet auf den isometrischen Ebenen mit dem isometrischen Stil von FANG, den MellowCAD noch nicht hat.

### Wo ist der Ansichten-Manager?

AUSSCHNT startet <Command id="-VIEW" /> in der Befehlszeile: Es gibt keinen Ansichten-Manager, und benannte Ansichten (Speichern, Wiederherstellen) gibt es noch nicht.
