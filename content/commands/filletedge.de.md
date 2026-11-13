---
title: "Befehl ABRUNDKANTE (FILLETEDGE) in AutoCAD"
description: "Wie ABRUNDKANTE (FILLETEDGE) in AutoCAD die Kanten eines 3D-Volumenkörpers abrundet: Kanten, Kette, Schleife, Radius, Pfeilgriff."
figure: "Ein Quader aus Südosten gesehen: ABRUNDKANTE mit einem Radius von 8 rundet seine zwei senkrechten Kanten rechts ab."
sourceHash: "403a055efb24"
---

ABRUNDKANTE (FILLETEDGE) rundet die Kanten eines 3D-Volumenkörpers ab. Der Befehl meldet den aktuellen Radius und fragt dann bis zur Eingabetaste nach Kanten: Ein Klick nimmt die Kante unter dem Cursor, die beim Überfahren hervorgehoben wird, und ein eingegebener Punkt nimmt die Kante, die durch ihn verläuft. Während Kanten gewählt werden, wird der Volumenkörper so gezeichnet, wie er wird, die Verrundungen an Ort und Stelle. Die Eingabetaste zählt die Kanten und bittet Sie, zur Annahme erneut die Eingabetaste zu drücken oder den Radius zu ändern; diese Eingabe erzeugt die Verrundungen. Nur Kanten eines Volumenkörpers: Die eines anderen ergeben <Message id="filletMultipleBodies" />, eine zweimal gewählte <Message id="edgeAlreadyPicked" />.

Eine gerade Kante zwischen zwei ebenen Flächen wird zu einem Viertel eines Zylinders, die runde Kante eines Lochs oder eines Rands zu einem Viertel eines Torus; Verrundungen, die an einer Ecke zusammentreffen, werden verbunden, drei davon durch ein Stück einer Kugel. Der Radius wird in der Zeichnung gespeichert und beim nächsten Mal wieder angeboten. Der Volumenkörper behält seinen Layer und seine Eigenschaften, verliert aber, woraus er entstand: Ein Quader ist kein Quader mehr. Der ganze Befehl ist ein Rückgängig-Schritt. Das 3D von MellowCAD besteht nur aus Volumenkörpern und ist noch unvollständig.

## Options

### Chain

Nimmt die gewählte Kante und jede dazu tangentiale Kante, eine nach der anderen: die acht um die Oberseite eines Blocks, dessen senkrechte Kanten bereits abgerundet sind. Ist keine tangential, meldet der Befehl <Message id="noTangentChainEdges" /> und nimmt die gewählte. <Keyword id="Edge" /> geht zu einzelnen Kanten zurück.

### Loop

Nimmt jede Kante rund um eine Fläche: Wählen Sie eine Kante, dann <Keyword id="Accept" /> für die gezeigte Schleife oder <Keyword id="Next" /> für die Schleife der anderen Fläche, zu der die Kante gehört.

### Radius

Fragt nach dem Radius, eingegeben oder als Abstand zwischen zwei Punkten; 0 oder weniger ergibt <Message id="radiusTooSmall" />. <Keyword id="Expression" /> nimmt ihn als Formel. Bei der Eingabeaufforderung zur Annahme ändert er den Radius der gezeigten Verrundungen. Der Pfeilgriff in der Mitte der ersten Verrundung legt ihn durch Ziehen fest: klicken, bewegen, klicken; <Keyword id="eXit" /> oder Esc lässt ihn, wie er war.

## Missing

Verrundungen mit zwei Radien, die zusammentreffen, und eine Verrundung, die an einer gekrümmten Fläche endet. Eine Verrundung, die breiter ist als eine Fläche daneben, die AutoCAD über die nächste Kante rollt: Hier schlägt sie mit einem Modellierungsfehler fehl. Eine gerade Kante neben einer gekrümmten Fläche, eine runde Kante abseits der Achse ihres Zylinders und jede Kante einer Kugel, eines Torus, eines Extrusionskörpers oder eines Rotationskörpers, die auf dieselbe Weise fehlschlagen. Einige Ecken, an denen Verrundungen an Kanten mit unterschiedlichen Neigungen zusammentreffen. Der Pfeilgriff an einer anderen Kante als der ersten und die Linie von ihm zum Cursor. <Command id="FILLET" />, das die Kante eines Volumenkörpers wählt, was AutoCAD ebenfalls erlaubt. Die Verrundung als Netz gezeichnet, während Sie wählen, und Flächen.

## Questions

### Wie runde ich eine Kante eines 3D-Volumenkörpers in AutoCAD ab?

Starten Sie ABRUNDKANTE, wählen Sie <Keyword id="Radius" /> und geben Sie ihn ein, wählen Sie die Kanten und drücken Sie dann zweimal die Eingabetaste: einmal, um die Auswahl zu beenden, einmal zur Annahme. Die `8` der Sitzung rundet zwei Kanten eines Quaders ab.

### Wie runde ich alle Kanten einer Fläche ab?

Wählen Sie <Keyword id="Loop" /> und eine Kante der Fläche, dann <Keyword id="Accept" />, oder <Keyword id="Next" />, wenn die gezeigte Schleife die der anderen Fläche ist. Für Kanten, die ineinander übergehen, etwa die Oberseite eines abgerundeten Blocks, nimmt <Keyword id="Chain" /> sie alle.

### Warum funktioniert ABRUNDEN (FILLET) nicht an einem 3D-Volumenkörper?

<Command id="FILLET" /> von AutoCAD rundet auch die Kante eines Volumenkörpers ab, das von MellowCAD aber noch nicht: Verwenden Sie ABRUNDKANTE; für eine Fase <Command id="CHAMFEREDGE" />.

### Wie ändere ich den Verrundungsradius?

Wählen Sie <Keyword id="Radius" /> vor der Auswahl oder bei der Eingabeaufforderung zur Annahme, oder ziehen Sie den Pfeilgriff in der Mitte der ersten Verrundung. Der letzte Radius wird beim nächsten Mal angeboten.
