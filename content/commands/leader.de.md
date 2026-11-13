---
title: "Befehl FÜHRUNG (LEADER) in AutoCAD"
description: "Wie FÜHRUNG (LEADER) in AutoCAD funktioniert: eine Führungslinie von der Pfeilspitze zum Text, der Haken, die Formatoptionen und der Unterschied zu MLEADER."
figure: "Eine Bohrung und ihre Anmerkung: FÜHRUNG vom Rand des Kreises, zwei Punkte, dann zwei Textzeilen; das letzte Segment steigt an, deshalb verbindet ein Haken es mit dem Text."
sourceHash: "1bf39ac320fd"
---

FÜHRUNG (LEADER) zeichnet eine Linie von einer Pfeilspitze zu einer Anmerkung. Wählen Sie den Startpunkt, an dem die Pfeilspitze sitzt, dann beliebig viele weitere Punkte; ab dem zweiten bietet die Eingabeaufforderung <Keyword id="Annotation" /> an, was auch die Eingabetaste wählt, sowie <Keyword id="Format" /> und <Keyword id="Undo" />. Die Eingabetaste bei den ersten beiden Punkten beendet den Befehl, ohne etwas zu zeichnen. Danach geben Sie die Anmerkung Zeile für Zeile ein, mit der Eingabetaste nach jeder, und beenden sie mit der Eingabetaste auf einer leeren Zeile: Die Führungslinie und ihr Text, ein mehrzeiliger Text, entstehen zusammen in einem Schritt, auf dem aktuellen Layer mit der aktuellen Farbe, dem aktuellen Linientyp und der aktuellen Linienstärke.

Der Text übernimmt Höhe, Abstand zur Linie und Lage vom aktuellen Bemaßungsstil: hinter dem Ende der Führungslinie oder davor, wenn sie von rechts kommt, und über der letzten Zeile, die unter dem Text weiterläuft. Steigt das letzte Segment um mehr als 15° gegenüber der Waagerechten an, fügt FÜHRUNG einen Haken hinzu, eine kurze waagerechte Linie in der Länge der Pfeilspitze, die an dem Punkt endet, den Sie gewählt haben. Die Pfeilspitze ist die geschlossene, gefüllte und wird nur gezeichnet, wenn das erste Segment mindestens doppelt so lang ist wie sie.

Die Führungslinie folgt ihrem Text: Verschieben, drehen oder skalieren Sie den Text, und das Ende der Führungslinie geht mit, der Haken wird neu berechnet; löschen Sie den Text, bleibt die Führungslinie ohne Haken zurück. Eine zusammen mit ihrem Text kopierte Führungslinie bleibt ein Paar. Die Griffe der Führungslinie liegen an ihren Punkten; die Eigenschaftenpalette zeigt ihren Typ, die Pfeilgröße, den Textversatz und die Textposition sowie ihren Maßstab.

## Options

### Annotation

Fragt nach dem Text, Zeile für Zeile. Die Eingabetaste bei der ersten Zeile fragt stattdessen nach einer anderen Art von Anmerkung: <Keyword id="Mtext" /> (die Vorgabe) öffnet den Texteditor am Ende der Führungslinie, wo die Eingabetaste eine Zeile umbricht und Strg+Eingabetaste oder ein Klick außerhalb abschließt; <Keyword id="Copy" /> setzt eine Kopie eines mehrzeiligen Textes, eines einzeiligen Textes oder eines Blockverweises, den Sie wählen, an das Ende und lehnt alles andere mit <Message id="leaderCopyRefused" /> ab; <Keyword id="None" /> zeichnet nur die Führungslinie.

### Format

Legt fest, wie die Führungslinie gezeichnet wird, und kehrt dann zu den Punkten zurück: <Keyword id="Spline" /> macht sie zu einer glatten Kurve durch die Punkte, <Keyword id="STraight" /> wieder zu geraden Segmenten, <Keyword id="Arrow" /> setzt die Pfeilspitze wieder ein, und <Keyword id="None" /> lässt sie weg. Die Eingabetaste behält das Format bei.

### Undo

Nimmt den letzten Punkt zurück und fragt erneut danach. Beim zweiten Punkt gibt es nichts zurückzunehmen, und <Message id="invalidInputCapital" /> sagt das.

## Missing

Die Anmerkungen Toleranz und Block: MellowCAD hat kein Objekt für Form- und Lagetoleranzen, und ein Block wird nicht aus FÜHRUNG heraus eingefügt, daher listet die Optionen-Eingabeaufforderung nur Kopieren, Keine und MText. Andere Pfeilspitzen als die geschlossene, gefüllte, und die eigene Linienfarbe und Linienstärke der Führungslinie aus dem Bemaßungsstil. QLEADER und MLEADER, die Schnellführung und die Multi-Führungslinie, gibt es noch nicht: Die Multi-Führungslinien einer DXF-Datei werden beim Öffnen weggelassen.

## Questions

### Wie heißt der Befehl LEADER auf Deutsch?

FÜHRUNG, englisch LEADER. Geben Sie `FÜHRUNG` ein, dann die Eingabetaste oder die Leertaste. Der englische Name funktioniert ebenfalls, mit vorangestelltem Unterstrich: `_LEADER` in jeder Sprache von AutoCAD.

### Was ist der Unterschied zwischen FÜHRUNG (LEADER) und MLEADER?

FÜHRUNG ist der ältere Befehl: eine Führungslinie und ein eigener Text, dem die Linie folgt. MLEADER, das AutoCAD heute empfiehlt, erzeugt ein einziges Multi-Führungslinienobjekt mit eigenen Stilen und mehreren Führungslinien zu einer Anmerkung. MellowCAD hat FÜHRUNG; es öffnet und speichert die Führungslinien einer DXF-Datei und lässt deren Multi-Führungslinien weg.

### Wie erstellt man eine Führungslinie mit Text?

Starten Sie FÜHRUNG, wählen Sie den Punkt, auf den gezeigt werden soll, dann die Stelle für den Text, drücken Sie die Eingabetaste und geben Sie den Text Zeile für Zeile ein. Die Eingabetaste auf einer leeren Zeile beendet ihn. Die Eingabetaste bei der ersten Zeile bietet stattdessen die anderen Anmerkungen an, darunter den Texteditor.

### Wie ändert man die Größe des Pfeils einer Führungslinie?

Wählen Sie die Führungslinie und ändern Sie die Pfeilgröße in der Eigenschaftenpalette, was nur für diese Führungslinie gilt; oder ändern Sie die Pfeilgröße des Bemaßungsstils, der jede Führungslinie dieses Stils folgt. Die Länge des Hakens folgt der Pfeilgröße ebenfalls.

### Warum hat die Führungslinie keinen Pfeil?

Entweder hat <Keyword id="None" /> unter Format ihn weggelassen, oder das erste Segment ist kürzer als die doppelte Pfeilgröße; dann zeichnet auch AutoCAD keine Pfeilspitze. Wählen Sie den zweiten Punkt weiter vom ersten entfernt oder stellen Sie eine kleinere Pfeilgröße ein.
