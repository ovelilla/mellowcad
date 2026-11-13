---
title: "Befehl SPIEGELN (MIRROR) in AutoCAD"
description: "So arbeitet AutoCADs SPIEGELN (MIRROR, Alias SP): auswählen, zwei Punkte der Spiegelachse, dann die Quelle behalten oder löschen. Text bleibt lesbar."
figure: "Ein geschlossener Umriss an einer senkrechten Spiegelachse gespiegelt, die Quelle behalten."
sourceHash: "fd4b7540311a"
---

SPIEGELN (MIRROR) spiegelt die gewählten Objekte an einer Linie: Wählen Sie sie, geben Sie den ersten und den zweiten Punkt der Spiegelachse an und sagen Sie dann, ob die Quellobjekte gelöscht werden sollen. Die Spiegelung ist eine Kopie, und mit der Vorgabe Nein bleiben die Originale, so zeichnet man ein symmetrisches Teil in Hälften. Die beiden Punkte werden in der Draufsicht des BKS genommen, sodass eine bei eingeschaltetem Ortho gezeichnete Spiegelachse genau waagerecht oder senkrecht spiegelt. Wie in AutoCAD mit MIRRTEXT auf 0, seiner Vorgabe, bleibt ein Text in der Spiegelung von links nach rechts lesbar, und eine Schraffur behält den Winkel ihres Musters. Der Durchlauf ist ein Schritt, den Rückgängig zurücknimmt.

## Options

### Yes

Löscht die Quellobjekte, sodass nur die Spiegelung bleibt: ein Umklappen an Ort und Stelle.

### No

Die Vorgabe: behält die Quellobjekte neben ihrer Spiegelung.

## Missing

MIRRTEXT und MIRRHATCH bleiben auf 0: Text wird nie rückwärts lesbar gespiegelt, und ein Schraffurmuster wird nie gespiegelt. Ein Text in einer gespiegelten Blockreferenz dreht sich zurück, um lesbar zu sein, wie ein einzelner es tut, wo AutoCAD ihn mit dem Block spiegelt. Eine gespiegelte Ellipse behält ihre Normale, sodass ihr Startwinkel und Endwinkel anders lauten als bei AutoCAD für dieselbe Kurve. Solange die Spiegelung dem Cursor folgt, trägt sie die Farbe jedes Objekts, nicht seinen Linientyp oder seine Linienstärke.

## Questions

### Wie lautet das Kürzel für SPIEGELN (MIRROR) in AutoCAD?

`SP`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_MIRROR` in jeder Sprache von AutoCAD.

### Wie spiegele ich, ohne dass der Text rückwärts lesbar wird?

Sie müssen nichts tun: Wie in AutoCAD mit MIRRTEXT auf 0 bleibt ein gespiegelter Text normal lesbar, dort platziert, wo die Spiegelung seines Rahmens liegt.

### Wie spiegele ich und lösche das Original?

Antworten Sie <Keyword id="Yes" />, wenn SPIEGELN fragt, ob die Quellobjekte gelöscht werden sollen.

### Wie spiegele ich waagerecht oder senkrecht?

Schalten Sie Ortho ein (F8) und geben Sie die zwei Punkte der Spiegelachse entlang der Achse an, an der gespiegelt werden soll: Eine senkrechte Linie spiegelt links und rechts, eine waagerechte oben und unten.
