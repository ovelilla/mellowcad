---
title: "Befehl COPYCLIP in AutoCAD: in die Zwischenablage kopieren"
metaTitle: "Befehl COPYCLIP in AutoCAD"
description: "Wie COPYCLIP (Strg+C) in AutoCAD Objekte in die Zwischenablage kopiert: einfügen mit PASTECLIP, mit Basispunkt, in eine andere Zeichnung. Zum Testen."
figure: "COPYCLIP für die Bohrung einer Platte, dann PASTECLIP bei 65,20: die Kopie dort an ihrer linken unteren Ecke abgelegt, eine zweite Bohrung."
sourceHash: "f84c995e7c2b"
---

COPYCLIP kopiert die gewählten Objekte in die Zwischenablage, mit den Layern, Stilen und Blöcken, die sie verwenden; die Zeichnung ändert sich nicht, und vor ihm gewählte Objekte bleiben gewählt. Strg+C führt ihn aus und bricht einen laufenden Befehl ab. <Command id="PASTECLIP" />, Strg+V, fragt dann nach einem Einfügepunkt: Die Objekte folgen dem Fadenkreuz und landen mit der linken unteren Ecke ihrer Ausdehnung am Punkt, im aktuellen BKS, alles in einem Schritt, den <Command id="U" /> zurücknimmt. Fügen Sie in dieselbe Zeichnung oder in eine andere ein: Die Zwischenablage ist die des Systems, eine Zeichnung in einem anderen Tab kann sie also lesen, sofern der Browser der Seite das Lesen der Zwischenablage erlaubt. Hat ein eingefügter Layer, Stil oder Block den Namen eines, den die Zeichnung schon hat, wird der der Zeichnung verwendet.

<Command id="CUTCLIP" />, Strg+X, kopiert die Objekte und löscht sie, wie LÖSCHEN es tut. <Command id="COPYBASE" />, Strg+Umschalt+C, fragt zuerst nach einem Basispunkt, und PASTECLIP platziert die Objekte dann an diesem Punkt statt an ihrer Ecke, sodass sie genau dort landen, wo Sie es meinen. Strg+A wählt jedes Objekt der Zeichnung.

## Missing

PASTEBLOCK und CUTBASE, und damit Strg+Umschalt+V und Strg+Umschalt+X, die dem Browser überlassen bleiben, ebenso Strg+Umschalt+A. PASTEORIG, PASTESPEC, das Ziehen von Objekten zwischen Fenstern und Text aus einem anderen Programm, der als mehrzeiliger Text eingefügt wird. Die verborgenen INSERT-Optionen von PASTECLIP an seinem Punkt, sodass sich eine Einfügung beim Landen nicht skalieren, drehen oder auflösen lässt.

## Questions

### Was ist der Unterschied zwischen KOPIEREN und COPYCLIP?

<Command id="COPY" /> platziert Kopien in derselben Zeichnung, von einem Basispunkt zu einem zweiten Punkt. COPYCLIP legt die Objekte in die Zwischenablage, um sie mit PASTECLIP in diese Zeichnung oder eine andere einzufügen.

### Wie kopiert man mit einem Basispunkt?

Drücken Sie Strg+Umschalt+C oder geben Sie `COPYBASE` ein, geben Sie den Basispunkt an und wählen Sie die Objekte. Strg+V platziert sie dann an diesem Punkt.

### Wie kopiert man Objekte von einer Zeichnung in eine andere?

Wählen Sie sie und drücken Sie Strg+C, öffnen Sie die andere Zeichnung und drücken Sie Strg+V, dann wählen Sie den Einfügepunkt. Ihre Layer, Stile und Blöcke kommen mit.

### Warum funktioniert das Einfügen nicht?

Der Browser fragt möglicherweise, ob die Seite die Zwischenablage lesen darf: Erlauben Sie es. Verweigert er es, fügt PASTECLIP ein, was zuletzt in derselben Seite kopiert wurde. Ist nichts kopiert, fügt es nichts ein.
