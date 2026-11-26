---
title: "Befehl SCHRAFF (HATCH) in AutoCAD"
description: "Wie SCHRAFF (HATCH, Alias SCH, GS) in AutoCAD eine Fläche schraffiert, Schritt für Schritt: Punkt oder Objekte, Muster, Maßstab, Winkel, Inseln. Zum Testen."
figure: "Ein Rechteck mit einem Kreis darin, mit ANSI31 von einem Punkt innerhalb schraffiert: Der Kreis bleibt frei, eine Insel."
sourceHash: "c7c3effeb1c0"
---

SCHRAFF (HATCH) füllt eine geschlossene Fläche mit einem Linienmuster oder voll. Wählen Sie einen Punkt innerhalb der Fläche, und der Befehl findet die Begrenzung in den Objekten ringsum und lässt frei, was darin liegt, als Insel: einen Kreis in einem Rechteck, einen Text; oder wählen Sie die Objekte, die sie begrenzen. Wählen Sie beliebig viele Flächen: Die Eingabetaste oder Esc macht aus allen eine Schraffur, auf dem aktuellen Layer, hinter ihrer Begrenzung. Der ganze Befehl ist ein Rückgängig-Schritt.

Während er läuft, zeigt die Multifunktionsleiste die Registerkarte „Schraffurerstellung“, wie die von AutoCAD: „Punkte wählen“ und „Wahl“, den Musterkatalog, „Schraffurtyp“ („Kompakt“ oder „Muster“), „Winkel“, „Schraffurmuster-Skalierung“ und „Schraffurerstellung schließen“. Bei geschlossener Multifunktionsleiste öffnet AutoCAD das Dialogfeld „Schraffur und Abstufung“, das MellowCAD nicht hat: Dort stellt SCHRAFF in der Befehlszeile dieselben Fragen wie <Command id="-HATCH" />, das Muster unter <Keyword id="Properties" />. Esc behält die Schraffur, während es unter <Command id="-HATCH" /> die Flächen verwirft. Jede Schraffur beginnt mit dem Muster, dem Maßstab und dem Winkel, die die letzte erhalten hat: ANGLE, mit Maßstab 1 und Winkel 0, in einer neuen Zeichnung.

## Options

### Properties

Wird bei geschlossener Multifunktionsleiste in der Befehlszeile abgefragt, oder unter <Command id="-HATCH" />; bei offener Multifunktionsleiste legt die Registerkarte dieselben drei fest. Fragt nach dem Namen des Musters, in beliebiger Schreibweise, und bietet das aktuelle an: <Keyword id="Solid" /> füllt die Fläche, und <Keyword id="?" /> listet die Muster mit ihren Beschreibungen auf und kehrt dann zum Punkt zurück. Bei einem Muster fragt er dann nach dem Maßstab, einer Zahl größer als 0 oder zwei gemessenen Punkten, und nach dem Winkel, eingegeben oder durch zwei Punkte. Die nächste Schraffur behält alle drei.

<Session name="hatchPatterns" caption="SOLID und elf Muster aus acadiso.pat, jedes in einem Quadrat der Seitenlänge 30 mit Maßstab 1 schraffiert, AR-CONC und AR-SAND mit 0,08 und 0,1." />

### Select objects

Statt eines Punktes innerhalb wählen Sie die Objekte, die die Fläche begrenzen; bei offener Multifunktionsleiste fragt er nach jeder Auswahl erneut, wobei <Keyword id="Pick internal point" /> zum Punkt zurückkehrt und die Eingabetaste den Befehl beendet, bei geschlossener kehrt die Eingabetaste zum Punkt zurück. Ein Objekt, das keine Fläche schließt, wird ausgelassen; begrenzt keines davon eine Fläche, meldet der Befehl bei der Eingabetaste <Message id="unableToHatchBoundary" /> und erzeugt nichts. Eine Region liefert ihren Umriss, ihre Löcher als Inseln.

### Undo

An der Eingabeaufforderung der Multifunktionsleiste aufgeführt, an der von <Command id="-HATCH" /> nicht aufgeführt, aber angenommen: Es nimmt die Flächen des zuletzt gewählten Punktes zurück und fragt erneut, wobei die Objekte gewählt bleiben; bei der Objektwahl nimmt es die letzte Auswahl zurück. Es meldet <Message id="noBoundaryToUndo" />, wenn kein Punkt mehr zurückzunehmen ist.

## Missing

Ellipsen und Splines als Begrenzung: Eine Fläche, die sie schließen, wird nicht gefunden, und eine Region mit einer solchen Kante wird ausgelassen. Lückentoleranz (HPGAPTOL): Eine Fläche muss genau geschlossen sein. Assoziative Schraffuren, die Inselerkennungsstile Normal und Ignorieren. Abstufungen, benutzerdefinierte Muster und die übrigen Muster von acadiso.pat werden hier nicht erstellt: Nur die Schraffuren einer DXF bringen sie mit, Abstufungen in ihren Farben und Muster mit ihren Linien. Die weiteren Optionen von -HATCH: Begrenzung zeichnen, Begrenzungen entfernen, Erweitert, Zeichnungsreihenfolge, Ursprung, Annotativ, Farbe, Layer und Transparenz; die Optionen Zeichnen und Einstellungen der Eingabeaufforderung der Multifunktionsleiste. Von „Schraffurerstellung“: „Entfern“ und „Neu erstellen“, die Typen Abstufung und Benutzerdefiniert, Farben, Transparenz, Ursprung und Optionen. SCHRAFFEDIT (HATCHEDIT) und der Schraffureditor, den in AutoCAD ein Doppelklick öffnet. MIRRHATCH 1: Eine gespiegelte Schraffur behält immer den Winkel ihres Musters. Die Menüs der Griffe einer Schraffur.

## Questions

### Wie heißt der Befehl HATCH auf Deutsch, und wie lautet sein Alias?

SCHRAFF, englisch HATCH. Die Aliase sind `SCH` und `GS`, dann die Eingabetaste oder die Leertaste; `BH` gibt es hier ebenfalls. Er öffnet die Registerkarte „Schraffurerstellung“; `-SCHRAFF` (<Command id="-HATCH" />) fragt alles in der Befehlszeile ab. `_HATCH` funktioniert in jeder Sprache von AutoCAD.

### Warum funktioniert die Schraffur nicht?

Meistens, weil die Fläche nicht geschlossen ist: Er meldet <Message id="hatchNoBoundary" />, und die kleinste Lücke genügt, da nichts eine überbrückt. Schließen Sie den Umriss und wählen Sie erneut. Eine Fläche, die eine Ellipse oder ein Spline schließt, wird noch nicht gefunden, und Objekte auf einem ausgeschalteten Layer werden nicht erkannt.

### Welche Schraffurmuster gibt es, und kann ich weitere herunterladen?

Eine Auswahl aus acadiso.pat, AutoCADs metrischer Musterdatei: SOLID, ANGLE, ANSI31 bis ANSI38, AR-CONC, AR-SAND, BRICK, CROSS, DASH, DOTS, EARTH, HONEY, LINE, NET, NET3, SQUARE, STEEL und ZIGZAG. Die Registerkarte „Schraffurerstellung“ zeigt sie; <Keyword id="?" /> unter <Keyword id="Properties" /> listet sie auf. Eine eigene oder heruntergeladene Musterdatei lässt sich noch nicht laden, aber die Schraffuren einer DXF öffnen sich mit dem Muster, das sie enthalten, welches es auch sei, so wie AutoCAD sie zeichnet.

### Wie ändert man den Maßstab einer Schraffur?

Während der Wahl in „Schraffurmuster-Skalierung“ auf der Registerkarte „Schraffurerstellung“, oder unter <Keyword id="Properties" /> mit <Command id="-HATCH" />, nach dem Namen des Musters. Danach wählen Sie die Schraffur und geben den Maßstab in der Eigenschaftenpalette neu ein, oder Sie übertragen Muster, Maßstab und Winkel einer anderen Schraffur mit <Command id="MATCHPROP" />. Bei einem so kleinen Maßstab, dass das Muster zu viele Linien bräuchte, meldet der Befehl <Message id="hatchTooDense" /> und erzeugt keine Schraffur.

### Wie ermittelt man die Fläche einer Schraffur?

Wählen Sie sie und lesen Sie Fläche unter Geometrie in der Eigenschaftenpalette ab, ihre Inseln ausgenommen; bei mehreren gewählten addiert die Gesamtfläche sie. Oder starten Sie <Command id="AREA" />, wählen Sie <Keyword command="AREA" id="Object" /> und wählen Sie die Schraffur.
