---
title: "Befehl FLÄCHE (AREA): Fläche messen in AutoCAD"
description: "So arbeitet AutoCADs FLÄCHE (AREA, Alias FL): Fläche und Umfang von Punkten oder einem Objekt, und eine Summe mit Fläche addieren und subtrahieren."
figure: "Eine Platte 100 mal 60 mit einem Loch mit Radius 18: FLÄCHE addiert die Fläche der Platte, subtrahiert die des Lochs und schreibt die verbleibende Summe."
sourceHash: "a8ad70c08b3a"
---

FLÄCHE (AREA) misst die Fläche und den Umfang einer geschlossenen Form, entweder einer, die Sie über ihre Ecken umreißen, oder eines Objekts, das Sie wählen. Geben Sie die erste Ecke an, dann die nächsten: Ab der zweiten füllt sich die durch den Cursor geschlossene Form durchscheinend grün, wie AutoCAD sie schattiert. Die Eingabetaste oder <Keyword id="Total" /> schreibt `Fläche = …, Umfang = …` an die Eingabeaufforderung und endet; die Eingabetaste vor der dritten Ecke wird abgelehnt. Mit Fläche addieren und Fläche subtrahieren führt sie eine Summe über mehrere Formen. Zahlen werden mit der Genauigkeit der Zeichnung geschrieben, und die zuletzt gemessene Fläche lässt sich durch Tippen von `'AREA` wieder abrufen.

## Options

### Object

Die Vorgabe der ersten Eingabeaufforderung, sodass die Eingabetaste sie wählt: Wählen Sie einen Kreis, eine Ellipse, eine geschlossene Polylinie oder einen Spline, eine Schraffur oder eine Region, und FLÄCHE schreibt ihre Fläche mit ihrem Umfang, bei einem Kreis den Kreisumfang. Eine offene Polylinie, ein offener Spline oder ein elliptischer Bogen wird durch eine gerade Linie von Ende zu Ende geschlossen, und FLÄCHE schreibt seine Länge. Eine Linie oder ein Text hat keine Fläche: <Message id="objectHasNoArea" />, und es fragt erneut.

### Add

Beginnt eine Summe: Jede danach gemessene Fläche, über Ecken oder mit <Keyword id="Object" />, wird addiert, und FLÄCHE schreibt sie und die Summe. Die Eingabetaste beendet die Objekte oder die Ecken und fragt erneut, bis die Eingabetaste bei der ersten Eingabeaufforderung endet.

### Subtract

Dasselbe, nur wird jede Fläche von der Summe abgezogen: die Platte, dann ihre Löcher.

### Undo

Nimmt die zuletzt angegebene Ecke zurück.

### Total

Schreibt die Fläche und den Umfang der angegebenen Ecken und endet.

## Missing

MEASUREGEOM, die Messwerkzeuge des Menübands, mit ihren Optionen Radius, Winkel, Volumen und Schnell: Hier führen die Schaltflächen Abstand und Fläche des Menübands DIST und AREA aus. Die Optionen Bogen und Länge beim nächsten Punkt von FLÄCHE. Ecken außerhalb der Ebene des aktuellen BKS werden in der Draufsicht gemessen, wo AutoCAD sie in 3D misst, und AutoCADs `Objekt nicht parallel zum BKS.` für ein Objekt in einem Winkel zum BKS wird nicht gemeldet.

## Questions

### Wie lautet das Kürzel für FLÄCHE (AREA) in AutoCAD?

`FL`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_AREA` in jeder Sprache von AutoCAD.

### Wie finde ich die Fläche einer Polylinie oder einer Schraffur?

Starten Sie FLÄCHE, drücken Sie die Eingabetaste, um <Keyword id="Object" /> zu wählen, und wählen Sie die geschlossene Polylinie oder die Schraffur: Ihre Fläche und ihr Umfang werden an die Eingabeaufforderung geschrieben. Die Fläche einer Schraffur lässt ihre Inseln aus.

### Wie ziehe ich in AutoCAD eine Fläche ab?

Wählen Sie <Keyword id="Add" /> und dann <Keyword id="Object" />, wählen Sie die äußere Form und drücken Sie die Eingabetaste; wählen Sie dann <Keyword id="Subtract" />, <Keyword id="Object" /> und wählen Sie jedes Loch. FLÄCHE schreibt nach jedem die verbleibende Summe; zweimal die Eingabetaste beendet.

### Wie erhalte ich die Fläche in Quadratmetern?

FLÄCHE schreibt Quadrat-Zeichnungseinheiten. Zeichnen Sie in Millimetern, teilen Sie durch 1.000.000: 6.000.000 sind 6 m². In Zentimetern durch 10.000.

### Warum sagt FLÄCHE, das Objekt habe keine Fläche?

Nur geschlossene Formen und Kurven haben eine: Linien, einzelne Bögen, Text und Bemaßungen nicht. Wählen Sie eine geschlossene Polylinie, einen Kreis oder eine Schraffur, oder verbinden Sie die Linien zuerst mit <Command id="JOIN" /> zu einer Polylinie; oder umreißen Sie die Form über ihre Ecken.
