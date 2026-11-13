---
title: "Befehl MTEXT (Absatztext) in AutoCAD"
description: "So arbeitet AutoCADs MTEXT (Alias T): zwei Ecken oder Breite, Höhe, Ausrichten und Zeilenabstand, Absätze umbrochen in einem Objekt. Online gratis testen."
figure: "Eine Notiz in einem Rahmen: zuerst die Höhe, dann die gegenüberliegende Ecke und ein Absatz, der auf die Breite dazwischen umbrochen wird."
sourceHash: "a53001f9674d"
---

MTEXT (in der deutschen AutoCAD-Version ebenfalls MTEXT, mit den Aliasen `MT` und `T`) schreibt mehrzeiligen Text, Absatztext: ein Objekt mit Absätzen, die auf eine Breite umgebrochen werden. Sie wählen eine erste Ecke und die gegenüberliegende, und der Rahmen dazwischen legt die Breite fest; dann tippen Sie in einem an Ort und Stelle gezeichneten Editor, in dem die Eingabetaste einen neuen Absatz beginnt und Strg+Eingabe oder ein Klick außerhalb des Rahmens den Text behält. Esc mit getipptem Text fragt, ob er gespeichert werden soll, wie AutoCADs Dialogfeld Nicht gespeicherte Änderungen. Für Zeilen, die je ein eigenes Objekt sind, verwenden Sie <Command id="TEXT" />.

Die erste Zeile zeigt den aktuellen Stil und die Höhe. Jede Option wird bei der Eingabeaufforderung der gegenüberliegenden Ecke gefragt und kehrt zu ihr zurück, sodass ein Durchlauf Höhe, Ausrichtung und den Rest festlegt, bevor der Rahmen geschlossen wird. Wörter werden umgebrochen, wo eine Zeile die Breite überschreiten würde, und ein Wort, das länger als die Breite ist, ragt darüber hinaus. Die Höhe teilt sich <Command id="TEXT" /> und wird in der Zeichnung gespeichert; Ausrichtung, Drehung und Zeilenabstand beginnen bei jedem Durchlauf mit ihren Vorgaben. <Command id="-MTEXT" /> fragt dasselbe und nimmt dann den Text in der Befehlszeile entgegen, Zeile für Zeile.

## Options

### Height

Legt die Texthöhe fest, getippt oder als Abstand von der ersten Ecke zu einem Punkt; sie muss größer als null sein. Sie bleibt für den nächsten Durchlauf und für <Command id="TEXT" />.

### Justify

Legt fest, an welchem der neun Punkte des Rahmens der Text hängt: standardmäßig oben links, oder oben, Mitte und unten bei links, zentriert und rechts, wie die Eingabeaufforderung sie auflistet. Der Text hängt an diesem Punkt des Rahmens, in welche Richtung der Rahmen auch aufgezogen wurde.

### Line spacing

Fragt nach der Art, Mindestens (die Vorgabe), die Platz für eine Zeile mit höheren Buchstaben lässt, oder Genau, dann nach einem Faktor mit einem x, etwa `2x`, oder einem Abstand. Einfacher Abstand ist 1x, und der Faktor reicht von 0,25x bis 4x.

### Rotation

Dreht den Rahmen und seinen Text, um einen getippten oder von der ersten Ecke aus angegebenen Winkel.

### Style

Macht einen Textstil aktuell, nach Namen; <Keyword id="?" /> listet die Stile der Zeichnung auf, und ein Name, den es nicht gibt, wird abgelehnt. Stile werden in der Palette erstellt, die <Command id="STYLE" /> öffnet.

### Width

Fragt statt nach der gegenüberliegenden Ecke nach der Breite, getippt oder als Abstand zu einem Punkt, und öffnet dann den Editor. Eine Breite von 0 oder die Eingabetaste lässt die Zeilen ohne Umbruch, jede so lang wie getippt.

## Missing

Spalten, die AutoCAD 2027 bei der Eingabeaufforderung der gegenüberliegenden Ecke auflistet, werden nicht angeboten. Formatierung innerhalb des Textes, etwa Höhe, Schriftart oder Farbe eines Wortes, gestapelte Brüche oder Unterstreichung, wird nicht gezeichnet oder angewendet, und der Editor hat kein Lineal, keine Tabulatoren, Einzüge, Listen oder Registerkarte Texteditor im Menüband, auch keine Einfügemarke in der Zeichnung. Es gibt keine Hintergrundmaske und keinen Textrahmen, keine definierte Höhe, keine annotative Skalierung und keinen Objektfang Node an seinen Ecken, und ein Klick innerhalb seines Rahmens wählt ihn auch abseits seiner Buchstaben, wo AutoCAD nichts wählt.

## Questions

### Wie lautet das Kürzel für MTEXT in AutoCAD?

`T` oder `MT`, danach Eingabetaste oder Leertaste; `_MTEXT` in jeder Sprache von AutoCAD. <Command id="-MTEXT" />, `-T`, fragt dasselbe und nimmt den Text in der Befehlszeile entgegen.

### Wie beginne ich in Absatztext eine neue Zeile?

Drücken Sie die Eingabetaste: Sie beginnt einen neuen Absatz. Innerhalb eines Absatzes werden die Zeilen von selbst an der Breite des Rahmens umgebrochen. Strg+Eingabe oder ein Klick außerhalb des Rahmens schließt den Editor und behält den Text.

### Wie ändere ich die Breite von Absatztext?

Wählen Sie ihn aus und ziehen Sie den Griff an seiner Seite: Der Text wird neu umgebrochen, während sich die Breite ändert, um seinen Ausrichtungspunkt. Die Definierte Breite der Eigenschaftenpalette tut es per Zahl, und ihre Zeilen zum Zeilenabstand ändern den Abstand.

### Wie wandle ich MTEXT in einzeiligen Text um?

Zerlegen Sie ihn mit <Command id="EXPLODE" />: Jede seiner Zeilen wird zu einem <Command id="TEXT" />, linksbündig dort, wo die Zeile stand, wie AutoCAD es tut. Doppelklicken Sie ihn stattdessen, um ihn in seinem Editor neu zu tippen.
