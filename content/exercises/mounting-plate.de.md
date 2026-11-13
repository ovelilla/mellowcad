---
title: "AutoCAD-Übung 3D: eine Montageplatte"
metaTitle: "AutoCAD-Übung 3D für Anfänger: eine Platte"
description: "Eine Montageplatte in AutoCAD 3D modellieren: Regionen, eine Differenz für die Löcher und eine einzige Extrusion, Schritt für Schritt. 3D kostenlos online üben."
figure: "Die Kontur der Platte, 100 mal 60 mit vier Löchern, bemaßt."
model: "Die Platte als Volumenkörper, 10 dick, von Südosten gesehen mit entfernten verdeckten Linien."
sourceHash: "87b8f906b0fd"
---

Modellieren Sie eine 10 dicke Montageplatte, in Millimetern: ihre Kontur 100 mal 60 mit Eckenradius 8 und vier Löchern von 10, deren Mittelpunkte 15 von den Kanten entfernt sind. Sie beginnt flach. Die Kontur und die Kreise werden zu Regionen, die Löcher werden abgezogen, solange die Platte noch flach ist, und eine einzige Extrusion macht daraus einen Volumenkörper mit seinen Löchern.

## Steps

### Das Profil zeichnen [#profile]

Auf dem Layer Kontur: <Command id="RECTANG" /> mit der Option <Keyword command="RECTANG" id="Fillet" /> `8`, von `0,0` bis `100,60`. Dann ein Kreis in `15,15` mit einem <Keyword command="CIRCLE" id="Diameter" /> von `10`, und kopieren Sie ihn mit <Command id="COPY" /> von seinem Mittelpunkt aus um `70,0`, `70,30` und `0,30`.

### Regionen erstellen [#region]

<Command id="REGION" /> macht aus geschlossenen Objekten Regionen: Wählen Sie die Kontur und die vier Kreise, dann die Eingabetaste. Fünf Schleifen, fünf Regionen.

### Die Löcher abziehen [#subtract]

<Command id="SUBTRACT" />: Wählen Sie die Region der Platte und drücken Sie die Eingabetaste, dann die Regionen der vier Kreise und die Eingabetaste. Es bleibt eine Region mit vier Löchern.

### Die Ansicht drehen [#view]

<Command id="-VIEW" /> und <Keyword command="VIEW" id="SEiso" /> zeigen sie von Südosten und oben; <Command id="VSCURRENT" /> und <Keyword command="VSCURRENT" id="Hidden" /> verbergen, was Flächen verdecken. Auch der ViewCube dreht die Ansicht mit einem Klick.

### Extrudieren [#extrude]

<Command id="EXTRUDE" />: Wählen Sie die Region, drücken Sie die Eingabetaste und geben Sie die Höhe ein, `10`. Die Platte ist ein Volumenkörper, mit allen Löchern. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> zeigt sie formatfüllend, und ein Maßstab von `0.8x` lässt Platz um sie herum.
