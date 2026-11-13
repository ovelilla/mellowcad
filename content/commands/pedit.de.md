---
title: "Befehl PEDIT (Polylinie bearbeiten) in AutoCAD"
description: "So arbeitet AutoCADs PEDIT (Alias PE): Linien zur Polylinie machen, Verbinden, Breite, Angleichen und Spline, Scheitelpunkt bearbeiten, Mehrfach. Gratis testen."
figure: "Drei Linien, die Ende an Ende aufeinandertreffen: PEDIT macht die erste zur Polylinie, verbindet die beiden anderen mit ihr und gibt ihr die Breite 2."
sourceHash: "bdc0bf10ac09"
---

PEDIT bearbeitet eine Polylinie. Wählen Sie bei `Polylinie wählen oder [Mehrfach]:` eine aus, oder wählen Sie sie vor dem Befehl aus; auch ein Doppelklick auf eine Polylinie startet PEDIT für sie. Wählen Sie stattdessen eine Linie, einen Bogen oder einen Spline, meldet der Befehl <Message id="objectNotPolyline" /> und fragt, ob das Objekt in eine Polylinie umgewandelt werden soll, standardmäßig Ja: Die neue Polylinie tritt an seine Stelle und übernimmt seine Eigenschaften. Danach fragt er immer wieder nach einer Option, jede wird sofort angewendet, bis die Eingabetaste den Befehl beendet. Eine 3D-Polylinie bekommt eine kürzere Liste, ohne Breite, ohne Kurvenangleichung und ohne Linientyp-Generierung, und ihre Spline-Option heißt <Keyword id="Spline curve" />. Esc behält, was bereits getan wurde; die gesamte Bearbeitung ist ein einziger Schritt, den <Command id="U" /> zurücknimmt.

## Options

### Multiple

Bearbeitet mehrere Polylinien auf einmal: Wählen Sie sie aus, geben Sie an, ob die darin enthaltenen Linien, Bögen und Splines umgewandelt werden sollen, dann wird jede Option auf alle angewendet. Sein Verbinden fragt nach einem Toleranzabstand und einem <Keyword id="Jointype" />: <Keyword id="Extend" /> stutzt oder dehnt die Endsegmente, bis sie sich treffen, <Keyword id="Add" /> überbrückt die Lücke mit einem neuen Segment, <Keyword id="Both" /> dehnt, wo es geht, und fügt hinzu, wo es nicht geht.

### Close

Schließt die Polylinie mit einem Segment vom letzten zum ersten Scheitelpunkt, mit einem Bogen, wo das letzte Segment ein Bogen ist. Bei einer geschlossenen Polylinie lautet die Option <Keyword id="Open" /> und nimmt dieses Segment wieder weg.

### Join

Fügt Linien, Bögen und offene Polylinien, die an die Enden der Polylinie anschließen, Ende an Ende hinzu und meldet, wie viele Segmente es hinzugefügt hat. An eine geschlossene Polylinie kann nichts angefügt werden: <Message id="cannotJoinClosedPolyline" />.

### Width

Eine Breite für alle Segmente, getippt oder durch zwei Punkte gemessen; 0 nimmt die Breite weg.

### Edit vertex

Setzt ein X auf den ersten Scheitelpunkt und fragt, was dort geschehen soll: <Keyword id="Next" /> und <Keyword id="Previous" /> setzen das X weiter, <Keyword id="Move" /> verschiebt den Scheitelpunkt, <Keyword id="Insert" /> fügt danach einen hinzu, <Keyword id="Break" /> und <Keyword id="Straighten" /> merken sich den Scheitelpunkt, Sie setzen das X auf einen anderen, und <Keyword id="Go" /> trennt die Polylinie zwischen den beiden oder macht aus dem, was dazwischen liegt, ein gerades Segment, <Keyword id="Width" /> legt die Anfangs- und Endbreite des nächsten Segments fest, <Keyword id="Tangent" /> gibt dem Scheitelpunkt eine Richtung für ein späteres Angleichen, und <Keyword id="eXit" /> geht zurück.

### Fit

Zeichnet durch jeden Scheitelpunkt eine glatte Kurve aus Bögen, tangential, wo sie aufeinandertreffen, so wie AutoCADs Kurvenangleichung sie legt. Die Scheitelpunkte bleiben, und ihre Bearbeitung formt die Kurve um.

### Spline

Passt der Polylinie einen B-Spline an, der von ihren Scheitelpunkten umrahmt wird, statt durch sie zu laufen: quadratisch oder kubisch, mit SPLINETYPE, und so fein wie SPLINESEGS. Bei einer 3D-Polylinie heißt er <Keyword id="Spline curve" />. Die Option Objekt von SPLINE macht aus einer solchen Polylinie einen echten Spline.

### Decurve

Nimmt die Kurve von Fit oder Spline weg: wieder gerade Segmente zwischen den Scheitelpunkten.

### Ltype gen

<Keyword id="ON" /> legt den Linientyp als ein einziges Muster über die ganze Polylinie, sodass eine gestrichelte Polylinie mit kurzen Segmenten dennoch Striche zeigt; <Keyword id="OFF" />, die Vorgabe, beginnt das Muster an jedem Scheitelpunkt neu.

### Reverse

Dreht die Polylinie um: ihre Scheitelpunkte in die andere Richtung, die Bögen und Breiten mit ihnen.

### Undo

Nimmt die letzte Option dieses Durchlaufs zurück und fragt weiter.

## Missing

PEDITACCEPT: Wählen Sie eine Linie, einen Bogen oder einen Spline, wird immer vor dem Umwandeln gefragt. PLINECONVERTMODE: Ein Spline wird zu einer Polylinie aus geraden Segmenten, weit mehr als AutoCAD sie erzeugt, nie aus Bögen. Eine angeglichene Polylinie erscheint in der Eigenschaften-Palette als einfache Polylinie, ohne AutoCADs Titel 2D-Polylinie und ihre Zeile Angleichen/Glätten. Mehrfach mit nur 3D-Polylinien in der Auswahl stellt die 3D-Eingabeaufforderung, wo AutoCAD die 2D-Eingabeaufforderung stellt. Netze zum Bearbeiten gibt es nicht.

## Questions

### Wie lautet das Kürzel für PEDIT in AutoCAD?

`PE`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_PEDIT` in jeder Sprache von AutoCAD. Ein Doppelklick auf eine Polylinie startet ihn ebenfalls. In der deutschen AutoCAD-Version heißt der Befehl ebenfalls PEDIT.

### Wie verbinde ich Linien zu einer Polylinie?

Starten Sie PEDIT, wählen Sie eine der Linien aus und drücken Sie die Eingabetaste, um sie in eine Polylinie umzuwandeln, wählen Sie dann <Keyword id="Join" /> und wählen Sie die anderen aus: Die, die Ende an Ende aufeinandertreffen, werden zu einer Polylinie. <Command id="JOIN" /> tut dasselbe in einem Schritt.

### Warum funktioniert PEDIT bei meinem Objekt nicht?

PEDIT bearbeitet Polylinien und bietet an, Linien, Bögen und Splines umzuwandeln; alles andere, Text, ein Kreis, ein Block, wird abgelehnt und erneut abgefragt. Ein Objekt auf einem gesperrten Layer meldet <Message id="objectOnLockedLayer" />. Verbinden fügt nur Objekte hinzu, deren Enden genau an die Polylinie anschließen: Bei Lücken verwenden Sie <Keyword id="Multiple" /> und einen Toleranzabstand.

### Wie ändere ich die Breite einer Polylinie?

Wählen Sie <Keyword id="Width" /> und geben Sie die Breite ein: Jedes Segment übernimmt sie. Für ein einzelnes Segment verwenden Sie <Keyword id="Edit vertex" />, setzen das X auf den Scheitelpunkt, an dem es beginnt, und wählen dessen <Keyword id="Width" />.

### Wie mache ich eine Polylinie rund?

<Keyword id="Fit" /> legt Bögen durch jeden Scheitelpunkt; <Keyword id="Spline" /> macht eine glattere Kurve, die von den Scheitelpunkten umrahmt wird. <Keyword id="Decurve" /> macht sie wieder gerade.
