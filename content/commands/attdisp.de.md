---
title: "Befehl ATTZEIG (ATTDISP) in AutoCAD"
description: "So zeigt AutoCADs ATTZEIG (ATTDISP) Blockattribute an: Normal, ON zeigt auch die unsichtbaren, OFF verbirgt alle. In der Zeichnung gespeichert. Online testen."
figure: "Zwei Schreibtische, deren Teilenummern unsichtbare Attribute sind: ATTDISP ON zeigt sie unter jedem Schreibtisch, neben den sichtbaren Nummern."
sourceHash: "8821fdeb2077"
---

ATTZEIG (ATTDISP) legt fest, welche Attribute die Blockreferenzen in der Zeichnung zeigen. Er fragt nach der Einstellung, bietet die aktuelle an, in einer neuen Zeichnung Normal; bei jedem anderen Wort meldet er, die Option sei ungültig, und fragt erneut; die Eingabetaste behält die Einstellung. Eine Änderung zeichnet die ganze Zeichnung neu, `Modell wird regeneriert.`, wie AutoCAD 2027 es sagt, und wird als ATTMODE mit der Zeichnung gespeichert, ein Schritt, den <Command id="U" /> zurücknimmt. Mit Apostroph eingegeben, läuft er auch innerhalb eines Befehls.

Er ändert nur, was angezeigt wird: Ein unsichtbares Attribut behält seinen Wert, und ein verborgenes lässt sich weiterhin mit <Command id="ATTEDIT" /> oder <Command id="EATTEDIT" /> bearbeiten.

## Options

### Normal

Zeigt jedes Attribut so, wie es definiert wurde: die sichtbaren, nicht die mit dem <Keyword command="ATTDEF" id="Invisible" /> von <Command id="ATTDEF" /> definierten.

### ON

Zeigt jedes Attribut, auch die unsichtbaren.

### OFF

Verbirgt jedes Attribut, auch die sichtbaren.

## Questions

### Wie zeige ich unsichtbare Attribute in AutoCAD an?

Geben Sie `ATTZEIG` ein und wählen Sie <Keyword id="ON" />: Jedes Attribut wird gezeigt, auch die unsichtbaren. <Keyword id="Normal" /> verbirgt sie wieder.

### Warum werden meine Blockattribute nicht angezeigt?

<Command id="ATTDISP" /> steht vielleicht auf <Keyword id="OFF" />, was jedes Attribut verbirgt, oder auf <Keyword id="Normal" /> mit als unsichtbar definierten Attributen. Wählen Sie <Keyword id="ON" />, um alle zu sehen. Eine Referenz, deren Block keine Attribute hat, zeigt keine, welche Einstellung auch gilt.

### Wie verberge ich Attributwerte in AutoCAD?

Definieren Sie sie unsichtbar: der Modus <Keyword command="ATTDEF" id="Invisible" /> von <Command id="ATTDEF" />, bevor Sie den Block erstellen. ATTZEIG <Keyword id="OFF" /> verbirgt jedes Attribut auf einmal, in der ganzen Zeichnung.
