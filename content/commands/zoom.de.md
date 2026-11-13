---
title: "Befehl ZOOM in AutoCAD"
description: "Wie ZOOM (Alias ZO) in AutoCAD funktioniert: Grenzen, Fenster, Vorher, Faktor mit nX, Objekt und Alles, das Mausrad, Zoomen innerhalb eines Befehls."
figure: "Eine Platte mit einem kleinen Loch nahe ihrer Ecke: ZOOM Grenzen, dann ein Fenster um das Loch, das danach die Ansicht füllt."
sourceHash: "cd72af4956e4"
---

ZOOM macht die Ansicht größer oder kleiner; nichts in der Zeichnung bewegt sich oder ändert seine Größe. Seine erste Eingabeaufforderung nimmt eine Ecke, die ein Fenster beginnt, einen Skalierungsfaktor oder eine Option. Mit Apostroph eingegeben, `'ZOOM` oder `'ZO`, funktioniert er innerhalb eines anderen Befehls, der danach weitermacht. Das Mausrad zoomt um den Cursor heraus und hinein, und ein Doppelklick auf die Radtaste ist ZOOM Grenzen. Jedes ZOOM ist ein Rückgängig-Schritt, aufeinanderfolgende ein einziger, sodass auch <Command id="U" /> die Ansicht zurücknimmt.

## Options

### All

Zeigt alles Gezeichnete, wie <Keyword id="Extents" />.

### Extents

Zeigt alles Gezeichnete, so groß, wie das Fenster es erlaubt. Ist nichts gezeichnet, meldet der Befehl <Message id="regeneratingModel" />, und innerhalb eines anderen Befehls eingegeben, lehnt er mit <Message id="requiresRegen" /> ab, wie der von AutoCAD.

### Previous

Geht zur vorherigen Ansicht zurück, bis zu 20 Ansichten. Ist keine mehr übrig: <Message id="noPreviousView" />.

### Scale

Ein Faktor: `2X` zoomt doppelt so nah wie die aktuelle Ansicht, `0.5X` halb so nah, und `2` ohne das X den doppelten Maßstab der Ansicht von ZOOM Alles. `nXP`, der Faktor des Papierbereichs, wird als `nX` gelesen: Hier gibt es nur den Modellbereich. Ein bei der ersten Eingabeaufforderung eingegebener Faktor tut dasselbe, ohne die Option zu wählen.

### Window

Zwei Ecken, gewählt oder aufgezogen, zeigen dieses Rechteck. Eine bei der ersten Eingabeaufforderung gewählte Ecke tut dasselbe.

### Object

Zeigt die Objekte, die Sie wählen, oder die vor ZOOM gewählten.

## Missing

Realtime: Die Eingabetaste bei der ersten Eingabeaufforderung beendet ZOOM, wo AutoCAD das Zoomen mit der Maus beginnt; das Rad tut das hier. Dynamic, Center und die verborgenen Left und Vmax.

## Questions

### Wie lautet das Kürzel für ZOOM in AutoCAD?

`ZO`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_ZOOM` in jeder Sprache von AutoCAD. ZOOM mit der Option <Keyword id="Extents" /> ist ZOOM Grenzen.

### Wie zeige ich die ganze Zeichnung formatfüllend?

<Keyword id="Extents" />: Geben Sie `ZO` ein, drücken Sie die Eingabetaste und wählen Sie die Option. Oder doppelklicken Sie auf die Radtaste der Maus.

### Was bedeutet ZOOM XP in AutoCAD?

`nXP` zoomt einen Layout-Ansichtsbereich auf einen Maßstab relativ zum Papierbereich: `1/50XP` zeigt das Modell im Maßstab 1:50 auf dem Blatt. MellowCAD hat keine Layouts, `XP` wird also als `X` gelesen.

### Wie zoome ich in AutoCAD auf ein Objekt?

Wählen Sie <Keyword id="Object" /> und wählen Sie es, oder wählen Sie es zuerst und starten Sie dann ZOOM Objekt: Die Ansicht zeigt es formatfüllend.

### Wie gehe ich zur vorherigen Ansicht zurück?

<Keyword id="Previous" />, immer wieder für die Ansichten davor, bis zu 20.
