---
title: "Befehl LTFAKTOR (LTSCALE) in AutoCAD"
description: "Wie LTFAKTOR (LTSCALE, Alias LK) in AutoCAD den Linientypfaktor einstellt: Warum eine gestrichelte Linie durchgezogen aussieht und welcher Wert passt."
before: "Eine Platte von 4 Metern Länge, ihre Bohrung mit HIDDEN und ihre Achsen mit CENTER gezeichnet, beim vorgegebenen Linientypfaktor 1: Die Striche sind zu fein, um sichtbar zu sein."
figure: "Dieselbe Platte nach LTFAKTOR 20: Die Striche der Bohrung und der Achsen sind 20-mal länger gezeichnet."
sourceHash: "33b956c956fa"
---

LTFAKTOR (LTSCALE) legt den globalen Linientypfaktor fest: wie lang die Striche und Lücken jedes gestrichelten Linientyps in der Zeichnung sind. Er fragt nach dem neuen Faktor und bietet den aktuellen an, in einer neuen Zeichnung 1.0000: 2 macht jeden Strich doppelt so lang, 0.5 halb so lang. Der Faktor muss größer als 0 sein, sonst meldet er <Message id="positiveNonzero" /> und fragt erneut, und `1/2` und `1e3` werden als Zahlen gelesen. Eine Änderung zeichnet die ganze Zeichnung neu, `Regeneriert Modell.`, wie AutoCAD 2027 es meldet, und wird mit der Zeichnung gespeichert; sie ist ein Schritt, den <Command id="U" /> zurücknimmt. Mit einem Apostroph innerhalb eines Befehls eingegeben, `'LTFAKTOR`, wird die Zeichnung neu gezeichnet, wenn dieser Befehl endet.

Linientypen sind Muster, die für eine Zeichnung in Papiergröße gemacht sind: In einer Zeichnung von 4 Metern Breite, in Millimetern, wiederholt sich das Muster von CENTER, etwa 51 Einheiten lang, rund 80-mal darüber, zu fein, um sichtbar zu sein, und eine Linie, die kürzer als ein Muster ist, wird durchgezogen gezeichnet. Der zu verwendende Faktor ist meist der Maßstab der Zeichnung selbst: 20 für eine Zeichnung, die im Maßstab 1:20 gelesen wird, 50 bei 1:50.

## Missing

Der Linientyp-Manager, dessen globaler Skalierfaktor LTSCALE ist und dessen aktuelle Objektskalierung CELTSCALE. PSLTSCALE und MSLTSCALE, da es keinen Papierbereich gibt. Die Formen komplexer Linientypen wie BATTING, als ihre Lücken gezeichnet.

## Questions

### Wie lautet das Alias von LTFAKTOR (LTSCALE) in AutoCAD?

`LK`, dann die Eingabetaste oder die Leertaste. Der volle Name funktioniert ebenfalls, und `_LTSCALE` in jeder Sprache von AutoCAD.

### Warum wird meine gestrichelte Linie durchgezogen dargestellt?

Ihr Muster passt beim aktuellen Faktor nicht zur Zeichnung. Eine Linie, die kürzer als eine Wiederholung ihres Musters ist, wird durchgezogen gezeichnet; eine lange bei einem kleinen Faktor packt ihre Striche so dicht, dass sie durchgezogen aussieht. Erhöhen Sie LTFAKTOR für eine große Zeichnung, verringern Sie ihn für eine kleine, bis die Striche sichtbar sind.

### Welchen LTFAKTOR sollte ich verwenden?

Den Maßstab der Zeichnung: In einer Zeichnung in Millimetern, die im Maßstab 1:50 gelesen wird, `50`. Für eine Zeichnung in Papiergröße 1.

### Was ist der Unterschied zwischen LTFAKTOR und dem Linientyp selbst?

Der Linientyp, mit <Command id="LINETYPE" /> oder dem Layer festgelegt, ist das Muster: Striche, Punkte und Lücken. LTFAKTOR ist, wie lang dieses Muster gezeichnet wird, derselbe Faktor für jedes Objekt der Zeichnung.
