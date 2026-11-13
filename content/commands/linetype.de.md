---
title: "Befehl LINIENTYP (LINETYPE) in AutoCAD"
description: "Wie LINIENTYP (LINETYPE, Alias LT) in AutoCAD den aktuellen Linientyp setzt: ByLayer, Set und ?, die sechs geladenen Linientypen. Zum Testen im Browser."
figure: "Eine Platte, deren Bohrung mit HIDDEN als aktuellem Linientyp gezeichnet ist und deren zwei Achsen mit CENTER, dann LINIENTYP zurück auf ByLayer gesetzt."
sourceHash: "1cae7261efc0"
---

LINIENTYP (LINETYPE) legt den Linientyp fest, mit dem neue Objekte gezeichnet werden. AutoCAD öffnet den Linientyp-Manager; MellowCAD hat noch keinen, daher führt LINIENTYP die Befehlszeilenform aus, die AutoCAD auch hat, <Command id="-LINETYPE" />. Er meldet den aktuellen Linientyp, zunächst `ByLayer`, und fragt nach jeder Antwort erneut nach einer Option, bis die Eingabetaste ihn beendet. ByLayer bedeutet, dass jedes Objekt den Linientyp seines Layers annimmt; ein stattdessen benannter Linientyp ist der des Objekts selbst. Der ganze Durchlauf ist ein Schritt, den <Command id="U" /> zurücknimmt, und mit einem Apostroph innerhalb eines Befehls eingegeben, gilt sein Linientyp für das, was dieser Befehl als Nächstes zeichnet.

Jede Zeichnung hat sechs geladene Linientypen: Continuous und, aus AutoCADs metrischer Datei acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM und DASHDOT. Ein Muster wird auf jede Linie so gelegt, wie AutoCAD es legt, entlang ihrer Länge zentriert, mit gleich langen Strichen an beiden Enden.

## Options

### ?

Listet Linientypen in zwei Spalten auf, Name und Beschreibung. Bei der Optionen-Eingabeaufforderung die Linientypen von acadiso.lin; bei der Eingabeaufforderung von Set die in der Zeichnung geladenen, deren Namen zu dem passen, was Sie eingeben, alle mit `*`.

### Set

Fragt nach dem Namen des Linientyps und bietet den aktuellen an; geben Sie den Namen eines geladenen Linientyps ein, oder <Keyword id="BYLayer" />. Ein Name, der nicht geladen ist, wird nicht gefunden, wie AutoCAD es meldet, und die Optionen-Eingabeaufforderung kehrt zurück; die Eingabetaste behält den aktuellen.

## Missing

Der Linientyp-Manager und das Laden, Erstellen oder Beschreiben von Linientypen: Es gibt nur die sechs oben, und die Auflistung beschreibt nur Continuous. Ein Linientypfaktor je Objekt (CELTSCALE): nur der der Zeichnung, <Command id="LTSCALE" />. VonBlock. PSLTSCALE und MSLTSCALE, da es keinen Papierbereich gibt. Die Linientypnamen des deutschen AutoCAD: Sie sind hier in jeder Sprache englisch. PLINEGEN: Eine neue Polylinie beginnt ihr Muster an jedem Scheitelpunkt neu, es sei denn, die Option Ltype gen von PEDIT schaltet es ein.

## Questions

### Wie lautet das Alias von LINIENTYP (LINETYPE) in AutoCAD?

`LT`, dann die Eingabetaste oder die Leertaste; `LTYP` und `DDLTYPE` ebenfalls. Der volle Name funktioniert auch, und `_LINETYPE` in jeder Sprache von AutoCAD.

### Warum wird meine gestrichelte Linie durchgezogen dargestellt?

Eine Linie, die kürzer ist als eine Wiederholung ihres Musters, wird durchgezogen gezeichnet, wie in AutoCAD: Das Muster von CENTER ist beim vorgegebenen Faktor etwa 51 Einheiten lang. Erhöhen oder verringern Sie <Command id="LTSCALE" />, um das Muster der Zeichnung anzupassen. Prüfen Sie auch, ob der Linientyp des Objekts oder, bei ByLayer, der seines Layers nicht Continuous ist.

### Wie ändert man den Linientyp eines vorhandenen Objekts?

Wählen Sie es aus und wählen Sie den Linientyp in der Zeile Linientyp der Eigenschaftenpalette, oder übertragen Sie ihn von einem anderen Objekt mit <Command id="MATCHPROP" />. LINIENTYP legt nur den Linientyp von Objekten fest, die danach gezeichnet werden.

### Wie ändert man den Linientypfaktor in AutoCAD?

Geben Sie <Command id="LTSCALE" /> und den neuen Faktor ein: 2 macht jeden Strich in der ganzen Zeichnung doppelt so lang.
