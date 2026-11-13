---
title: "AutoCAD-Übung 3D: eine Riemenscheibe"
metaTitle: "AutoCAD-Übung 3D: Riemenscheibe durch Rotation"
description: "Eine Riemenscheibe in AutoCAD 3D modellieren: ihren halben Schnitt als geschlossene Polylinie, um die Y-Achse zu einem Volumenkörper gedreht."
figure: "Der halbe Schnitt der Riemenscheibe neben ihrer Achse, mit den Abständen von der Achse bemaßt."
model: "Die Riemenscheibe als Volumenkörper, von Südosten gesehen im visuellen Stil Konzeptionell."
sourceHash: "f9c2a81b39fe"
---

Modellieren Sie diese Riemenscheibe, indem Sie ihren halben Schnitt um ihre Achse drehen, in Millimetern: eine Bohrung von 20, eine 30 lange Nabe mit 40 Durchmesser, eine 10 dicke Scheibe und ein 24 breiter Kranz im Durchmesser von 90 bis 110, auf der Nabe zentriert. Der Schnitt wird als Abstände von der Achse gezeichnet, die entlang der Y-Achse verläuft, daher wird jeder Durchmesser als seine Hälfte gezeichnet.

## Steps

### Den halben Schnitt zeichnen [#profile]

Auf dem Layer Kontur eine geschlossene <Command id="PLINE" /> von `10,0`, jeder weitere Punkt ein Schritt vom letzten: `10,0`, `0,10`, `25,0`, `0,-7`, `10,0`, `0,24`, `-10,0`, `0,-7`, `-25,0`, `0,10` und `-10,0`, dann <Keyword command="PLINE" id="Close" />.

### Die Ansicht drehen [#view]

<Command id="-VIEW" /> und <Keyword command="VIEW" id="SEiso" /> zeigen sie von Südosten und oben; <Command id="VSCURRENT" /> und <Keyword command="VSCURRENT" id="Conceptual" /> schattieren die Flächen, woran man ein Drehteil am besten erkennt.

### Drehen [#revolve]

<Command id="REVOLVE" />: Wählen Sie den Schnitt und drücken Sie die Eingabetaste, dann <Keyword command="REVOLVE" id="Y" />: Die Y-Achse ist die der Riemenscheibe. Die Eingabetaste übernimmt den Vorgabewinkel, eine volle Umdrehung. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> zeigt sie formatfüllend, und ein Maßstab von `0.8x` lässt Platz um sie herum.
