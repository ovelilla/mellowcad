---
title: "Befehl PTYP (PTYPE) in AutoCAD: Punktstil"
description: "Wie PTYP (PTYPE, Alias DDPTYP) in AutoCAD den Punktstil einstellt: die zwanzig Figuren, die Punktgröße, PDMODE und PDSIZE. Zum Testen im Browser."
figure: "PTYP öffnet den Dialog „Punktstil“; sein OK schreibt PDMODE und PDSIZE, hier als 35 und 8 eingegeben, dann drei in einer Platte gezeichnete Punkte."
sourceHash: "02cea384a2a9"
---

PTYP (PTYPE) öffnet den Dialog „Punktstil“, der festlegt, wie jedes Punktobjekt der Zeichnung gezeichnet wird: die, die <Command id="POINT" /> zeichnet, und die, die <Command id="DIVIDE" /> und <Command id="MEASURE" /> hinterlassen. `DDPTYP` ist sein Alias, wie in AutoCAD. Der Stil gehört zur Zeichnung, nicht zu einem Punkt: Ändern Sie ihn, und alle ändern sich auf einmal, und er wird mit der Zeichnung gespeichert. Die Schaltfläche sitzt neben „Punkt abfragen“ bei den Werkzeugen des Bereichs „Dienstprogramme“; mit einem Apostroph eingegeben, `'PTYP`, öffnet er sich innerhalb eines laufenden Befehls.

Der Dialog zeigt zwanzig Figuren in vier Reihen zu fünf, die aktuelle gewählt: ein Punkt, nichts, ein Plus, ein Kreuz und ein kurzer Strich, dann jede davon in einem Kreis, in einem Quadrat und in beiden. Darunter die Punktgröße und wie sie gelesen wird: „Größe relativ zum Bildschirm festlegen“, ein Prozentsatz der Höhe der Ansicht, oder „Größe in absoluten Einheiten festlegen“, Zeichnungseinheiten. Die Vorgabe sind 5 % relativ zum Bildschirm. OK schreibt die Wahl als einen Schritt, den <Command id="U" /> zurücknimmt; Abbrechen oder Esc ändert nichts. Eine Größe, die keine Zahl ist oder unter 0 liegt, wird abgelehnt, und der Dialog bleibt offen.

Was der Dialog schreibt, sind zwei Variablen, die sich auch in der Befehlszeile eingeben lassen: PDMODE, die Figur (0 bis 4, dazu 32 für den Kreis, 64 für das Quadrat, 96 für beide: 35 ist ein Kreuz in einem Kreis), und PDSIZE, die Größe (eine positive Zahl sind Zeichnungseinheiten, eine negative ein Prozentsatz des Bildschirms, 0 sind 5 %).

## Missing

Die Schaltfläche „Hilfe“ des Dialogs. Ein relativ zum Bildschirm bemessener Punkt behält diese Größe auf dem Bildschirm beim Zoomen, wo AutoCAD sie nur behält, bis die Zeichnung das nächste Mal regeneriert wird.

## Questions

### Was ist DDPTYP in AutoCAD?

Das Alias von PTYP: Beide öffnen den Dialog „Punktstil“, in jeder Sprache von AutoCAD.

### Warum sind meine Punkte nicht sichtbar?

Der vorgegebene Punktstil ist ein Punkt von einem Pixel Breite, den eine durch ihn gezeichnete Linie verdeckt, und PDMODE 1 zeichnet gar nichts. Öffnen Sie PTYP und wählen Sie ein Kreuz oder eine Figur im Kreis, oder geben Sie PDMODE und `3` ein. Mit einer Größe relativ zum Bildschirm bleiben sie bei jedem Zoom sichtbar.

### Wie ändert man die Größe von Punkten?

Geben Sie in PTYP die Punktgröße ein: ein Prozentsatz des Bildschirms mit „Größe relativ zum Bildschirm festlegen“, sodass ein Punkt beim Zoomen seine Größe behält, oder Zeichnungseinheiten mit „Größe in absoluten Einheiten festlegen“, sodass er mit der Zeichnung wächst und schrumpft. Oder geben Sie PDSIZE ein: Ein negativer Wert ist der Prozentsatz.

### Kann man einem einzelnen Punkt einen eigenen Stil geben?

Nein: In AutoCAD und hier ist der Punktstil der der Zeichnung, und jedes Punktobjekt folgt ihm. Um Stellen anders zu markieren, fügen Sie einen Block dort ein; <Command id="DIVIDE" /> und <Command id="MEASURE" /> können statt Punkten einen Block setzen.
