---
title: "Befehl LINIENTYP (LINETYPE) in AutoCAD"
description: "Wie LINIENTYP (LINETYPE, Alias LT) in AutoCAD arbeitet: Linientypen aus acadiso.lin laden, der aktuelle für neue Objekte, ByLayer, und warum Striche fehlen."
figure: "Eine Platte, deren Bohrung mit HIDDEN als aktuellem Linientyp gezeichnet ist und deren zwei Achsen mit CENTER, dann LINIENTYP zurück auf ByLayer gesetzt."
sourceHash: "d15530a865c1"
---

LINIENTYP (LINETYPE) legt den Linientyp fest, mit dem neue Objekte gezeichnet werden. AutoCAD öffnet den Linientyp-Manager; MellowCAD hat noch keinen, daher führt LINIENTYP die Befehlszeilenform aus, die AutoCAD auch hat, <Command id="-LINETYPE" />. Er meldet den aktuellen Linientyp, zunächst `ByLayer`, und fragt nach jeder Antwort erneut nach einer Option, bis die Eingabetaste ihn beendet. ByLayer bedeutet, dass jedes Objekt den Linientyp seines Layers annimmt; ein stattdessen benannter Linientyp ist der des Objekts selbst. Der ganze Durchlauf ist ein Schritt, den <Command id="U" /> zurücknimmt, und mit einem Apostroph innerhalb eines Befehls eingegeben, gilt sein Linientyp für das, was dieser Befehl als Nächstes zeichnet.

Eine Zeichnung enthält ihre eigenen Linientypen, mit ihr und in ihrem DXF gespeichert. Eine neue hat sechs: Continuous und, aus AutoCADs metrischer Datei acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM und DASHDOT; die anderen werden aus acadiso.lin geladen, und ein DXF bringt seine eigenen mit, auch ISO- und komplexe Linientypen, deren Text, etwa `GAS` von GAS_LINE, entlang der Linie gezeichnet wird. Ein Muster wird auf jede Linie so gelegt, wie AutoCAD es legt, entlang ihrer Länge zentriert, mit gleich langen Strichen an beiden Enden, skaliert mit <Command id="LTSCALE" /> und mit dem eigenen Linientypfaktor des Objekts, den <Command id="CHPROP" /> und die Eigenschaftenpalette einstellen und den CELTSCALE neuen Objekten gibt.

## Options

### ?

Listet Linientypen in zwei Spalten auf, Name und Beschreibung. Bei der Optionen-Eingabeaufforderung fragt er, welche Datei aufgelistet werden soll, standardmäßig acadiso.lin oder acad.lin, AutoCADs Datei in Zoll, und listet deren Linientypen in der Reihenfolge der Datei auf; bei der Eingabeaufforderung von Set die in der Zeichnung geladenen, deren Namen zu dem passen, was Sie eingeben, alle mit `*`, nach Namen sortiert.

### Load

Fragt, welche Linientypen geladen werden sollen, ein Name oder mehrere, durch Kommas getrennt, auch mit Platzhaltern (`DASH*`), dann, in welcher Datei gesucht werden soll, zunächst acadiso.lin und danach die zuletzt durchsuchte. Jeder gefundene wird geladen und gemeldet, in der Reihenfolge der Datei; bei einem bereits geladenen wird zuerst nachgefragt, und <Keyword id="Yes" />, die Vorgabe, lädt ihn erneut. Ein Name, den die Datei nicht enthält, oder eine andere Datei als acadiso.lin und acad.lin wird gemeldet.

### Set

Fragt nach dem Namen des Linientyps und bietet den aktuellen an; geben Sie den Namen eines geladenen Linientyps ein, oder <Keyword id="BYLayer" />. Einer, den acadiso.lin enthält, wird zuerst geladen, wie AutoCAD es tut; jeder andere wird nicht gefunden, wie AutoCAD es meldet, und die Optionen-Eingabeaufforderung kehrt zurück. Die Eingabetaste behält den aktuellen.

## Missing

Der Linientyp-Manager und das Erstellen von Linientypen oder das Laden aus einer eigenen Datei. Die Formen komplexer Linientypen wie BATTING oder ZIGZAG, gezeichnet als die Lücken, für die sie stehen. VonBlock. PSLTSCALE und MSLTSCALE, da es keinen Papierbereich gibt. Die acadiso.lin des AutoCAD jeder Sprache, deren Namen das spanische oder deutsche AutoCAD lädt (TRAZOS, STRICHLINIE): Load liest in jeder Sprache die englische, doch eine damit erstellte Zeichnung öffnet sich mit ihren eigenen. PLINEGEN: Eine neue Polylinie beginnt ihr Muster an jedem Scheitelpunkt neu, es sei denn, die Option Ltype gen von PEDIT schaltet es ein.

## Questions

### Wie lautet das Alias von LINIENTYP (LINETYPE) in AutoCAD?

`LT`, dann die Eingabetaste oder die Leertaste; `LTYP` und `DDLTYPE` ebenfalls. Der volle Name funktioniert auch, und `_LINETYPE` in jeder Sprache von AutoCAD.

### Warum wird meine gestrichelte Linie durchgezogen dargestellt?

Eine Linie, die kürzer ist als eine Wiederholung ihres Musters, wird durchgezogen gezeichnet, wie in AutoCAD: Das Muster von CENTER ist beim vorgegebenen Faktor etwa 51 Einheiten lang. Erhöhen oder verringern Sie <Command id="LTSCALE" />, um das Muster der Zeichnung anzupassen. Prüfen Sie auch, ob der Linientyp des Objekts oder, bei ByLayer, der seines Layers nicht Continuous ist.

### Wie ändert man den Linientyp eines vorhandenen Objekts?

Wählen Sie es aus und wählen Sie den Linientyp in der Zeile Linientyp der Eigenschaftenpalette, oder übertragen Sie ihn von einem anderen Objekt mit <Command id="MATCHPROP" />. LINIENTYP legt nur den Linientyp von Objekten fest, die danach gezeichnet werden.

### Wie ändert man den Linientypfaktor in AutoCAD?

Geben Sie <Command id="LTSCALE" /> und den neuen Faktor ein: 2 macht jeden Strich in der ganzen Zeichnung doppelt so lang.

### Wie lädt man einen Linientyp in AutoCAD?

AutoCAD lädt ihn im Linientyp-Manager. Hier geben Sie `-LINIENTYP` ein, wählen <Keyword id="Load" />, geben den Namen des Linientyps ein, etwa `HIDDEN2` oder `ACAD_ISO02W100`, und drücken die Eingabetaste, um acadiso.lin zu durchsuchen. <Keyword id="Set" /> lädt einen Linientyp, den acadiso.lin enthält, während es ihn aktuell setzt.
