---
title: "Befehl PAN in AutoCAD"
description: "So arbeitet AutoCADs PAN (Alias P): die Ansicht mit dem Handcursor oder der Radtaste ziehen, -PAN über zwei Punkte, und PAN innerhalb eines anderen Befehls."
figure: "PAN nach rechts und unten gezogen, dann die Eingabetaste: Die Platte gleitet in der Ansicht, ihre Koordinaten bleiben gleich."
sourceHash: "0ca3050831f3"
---

PAN verschiebt die Ansicht; in der Zeichnung bewegt sich nichts. Er beginnt mit <Message id="panExit" /> und fragt nichts mehr: Der Cursor wird zu einer Hand, und das Ziehen mit der linken Maustaste bewegt die Ansicht mit, so oft Sie wollen, bis die Eingabetaste oder Esc ihn beendet. Ohne PAN verschiebt das Ziehen mit der Radtaste der Maus jederzeit die Ansicht, auch mitten in einem Befehl. Jeder PAN ist ein Schritt für Rückgängig, zusammengefasst mit den ZOOM und PAN um ihn herum, sodass <Command id="U" /> die Ansicht zurücknimmt. Mit Apostroph getippt, `'PAN` oder `'P`, funktioniert er innerhalb eines anderen Befehls, der danach weitergeht.

<Command id="-PAN" /> verschiebt stattdessen über zwei Punkte: einen Basispunkt und einen zweiten Punkt, wobei sich die Ansicht um den Abstand zwischen ihnen bewegt; oder eine bei der ersten Eingabeaufforderung getippte Verschiebung, etwa `50,0`, und die Eingabetaste beim zweiten. Er ist ebenfalls transparent und ein eigener Schritt für Rückgängig.

## Missing

Das Kontextmenü, das AutoCAD bei einem Rechtsklick während des Verschiebens zeigt, mit Beenden, Pan, Zoom, 3D-Orbit, Zoom Fenster, Zoom Original und Zoom Grenzen.

## Questions

### Wie lautet das Kürzel für PAN in AutoCAD?

`P`, danach Eingabetaste oder Leertaste. Oder gar kein Befehl: Halten Sie die Radtaste der Maus gedrückt und ziehen Sie. Auch der vollständige Name funktioniert, ebenso `_PAN` in jeder Sprache von AutoCAD.

### Wie verschiebe ich die Ansicht in AutoCAD mit der Maus?

Halten Sie die Radtaste gedrückt und ziehen Sie: Die Ansicht folgt dem Cursor. Drehen Sie das Rad, um um den Cursor herum hinein- und herauszuzoomen. Auf einem Trackpad starten Sie PAN und ziehen mit der linken Taste.

### Wie verschiebe ich die Ansicht beim Zeichnen?

Ziehen Sie mit der Radtaste, oder tippen Sie `'P` bei der Eingabeaufforderung des Befehls: Der Befehl wartet, während Sie verschieben, und fragt dann dort weiter, wo er war.

### Wie verschiebe ich die Ansicht um einen genauen Abstand?

Verwenden Sie <Command id="-PAN" />: Tippen Sie die Verschiebung, etwa `100,0`, und drücken Sie beim zweiten Punkt die Eingabetaste. Die Ansicht bewegt sich 100 Einheiten entlang X.
