---
title: "Befehl EIGANPASS (MATCHPROP) in AutoCAD"
description: "So arbeitet AutoCADs EIGANPASS (MATCHPROP, Alias EG): ein Quellobjekt wählen, dann die Objekte, die Layer, Farbe, Linientyp, Linienstärke und Stile übernehmen."
figure: "Eine Platte und ihr Loch, eine senkrechte Achse in Rot und Center auf ihrem Layer, und eine waagerechte Linie auf Layer 0, die EIGANPASS zur selben Achse macht."
sourceHash: "603d5ab849b1"
---

EIGANPASS (MATCHPROP) kopiert die Eigenschaften eines Objekts auf andere, AutoCADs Pinsel Eigenschaften anpassen. Wählen Sie das Quellobjekt, oder wählen Sie vor dem Befehl eines aus; er nimmt auch eines auf einem gesperrten Layer. Er meldet dann, welche Eigenschaften er kopiert, `Aktuelle aktive Einstellungen:` und die Liste, und fragt nach den Zielobjekten: Jede Wahl oder jedes Fenster malt sie sofort an, bis die Eingabetaste endet. Ein Ziel auf einem gesperrten Layer bleibt, wie es ist, mit <Message id="matchpropLockedDestination" />. Der Cursor trägt AutoCADs Pinsel, und der ganze Durchlauf ist ein Schritt, den <Command id="U" /> zurücknimmt. Mit Apostroph getippt, `'EIGANPASS`, läuft er innerhalb eines anderen Befehls.

Was er kopiert, sind die Vorgaben der Eigenschaftseinstellungen: der Layer, die Farbe und die Linienstärke; der Linientyp, außer auf Schraffuren, Absatztext und Attributdefinitionen; die Objekthöhe; zwischen Texten der Stil, die Höhe und die Drehung, und von einem einzeiligen Text auf einen anderen auch die Ausrichtung; zwischen Bemaßungen der Bemaßungsstil; zwischen Schraffuren das Muster, der Maßstab und der Winkel, aber nicht der Ursprung.

## Missing

Die Option Einstellungen und ihr Dialogfeld Eigenschaftseinstellungen: Jede Eigenschaft, die er kennt, wird immer kopiert, und die erste Eingabeaufforderung listet `[Einstellungen]` nicht auf. Linientypfaktor, Transparenz und Plotstil, die Objekte hier nicht haben; die Breiten einer Polylinie, der Breitenfaktor und der Schrägstellungswinkel eines Textes und die annotativen Eigenschaften. AutoCADs Vorschau der Änderung unter dem Cursor.

## Questions

### Wie lautet das Kürzel für EIGANPASS (MATCHPROP) in AutoCAD?

`EG`, danach Eingabetaste oder Leertaste; `PAINTER` ist ebenfalls ein Alias. Auch der vollständige Name funktioniert, ebenso `_MATCHPROP` in jeder Sprache von AutoCAD.

### Wie kopiere ich die Eigenschaften einer Linie auf eine andere?

Starten Sie EIGANPASS, wählen Sie die Linie, deren Eigenschaften Sie wollen, wählen Sie dann die Linien, die sie übernehmen sollen, und drücken Sie die Eingabetaste. Sie gehen auf ihren Layer, mit ihrer Farbe, ihrem Linientyp und ihrer Linienstärke.

### Warum funktioniert Eigenschaften anpassen nicht?

Ein Ziel auf einem gesperrten Layer wird nicht geändert: Entsperren Sie zuerst den Layer. Eine Eigenschaft wird nur zwischen Objekten kopiert, die sie haben: Ein Bemaßungsstil geht nur auf Bemaßungen, ein Textstil nur auf Texte, ein Muster nur auf Schraffuren. Und ein Linientyp wird wie in AutoCAD nicht auf eine Schraffur oder auf Absatztext kopiert.

### Wie passe ich die Eigenschaften einer Bemaßung oder einer Schraffur an?

Wählen Sie eine Bemaßung als Quelle und andere Bemaßungen als Ziele: Sie übernehmen ihren Bemaßungsstil, mit Layer und Farbe. Eine Schraffur gibt ihr Muster, ihren Maßstab und ihren Winkel an andere Schraffuren weiter, und jede behält ihren eigenen Ursprung.
