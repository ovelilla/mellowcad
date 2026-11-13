---
title: "Befehl 3DORBIT in AutoCAD"
description: "Wie 3DORBIT (3DO, ORBIT) in AutoCAD die Ansicht beim Ziehen dreht, wie Sie ihn verlassen, mit Umschalttaste und Rad kreisen und zur Draufsicht zurückkehren."
figure: "Ein Quader, zuerst in der Draufsicht gesehen: 3DORBIT, ein Ziehen zur Seite und nach unten, dann die Eingabetaste, und der Quader wird von über seiner vorderen Ecke gesehen."
sourceHash: "66fc1859c8fd"
---

3DORBIT dreht die Ansicht um die Zeichnung, während Sie ziehen; nichts in der Zeichnung bewegt sich oder ändert sich. Ziehen zur Seite dreht die Kamera um die Z-Achse des WKS, Ziehen nach oben und unten hebt oder senkt sie, um die Mitte der Zeichnung unter der Mitte des Bildschirms, in Parallelprojektion. Der Befehl beginnt mit dem Hinweis, wie man ihn verlässt: Solange er läuft, können Sie nur kreisen, und die Eingabetaste oder Esc beendet ihn, auch ohne gezogen zu haben.

Mit gedrückter Umschalttaste und Radtaste kreisen Sie von überall, auch innerhalb eines anderen Befehls, und die Schaltfläche Orbit der Navigationsleiste startet ihn ebenfalls. Mit Apostroph eingegeben, `'3DORBIT`, funktioniert er innerhalb eines anderen Befehls, der danach weitermacht. Jedes Ziehen ist ein Schritt für <Keyword command="ZOOM" id="Previous" /> von <Command id="ZOOM" />, und der ganze Durchlauf ist ein Rückgängig-Schritt, sodass <Command id="U" /> die Ansicht zurücksetzt. Um die Volumenkörper als Volumenkörper zu sehen, nicht als Drahtmodell, verwenden Sie <Command id="VSCURRENT" />; das 3D von MellowCAD besteht nur aus Volumenkörpern und ist noch unvollständig.

## Missing

Das Kontextmenü mit seinen Projektionen, visuellen Stilen und anderen Navigationsmodi. Das Kreisen nur um die gewählten Objekte. Perspektive. 3DFORBIT, 3DCORBIT und der Rest der 3D-Navigation von AutoCAD.

## Questions

### Wie lautet das Kürzel für 3DORBIT in AutoCAD?

`3DO` oder `ORBIT`, dann die Eingabetaste oder die Leertaste. Ohne etwas einzugeben, halten Sie die Umschalttaste und die Radtaste gedrückt und ziehen Sie.

### Wie kreise ich mit der Maus?

Halten Sie die Umschalttaste gedrückt, drücken Sie die Radtaste und ziehen Sie: zur Seite, um das Modell zu drehen, nach oben und unten, um es von höher oder tiefer zu betrachten. Nach dem Loslassen sind Sie wieder in dem Befehl, in dem Sie vorher waren.

### Wie verlasse ich 3DORBIT?

Drücken Sie die Eingabetaste oder Esc. Die Ansicht bleibt, wo Sie sie verlassen haben.

### Wie kehre ich nach dem Kreisen zur Draufsicht zurück?

Starten Sie <Command id="PLAN" /> und drücken Sie die Eingabetaste, oder <Command id="-VIEW" /> und <Keyword command="VIEW" id="Top" />, oder klicken Sie auf die Oberseite des ViewCube. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> geht Ziehvorgang für Ziehvorgang zurück.
