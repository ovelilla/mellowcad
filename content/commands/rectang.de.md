---
title: "Befehl RECHTECK (RECTANG) in AutoCAD"
description: "Wie RECHTECK (RECTANG, Alias RE) in AutoCAD ein Rechteck zeichnet: zwei Ecken, Abmessungen, Fläche, Drehung, Abrundung und Fase. Zum Testen im Browser."
figure: "Zwei Rechtecke aus zwei Ecken, das zweite relativ zum ersten eingegeben: eines mit Abrunden 8, das nächste mit Fase 8."
sourceHash: "a5d4e90c06aa"
---

RECHTECK (RECTANG) zeichnet ein Rechteck aus zwei gegenüberliegenden Ecken, gewählt oder eingegeben: `0,0` dann `100,50`, relativ zur ersten bei dynamischer Eingabe, ergibt eines von 100 mal 50. Es ist eine geschlossene Polylinie aus vier Scheitelpunkten, auf dem aktuellen Layer erzeugt. Die Optionen der ersten Eingabeaufforderung legen fest, wie die nächsten Rechtecke gezeichnet werden, und jede behält ihren Wert für den Rest der Sitzung: Das nächste RECHTECK zeigt die geltenden in seiner ersten Zeile. Seine Breitenoption gibt jeder Seite eine Polylinienbreite. Während Sie die andere Ecke setzen, folgt das Rechteck dem Fadenkreuz; bei eingeschalteter dynamischer Eingabe können Sie seine Länge, Tab und seine Breite eingeben.

## Options

### Chamfer

Fragt nach einem ersten und einem zweiten Fasenabstand und schneidet jede Ecke um diese: acht Scheitelpunkte. Ein Abstand von 0 schaltet es aus. Es ersetzt Fillet.

### Elevation

Fragt nach der Höhe, in der das Rechteck gezeichnet wird, seinem Z.

### Fillet

Fragt nach einem Radius und rundet jede Ecke damit ab. Ein Radius von 0 schaltet es aus. Es ersetzt Chamfer.

### Thickness

Fragt nach einer Objekthöhe: Das Rechteck steht so hoch, wie eine Wand es täte, in einer 3D-Ansicht.

### Area

Bei der anderen Ecke: fragt nach der Fläche, dann ob die <Keyword id="Length" /> oder die <Keyword id="Width" /> angegeben werden soll, dann nach dieser Seite. Die andere Seite wird berechnet, die Ecken eingerechnet, und das Rechteck sofort erzeugt.

### Dimensions

Bei der anderen Ecke: fragt nach der Länge und der Breite, dann nach einem Punkt, der festlegt, in welcher Richtung von der ersten Ecke aus das Rechteck liegt.

### Rotation

Bei der anderen Ecke: fragt nach dem Winkel, um den das Rechteck gedreht ist, eingegeben oder als Punkt von der ersten Ecke aus, oder zwei Punkte mit <Keyword id="Pick" />. Der Winkel gilt für die Sitzung.

## Missing

Eine Länge oder Breite von 0 unter <Keyword id="Area" />, die hier nichts zeichnet und in AutoCAD eine gebrochene Polylinie. Nach einer abgelehnten Antwort bei der Eingabeaufforderung von Rotation fragt MellowCAD die Eingabeaufforderung erneut vollständig, wo AutoCAD nichts weiter schreibt.

## Questions

### Wie lautet das Alias von RECHTECK (RECTANG) in AutoCAD?

`RE`, dann die Eingabetaste oder die Leertaste. `REC` des englischen AutoCAD gibt es in der deutschen Version nicht. Der volle Name funktioniert ebenfalls, und `_RECTANG` in jeder Sprache von AutoCAD.

### Wie zeichnet man ein Rechteck mit genauen Abmessungen?

Geben Sie die erste Ecke an und geben Sie dann die andere relativ dazu ein: `100,50` bei eingeschalteter dynamischer Eingabe, wie sie beginnt, oder `@100,50` ohne sie, macht es 100 lang und 50 breit. Oder wählen Sie <Keyword id="Dimensions" /> und geben Sie die beiden Seiten ein.

### Wie zeichnet man ein Rechteck mit abgerundeten Ecken?

Wählen Sie <Keyword id="Fillet" /> bei der ersten Eingabeaufforderung und geben Sie den Radius ein, dann die beiden Ecken.

### Warum hat mein Rechteck abgerundete oder abgeschnittene Ecken?

RECHTECK behält Fillet und Chamfer für die Sitzung, ein danach gezeichnetes Rechteck trägt sie also ebenfalls: Seine erste Zeile zeigt es. Wählen Sie <Keyword id="Fillet" /> und geben Sie `0` ein, um wieder glatte Ecken zu zeichnen.

### Ist ein Rechteck in AutoCAD eine Polylinie?

Ja: eine geschlossene Polylinie. <Command id="EXPLODE" /> zerlegt sie in vier Linien, und <Command id="OFFSET" /> versetzt sie als Ganzes.
