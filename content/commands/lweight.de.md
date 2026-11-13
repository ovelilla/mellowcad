---
title: "Befehl LSTÄRKE (LWEIGHT) in AutoCAD: Linienstärke"
metaTitle: "Befehl LSTÄRKE (LWEIGHT) in AutoCAD"
description: "Wie LSTÄRKE (LWEIGHT, Alias LST) in AutoCAD die Linienstärke einstellt: die 24 Standardwerte, VonLayer, Rundung auf den nächsten Wert. Zum Testen im Browser."
figure: "Eine Platte mit 0,70 mm umrissen, dann 0.1 für ihre Bohrung eingegeben, auf 0,09 mm gerundet: die beiden Stärken, wie der Bildschirm sie zeigt."
sourceHash: "154784b2b402"
---

LSTÄRKE (LWEIGHT) legt die Linienstärke fest, mit der neue Objekte gezeichnet werden, in Millimetern. AutoCAD öffnet den Dialog „Linienstärkeeinstellungen“; MellowCAD hat noch keinen, daher führt LSTÄRKE die Befehlszeilenform aus, die AutoCAD auch hat, <Command id="-LWEIGHT" />. Er meldet die aktuelle Linienstärke, zunächst `BYLAYER`, und fragt nach einer neuen: einer der 24 Standardwerte von AutoCAD, von 0.00 bis 2.11 mm. Jeder andere Wert wird auf den nächsten Standardwert gesetzt, und er meldet es, und ein negativer wird mit <Message id="invalidLineweightNumber" /> abgelehnt. Die Eingabetaste behält die aktuelle Linienstärke. Jede Änderung ist ein Schritt, den <Command id="U" /> zurücknimmt.

Linienstärken werden hier von Anfang an auf dem Bildschirm gezeigt: AutoCAD zeigt sie erst, wenn die Schaltfläche „Linienstärke“ der Statusleiste (LWDISPLAY) eingeschaltet ist, doch da MellowCAD keine Layouts oder Plots hat, ist der Bildschirm der einzige Ort, an dem sie sich zeigen könnten. Die Schaltfläche schaltet sie aus und ein. Eine breite Polylinie zeigt in der Draufsicht ihre Breite, nicht ihre Linienstärke.

## Options

### ?

Listet die Werte auf, die er annimmt, VonLayer und die 24 Standardlinienstärken, und fragt dann erneut.

### BYLAYER

Neue Objekte übernehmen die Linienstärke ihres Layers, wie am Anfang.

## Missing

VonBlock und Standard (LWDEFAULT), Linienstärken in Zoll, der Dialog „Linienstärkeeinstellungen“ und der Eintrag „Linienstärkeeinstellungen …“ der Auswahlliste.

## Questions

### Wie lautet das Alias von LSTÄRKE (LWEIGHT) in AutoCAD?

`LST`, dann die Eingabetaste oder die Leertaste; `LINIENSTÄRKE` ist ebenfalls ein Alias. Der volle Name funktioniert auch, und `_LWEIGHT` in jeder Sprache von AutoCAD.

### Warum wird die Linienstärke in AutoCAD nicht angezeigt?

In AutoCAD werden Linienstärken nur bei eingeschalteter Schaltfläche „Linienstärke“ der Statusleiste (LWDISPLAY 1) auf dem Bildschirm gezeigt; sie ist zunächst aus. Hier ist sie zunächst ein. Die dünnen Linienstärken werden alle als die dünnste Linie des Bildschirms gezeichnet, der Unterschied zeigt sich also an den dickeren; und ein Objekt, dessen Linienstärke VonLayer ist, übernimmt die seines Layers.

### Wie ändert man die Linienstärke eines vorhandenen Objekts?

Wählen Sie es aus und wählen Sie die Linienstärke in der Zeile Linienstärke der Eigenschaftenpalette, oder bei VonLayer die eigene Linienstärke des Layers im Layer-Eigenschaften-Manager. LSTÄRKE legt nur die Linienstärke von Objekten fest, die danach gezeichnet werden.

### Welche Linienstärken hat AutoCAD?

24 feste Werte in Millimetern: 0.00, 0.05, 0.09, 0.13, 0.15, 0.18, 0.20, 0.25, 0.30, 0.35, 0.40, 0.50, 0.53, 0.60, 0.70, 0.80, 0.90, 1.00, 1.06, 1.20, 1.40, 1.58, 2.00 und 2.11. Geben Sie einen anderen ein, etwa 0.45, und LSTÄRKE nimmt den nächsten, bei Gleichstand den dünneren.
