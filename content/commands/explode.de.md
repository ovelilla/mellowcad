---
title: "Befehl URSPRUNG (EXPLODE) in AutoCAD"
description: "Wie URSPRUNG (EXPLODE, Alias UR) in AutoCAD funktioniert: eine Polylinie in Linien und Bögen, ein Block in Objekte, Text in Linien, eine Schraffur in Linien."
figure: "Ein Rechteck, eine Polylinie, in vier Linien aufgelöst, und eine davon danach einzeln gelöscht."
sourceHash: "479cf1cd58d9"
---

URSPRUNG (EXPLODE) zerlegt ein zusammengesetztes Objekt in die Objekte, aus denen es besteht. Wählen Sie die Objekte und drücken Sie die Eingabetaste: Eine Polylinie wird zu Linien und Bögen entlang ihrer Mittellinie, ein Blockverweis zu den Objekten seines Blocks, eine Ebene tiefer, Mehrzeilentext zu je einer Textzeile für jede Zeile, die er zeigt, und eine Musterschraffur zu den Linien ihres Musters. Jedes Teil behält den Layer und die Eigenschaften des Objekts; die Teile eines Blocks behalten ihre eigenen. Eine breite Polylinie verliert ihre Breite, und URSPRUNG meldet es. Linien, Kreise, Bögen, einzeiliger Text und Bemaßungen können nicht aufgelöst werden: Sie werden bei der Auswahl abgelehnt, und ein Spline, eine Ellipse oder eine Volltonschraffur, wenn die Auswahl abgeschlossen wird. Das Auflösen ist ein Schritt, den Rückgängig zurücknimmt.

## Missing

Bemaßungen, die AutoCAD in Linien, Pfeilspitzen und Text auflöst und MellowCAD ablehnt. Eine Schraffur, deren Muster hier nicht mitgeliefert wird, wird wie eine Volltonschraffur abgelehnt, und aufgelöster Mehrzeilentext sitzt dort, wo die Schrift ihn zeichnet, haarbreit neben dem Platz von AutoCAD.

## Questions

### Wie lautet das Kürzel für URSPRUNG (EXPLODE) in AutoCAD?

`UR`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_EXPLODE` in jeder Sprache von AutoCAD.

### Wie mache ich ein Auflösen in AutoCAD rückgängig?

Geben Sie sofort <Command id="U" /> ein oder drücken Sie Strg+Z: Das Auflösen ist ein Rückgängig-Schritt. Später macht <Command id="JOIN" /> aus Linien und Bögen, die Ende an Ende liegen, wieder eine Polylinie, und <Command id="BLOCK" /> macht aus Objekten wieder einen Block.

### Kann ich Text in AutoCAD auflösen?

Mehrzeilentext ja: Jede Zeile wird ein einzeiliger Text. Einzeiliger Text ist bereits das kleinste Teil, und URSPRUNG lehnt ihn ab.

### Wie löse ich einen Block in AutoCAD auf?

Wählen Sie den Blockverweis und drücken Sie die Eingabetaste: Er wird zu den Objekten seines Blocks, dort, wo der Verweis sie gezeichnet hat. Ein Block darin bleibt ein Block: Lösen Sie ihn erneut auf. Attribute kommen als ihre Definitionen zurück, ohne die Werte.
