---
title: "Befehl QUERSCHNITT (SECTION) in AutoCAD"
description: "Wie QUERSCHNITT (SECTION, Alias QU) in AutoCAD eine Region erzeugt, wo eine Ebene 3D-Volumenkörper schneidet: 3 Punkte, Objekt, Zaxis, Ansicht, XY, YZ, ZX."
figure: "Ein Block mit einem Loch hindurch, von der ZX-Ebene durch die Mitte des Lochs geschnitten: QUERSCHNITT erzeugt das Profil, nach vorn herausgeschoben, zwei Rechtecke mit der Lücke des Lochs dazwischen."
sourceHash: "f1c01b76c810"
---

QUERSCHNITT (SECTION) erzeugt einen Querschnitt von 3D-Volumenkörpern: eine Region dort, wo eine Ebene jeden schneidet, und die Volumenkörper bleiben, wie sie waren. Der Befehl fragt bis zur Eingabetaste nach den Volumenkörpern: Wie in AutoCAD 2027 wird eine vorher gewählte Menge verworfen und erneut abgefragt, was kein Volumenkörper ist, wird übergangen, und eine Menge ohne Volumenkörper ergibt <Message id="noSolidsSelected" />. Dann folgt die Ebene: Standardmäßig geben Sie drei Punkte darauf an, und die Optionen legen sie auf andere Weise fest, wie bei <Command id="SLICE" />.

Jeder Volumenkörper, den die Ebene schneidet, erhält seine Region, die in der Ebene liegt: Ein Block mit einem Loch hindurch ergibt den Umriss mit der Lücke des Lochs, ein entlang seiner Achse geschnittener Zylinder ein Rechteck. Eine Ebene auf einer Fläche eines Volumenkörpers ergibt diese Fläche. Einer, den die Ebene verfehlt, ergibt <Message id="sectionMissedOne" />. Die Regionen übernehmen den aktuellen Layer und die aktuellen Eigenschaften, nicht die des Volumenkörpers; <Command id="MOVE" /> nimmt eine heraus, um sie zu sehen, <Command id="AREA" /> und <Command id="MASSPROP" /> messen sie, und <Command id="EXTRUDE" /> macht daraus einen Volumenkörper. Der ganze Befehl ist ein Rückgängig-Schritt. Das 3D von MellowCAD besteht nur aus Volumenkörpern und ist noch unvollständig.

## Options

### Object

Nimmt die Ebene eines Objekts, das Sie auswählen: eines Kreises, einer Ellipse, eines Bogens, eines 2D-Splines oder einer 2D-Polylinie.

### Zaxis

Fragt nach einem Punkt auf der Ebene, dann nach einem Punkt auf ihrer Z-Achse, der Linie senkrecht dazu.

### View

Die Ebene parallel zum Bildschirm, durch einen Punkt, den Sie angeben.

### XY

Die XY-Ebene des BKS, durch einen Punkt, den Sie angeben: Ein Punkt in einer Höhe ergibt dort einen waagerechten Schnitt. Die Eingabetaste nimmt den Ursprung des BKS.

### YZ

Die YZ-Ebene des BKS, durch einen Punkt, den Sie angeben; die Eingabetaste nimmt den Ursprung des BKS.

### ZX

Die ZX-Ebene des BKS, durch einen Punkt, den Sie angeben; die Eingabetaste nimmt den Ursprung des BKS. Der Schnitt der Sitzung ist diese Ebene durch die Mitte des Lochs.

### 3points

Drei Punkte auf der Ebene, die dann beliebig geneigt sein darf. Das ist die Vorgabe der ersten Eingabeaufforderung, ein Punkt dort ist also der erste der drei.

## Missing

Flächen und Netze, die MellowCAD nicht hat. Eine ebene 3D-Polylinie als Objekt der Ebene, die AutoCAD annimmt. Die Schnitte, für die MellowCAD noch keine exakte Form hat, wie bei <Command id="SLICE" />, die melden, dass eine boolesche Operation fehlgeschlagen ist. SECTIONPLANE und der Live-Schnitt, die das Menüband von AutoCAD anstelle von QUERSCHNITT anbietet: Hier wird QUERSCHNITT eingegeben.

## Questions

### Wie erzeuge ich einen Schnitt eines 3D-Volumenkörpers in AutoCAD?

Starten Sie QUERSCHNITT, wählen Sie den Volumenkörper und drücken Sie die Eingabetaste, geben Sie dann die Ebene an: <Keyword id="ZX" /> und ein Punkt durch die Mitte schneidet ihn von vorn nach hinten, <Keyword id="XY" /> und ein Punkt in einer Höhe schneidet ihn waagerecht. Die Region liegt im Volumenkörper: Schieben Sie sie mit <Command id="MOVE" /> heraus, um sie zu sehen.

### Was ist der Unterschied zwischen QUERSCHNITT (SECTION) und KAPPEN (SLICE)?

<Command id="SLICE" /> schneidet den Volumenkörper in zwei Teile und behält einen oder beide. QUERSCHNITT lässt den Volumenkörper ganz und zeichnet eine Region dort, wo die Ebene ihn schneidet.

### Wie lautet das Kürzel für QUERSCHNITT (SECTION) in AutoCAD?

`QU`, dann die Eingabetaste oder die Leertaste.

### Warum meldet QUERSCHNITT, dass die Ebene den Volumenkörper nicht schneidet?

Die Ebene verfehlt ihn: Prüfen Sie, wie Sie sie angegeben haben. <Keyword id="XY" />, <Keyword id="YZ" /> und <Keyword id="ZX" /> sind die Ebenen des BKS, ein Punkt in der falschen Höhe oder auf der falschen Seite legt die Ebene also außerhalb des Volumenkörpers.
