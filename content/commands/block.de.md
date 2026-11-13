---
title: "Befehl BLOCK in AutoCAD"
description: "Wie BLOCK (Alias BL) in AutoCAD einen Block erstellt, Schritt für Schritt: ein Name, ein Basispunkt und die Objekte; einen Block neu definieren, Attribute."
figure: "Ein Stuhl, ein Rechteck und eine Linie, zum Block B1 gemacht: sein Name, ein Basispunkt in der Mitte seiner Vorderkante, beide Objekte gewählt."
sourceHash: "ca24f209008c"
---

BLOCK speichert eine Gruppe von Objekten unter einem Namen in der Zeichnung, sodass <Command id="INSERT" /> sie beliebig oft wieder einfügen kann, jede Kopie ein Verweis auf diese eine Definition. Er fragt nach einem Namen, dann nach dem Einfügebasispunkt, dem Punkt, an dem jeder Verweis platziert wird, dann nach den Objekten. Die Eingabetaste beendet die Auswahl und definiert den Block, und die gewählten Objekte werden an ihrer Stelle zu einem Verweis auf ihn. Der ganze Befehl ist ein Schritt, den Rückgängig zurücknimmt.

AutoCADs BLOCK öffnet den Dialog „Blockdefinition“, den MellowCAD nicht hat: Hier fragt BLOCK in der Befehlszeile das, was <Command id="-BLOCK" /> fragt, wie die Konsole von AutoCAD. Ein Name darf Leerzeichen und bis zu 255 Zeichen enthalten, aber keines von `< > / \ " : ; ? * | , =` und keinen Gravis: Die Eingabetaste allein oder ein solcher Name meldet <Message id="invalidNewBlockName" /> und fragt erneut. Bei einem Namen, den die Zeichnung schon hat, in beliebiger Schreibweise, wird gefragt, ob dieser Block neu definiert werden soll, <Keyword id="Yes" /> oder <Keyword id="No" /> (die Vorgabe, die den Befehl beendet).

## Options

### ?

Listet die Blöcke der Zeichnung auf: Er fragt, welche aufgelistet werden sollen, vorgegeben `*` für alle oder ein Name mit Platzhaltern, schreibt die Namen, die passen, und eine Anzahl je Art und endet dann. Anonyme Blöcke, etwa die eines Arrays, werden gezählt, nie benannt.

## Missing

Der Dialog „Blockdefinition“ von AutoCAD: BLOCK fragt in der Befehlszeile. Beim Basispunkt die Optionen Annotativ und Modus (Beibehalten, Löschen): Die Objekte werden immer in einen Verweis umgewandelt. ATTREQ 0, das das Eingabefeld für die Attributwerte überspringt, sowie ATTSYNC, ATTREDEF, BATTMAN und BATTORDER: Ein neu definierter Block lässt die Attribute seiner Verweise, wie sie waren, wie AutoCAD es tut. VonBlock: Ein Objekt in einem Block kann nicht die eigene Farbe, den eigenen Linientyp oder die eigene Linienstärke des Verweises annehmen, wie es ein VonBlock gezeichnetes in AutoCAD tut. In einem gedrehten BKS verschiebt AutoCAD 2027 die Objekte, die es umwandelt; hier bleiben sie absichtlich, wo sie waren.

## Questions

### Wie lautet das Alias von BLOCK in AutoCAD?

`BL`, dann die Eingabetaste oder die Leertaste. `B` ist in der deutschen Version BOGEN. In AutoCAD öffnet BLOCK den Dialog „Blockdefinition“; hier fragt er in der Befehlszeile, wie es `-BLOCK` (<Command id="-BLOCK" />) tut. `_BLOCK` funktioniert in jeder Sprache von AutoCAD.

### Wie erstellt man in AutoCAD einen Block?

Geben Sie `BL` ein, einen Namen, wählen Sie dann den Basispunkt, eine Ecke oder die Mitte der Kante, an der der Block sitzen wird, und wählen Sie die Objekte. Die Eingabetaste definiert den Block und macht die Objekte zu einem Verweis auf ihn. Eine vor dem Befehl getroffene Auswahl wird ebenfalls übernommen, nach dem Basispunkt.

### Wie definiert man einen Block neu?

Starten Sie BLOCK mit dem Namen des Blocks und antworten Sie <Keyword id="Yes" />, geben Sie dann einen Basispunkt an und wählen Sie die neuen Objekte: Jeder Verweis auf den Block zeigt die neue Definition. Die Objekte dürfen keinen Verweis auf den Block selbst enthalten; ein solcher Satz wird abgelehnt, und der Befehl endet.

### Wie erstellt man einen Block mit Attributen?

Definieren Sie zuerst die Attribute mit <Command id="ATTDEF" />, wählen Sie sie dann zusammen mit den anderen Objekten: Sie treten dem Block in der Reihenfolge bei, in der Sie sie wählen. Der Verweis, der sie ersetzt, öffnet ein Feld mit einem Eingabefeld für jedes Attribut, beschriftet mit dessen Eingabeaufforderung und gefüllt mit dessen Vorgabewert: Die Eingabetaste übernimmt die Werte, Esc behält die Vorgaben.

### Wie löst man einen Block auf?

<Command id="EXPLODE" /> macht einen Verweis wieder zu den Objekten, die er zeigt, eine Verschachtelungsebene nach der anderen, jedes auf seinem eigenen Layer und in seiner eigenen Farbe. Attribute kommen als ihre Definitionen zurück; die Werte entfallen.
