---
title: "Befehl MASSEIG (MASSPROP) in AutoCAD"
description: "Wie MASSEIG (MASSPROP) in AutoCAD die Masseneigenschaften von 3D-Volumenkörpern und Regionen meldet: Volumen, Fläche, Schwerpunkt, Trägheitsmomente, .mpr-Datei."
figure: "Ein Quader von 60 mal 40 mal 25 im Ursprung: MASSEIG schreibt sein Volumen, seinen Begrenzungsrahmen, seinen Schwerpunkt und seine Momente, und die Eingabetaste lehnt die Datei ab."
sourceHash: "a0286a5d599e"
---

MASSEIG (MASSPROP) misst 3D-Volumenkörper und Regionen. Wählen Sie sie und drücken Sie die Eingabetaste: Der Bericht wird in der Befehlszeile in den Spalten von AutoCAD geschrieben, dann fragt der Befehl, ob er in eine Datei geschrieben werden soll. Eine Menge ohne beides ergibt <Message id="massPropNoneSelected" /> und endet.

Bei Volumenkörpern wird die Menge als ein Körper mit einer Dichte von 1 gemessen, die Masse ist also das Volumen: Masse, Volumen, Begrenzungsrahmen, Schwerpunkt, Trägheitsmomente, Deviationsmomente und Trägheitsradien, alle bezogen auf das aktuelle BKS, dann die Hauptträgheitsmomente um den Schwerpunkt mit ihren Richtungen. Sich überschneidende Volumenkörper werden doppelt gezählt. Bei Regionen in der XY-Ebene des BKS: Fläche, Umfang, Begrenzungsrahmen, Schwerpunkt, Momente und Deviationsmoment, Trägheitsradien und Hauptträgheitsmomente; eine Region außerhalb dieser Ebene ergibt nur ihre Fläche, ihren Umfang, ihren Begrenzungsrahmen und ihren Schwerpunkt. Regionen kommen zuerst, dann Volumenkörper; Regionen außerhalb der Ebene der ersten werden ausgelassen und gezählt. Zahlen werden mit der Genauigkeit der Zeichnung geschrieben, die <Command id="UNITS" /> festlegt, und sie sind exakt, die der Volumenkörper Fläche für Fläche integriert. MASSEIG ändert nichts in der Zeichnung; es wird eingegeben, wie in AutoCAD, dessen Menüband keine Schaltfläche dafür hat.

## Options

### Yes

Bei der Frage nach der Datei, deren Vorgabe <Keyword id="No" /> ist: schreibt den Bericht in eine Datei, wie AutoCAD ihn schreibt, Zeile für Zeile. In AutoCAD fragt ein Dialogfeld, wohin; in einem Browser ist der Download dieses Dialogfeld, und die Datei wird nach der Zeichnung benannt, `.mpr`.

## Missing

Einheiten nach jeder Zahl bei architektonischen oder technischen Einheiten (`sq in`, `cu in`, `lb`), die AutoCAD schreibt: Hier folgt auf eine Zahl keine Einheit. Die Wahl des Dateinamens und die Frage vor dem Ersetzen einer Datei. Weit vom Ursprung entfernt schreibt AutoCAD große Zahlen in Exponentialform und verliert Stellen, und seine letzte Stelle kann durch seine eigene Rundung abweichen: Die von MellowCAD sind exakt. Bei einem Volumenkörper mit zwei gleichen Hauptträgheitsmomenten das Richtungspaar, das die Rundung von AutoCAD wählt.

## Questions

### Wie ermittle ich das Volumen eines 3D-Volumenkörpers in AutoCAD?

Starten Sie MASSEIG, wählen Sie den Volumenkörper und drücken Sie die Eingabetaste: Das Volumen ist die zweite Zeile des Berichts. Der Quader der Sitzung von 60 mal 40 mal 25 ergibt 60000. Drücken Sie bei der Frage nach der Datei die Eingabetaste, um zu beenden.

### Wie ermittle ich den Schwerpunkt einer Form?

Machen Sie sie mit <Command id="REGION" /> zu einer Region oder zu einem Volumenkörper, starten Sie dann MASSEIG und wählen Sie sie: Schwerpunkt gibt ihr X und Y an, bei einem Volumenkörper auch Z, im aktuellen BKS.

### Warum meldet MASSEIG, dass keine Volumenkörper oder Regionen gewählt sind?

Was Sie gewählt haben, ist keines von beiden: Linien, Polylinien, Kreise und Schraffuren haben keine Masseneigenschaften, und ein Block mit einem Volumenkörper ist kein Volumenkörper. Machen Sie geschlossene Formen mit <Command id="REGION" /> zu Regionen oder mit <Command id="EXTRUDE" /> zu Volumenkörpern.

### Warum ist die Masse gleich dem Volumen?

MASSEIG misst mit einer Dichte von 1, wie AutoCAD: Volumenkörper haben hier kein Material. Multiplizieren Sie das Volumen mit der Dichte des Materials für seine tatsächliche Masse.
