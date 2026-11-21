---
title: "Befehl MEINFÜG (MINSERT) in AutoCAD"
metaTitle: "Befehl MEINFÜG (MINSERT) in AutoCAD"
description: "Wie AutoCADs MEINFÜG (MINSERT) einen Block in Zeilen und Spalten als ein Objekt einfügt, was er fragt und warum URSPRUNG ihn ablehnt. Kostenlos testen."
figure: "Ein Sitz, zum Block gemacht und dann mit MEINFÜG in drei Zeilen zu fünf gelegt: ein Objekt."
sourceHash: "d43a50bbc8fe"
---

MEINFÜG (englisch MINSERT) fügt einen in der Zeichnung definierten Block vielfach ein, in Zeilen und Spalten, als ein Objekt. Er fragt, was <Command id="-INSERT" /> fragt — den Blocknamen (Eingabe übernimmt den angebotenen, den zuletzt eingefügten Block), den Einfügepunkt, den X- und den Y-Skalierfaktor und den Drehwinkel —, dann die Anzahl der Zeilen und die der Spalten (Eingabe ist 1), dann den Abstand zwischen den Zeilen und den zwischen den Spalten. Gefragt werden nur die Abstände, die die Anzahlen brauchen, und eine Zeile aus einer Spalte ist eine gewöhnliche Blockreferenz. Ein Block mit Attributen fragt deren Werte zuletzt, einmal, und jede Kopie zeigt sie.

Die Zeilen laufen entlang der Y-Achse des Blocks und die Spalten entlang seiner X-Achse, beide um die Drehung gedreht; die Abstände sind in Zeichnungseinheiten, gleich welcher Skalierfaktor, und ein negativer legt die Kopien nach unten oder nach links. Beim Abstand zwischen den Zeilen geben zwei Punkte stattdessen eine Zelle an: ihre Breite ist der Spaltenabstand, ihre Höhe der Zeilenabstand. Das Ergebnis ist AutoCADs Meinfüg-Block: Er wird als eines verschoben, kopiert, gedreht, skaliert und gespiegelt, <Command id="LIST" /> nennt zusätzlich seine Zeilen und Spalten, und die Eigenschaften-Palette zeigt sie als Tabellenspalten, Tabellenspalten-Abstand, Tabellenzeilen und Tabellenzeilen-Abstand, alle eingebbar. <Command id="EXPLODE" /> zählt ihn als mit MEINFÜG eingefügt und lässt ihn ganz, wie AutoCAD. Eine DXF-Datei öffnet und speichert ihn wie AutoCAD selbst.

## Options

### ?

Beim Blocknamen: listet die Blöcke der Zeichnung auf, wie <Command id="BLOCK" />, und endet.

### Scale

Beim Einfügepunkt: fragt einen Faktor für beide Achsen und dann erneut nach dem Punkt. Nach dem Punkt werden der X- und der Y-Faktor nicht gefragt.

### Rotate

Beim Einfügepunkt: fragt den Winkel, der jede Kopie und das ganze Raster dreht, und dann erneut nach dem Punkt. Nach dem Punkt wird die Drehung nicht gefragt.

## Missing

Beim Einfügepunkt Basispunkt, X, Y und Z, beim X-Skalierfaktor Ecke und XYZ, wie sie -EINFÜGE fehlen; die `~`, die eine Zeichnungsdatei öffnet; Beschriftungsblöcke, die es hier nicht gibt. Eine lineare Bemaßung wählt den ganzen MEINFÜG-Block, kein Objekt in einer seiner Kopien. Die Zeilen Beschriftung, Blockeinheit und Einheitenfaktor der Eigenschaften-Palette.

## Questions

### Was ist der Befehl MEINFÜG in AutoCAD?

Mehrfaches Einfügen: Er legt einen Block in ein rechteckiges Raster aus Zeilen und Spalten, als ein Objekt. Anzahlen und Abstände ändern Sie später in der Eigenschaften-Palette.

### Wie löse ich einen mit MEINFÜG eingefügten Block auf?

Gar nicht: <Command id="EXPLODE" /> meldet, er wurde mit MEINFÜG eingefügt, und lässt ihn, in AutoCAD wie hier, auch wenn seine Zeilen und Spalten auf 1 stehen. Fügen Sie den Block mit <Command id="-INSERT" /> neu ein, oder legen Sie die Kopien mit <Command id="ARRAYRECT" />, dessen Reihe sich in ihre Elemente auflösen lässt.

### Wie heißt MINSERT im deutschen AutoCAD?

MEINFÜG. Er hat weder Kürzel noch Schaltfläche in der Multifunktionsleiste, also tippen Sie ihn ganz; `_MINSERT` funktioniert in jeder Sprache von AutoCAD.

### Was ist der Unterschied zwischen MEINFÜG und REIHE?

MEINFÜG wiederholt einen Block als eine Referenz, die sich nicht auflösen lässt. <Command id="ARRAYRECT" /> wiederholt beliebige Objekte als assoziative Reihe, mit Griffen für Anzahlen und Abstände, die <Command id="EXPLODE" /> auflöst.
