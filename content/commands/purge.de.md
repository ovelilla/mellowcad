---
title: "Befehl BEREINIG (PURGE) in AutoCAD"
description: "So löscht AutoCADs BEREINIG (PURGE, Alias BE) Blöcke, die keine Referenz nutzt, nach Namen oder alle auf einmal, mit oder ohne Bestätigung. Gratis testen."
figure: "Zwei Blöcke, TAG an einer Wand platziert und BOX, dessen einzige Referenz gelöscht wurde: BEREINIG, alle Namen, ohne Bestätigung, löscht BOX allein."
sourceHash: "635e8ae855cb"
---

BEREINIG (PURGE) entfernt, was eine Zeichnung definiert, aber nicht nutzt; hier sind das Blöcke. AutoCADs BEREINIG öffnet das Dialogfeld Bereinigen; MellowCAD hat keines, sodass BEREINIG in der Befehlszeile fragt, was <Command id="-PURGE" /> fragt, wie die Konsole von AutoCAD. Er meldet die Einstellungen Verschachtelte Elemente und Verwaiste Daten, beide aus, und fragt, welchen Typ ungenutzter Objekte er bereinigen soll, wobei er nur <Keyword id="Blocks" /> anbietet; die Eingabetaste dort beendet ihn.

Ein Block ist in Gebrauch, solange eine Blockreferenz in der Zeichnung ihn platziert oder die Definition eines genutzten Blocks ihn enthält, wie tief auch immer. Löscht man die letzte Blockreferenz eines Blocks, bleibt seine Definition in der Zeichnung, wo <Command id="INSERT" /> ihn wieder platzieren kann: BEREINIG löscht sie. Ein Block, den ein behaltener Block enthält, wird nie bereinigt, und eine Kette von Blöcken, die nur einander enthalten, geht in einem Durchlauf. Gibt es keinen, meldet er <Message id="noUnreferencedBlocks" />. Jeder Durchlauf ist ein Schritt, den <Command id="U" /> zurücknimmt.

## Options

### Blocks

Fragt nach den zu bereinigenden Namen, standardmäßig `*` für jeden ungenutzten Block, oder Namen mit Platzhaltern, durch Kommas getrennt. Dann fragt er, ob jeder Name bestätigt werden soll: <Keyword id="Yes" />, die Vorgabe, fragt bei jedem Block vor dem Löschen nach, <Keyword id="No" /> löscht alle und meldet jeden Namen und wie viele.

## Missing

Das Dialogfeld Bereinigen und jeder andere Typ: Layer, Linientypen, Text- und Bemaßungsstile, Gruppen, Materialien, Multi-Führungslinien-, Tabellen- und visuelle Stile, registrierte Anwendungen, Geometrie der Länge null, leere Textobjekte, verwaiste Daten und Alle. Die Einstellungen Verschachtelte Elemente und Verwaiste Daten lassen sich nicht ändern.

## Questions

### Wie lautet das Kürzel für BEREINIG (PURGE) in AutoCAD?

`BE`, danach Eingabetaste oder Leertaste. `-BE` ist <Command id="-PURGE" />, die Befehlszeilenform, die BEREINIG hier ebenfalls ausführt. `_PURGE` funktioniert in jeder Sprache von AutoCAD.

### Wie bereinige ich ungenutzte Blöcke in AutoCAD?

Tippen Sie `BE`, wählen Sie <Keyword id="Blocks" />, drücken Sie die Eingabetaste für jeden Namen und antworten Sie <Keyword id="No" />, um alle zu löschen, ohne bei jedem nachzufragen.

### Warum kann ich einen Block nicht bereinigen?

Weil er in Gebrauch ist: Eine Blockreferenz in der Zeichnung platziert ihn, oder ein genutzter Block enthält ihn, vielleicht mehrere Ebenen tief verschachtelt. Löschen Sie seine Blockreferenzen oder zerlegen Sie die Blöcke, die ihn enthalten, und BEREINIG kann ihn nehmen.

### Wie bereinige ich Layer?

In AutoCAD mit dem Typ Layer von BEREINIG. Hier noch nicht, wo BEREINIG nur Blöcke bereinigt; löschen Sie stattdessen einen leeren Layer im Layer-Eigenschaften-Manager.
