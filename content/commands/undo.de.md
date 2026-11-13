---
title: "Befehl ZURÜCK (UNDO) in AutoCAD"
metaTitle: "Befehl ZURÜCK (UNDO) in AutoCAD"
description: "So arbeitet AutoCADs ZURÜCK (UNDO): mehrere Schritte zurück, Markierung und Rück, Beginn und Ende, Steuern, und der Unterschied zu Z und Strg+Z. Online testen."
before: "Eine Platte mit zwei Bohrungen und einer Linie quer darüber, gezeichnet mit vier Befehlen: RECTANG, zweimal CIRCLE und LINE."
figure: "UNDO 2: Die letzten zwei Befehle werden zurückgenommen, die Linie und die zweite Bohrung, und die Platte behält ihre erste Bohrung."
sourceHash: "b4fed2178b6a"
---

ZURÜCK (UNDO) nimmt Befehle zurück. Ein Schritt ist ein ganzer Befehl: Alles, was ein LINIE-Aufruf gezeichnet hat, verschwindet auf einmal, wie viele Segmente er auch hatte, und ebenso alles, was ein Befehl festgelegt hat, etwa LTSCALE. ZURÜCK schreibt seine aktuellen Einstellungen und fragt dann nach der Anzahl der zurückzunehmenden Vorgänge oder nach einer Option; die Eingabetaste nimmt einen zurück. Es schreibt die Namen der zurückgenommenen Befehle in eine Zeile, `CIRCLE LINE`, und <Message id="everythingUndone" />, wenn nichts mehr übrig ist; danach <Message id="nothingToUndo" />. Auch ein Befehl, der nichts geändert hat, wie ID oder LIST, ist ein Schritt, ebenso das, was ZOOM und PAN mit der Ansicht getan haben.

<Command id="U" /> ist die Kurzform: ein Schritt zurück, ohne Frage. Strg+Z an der Eingabeaufforderung führt Z aus; innerhalb eines Befehls ist es das eigene Zurück dieses Befehls, so wie AutoCADs Makro es tippt: LINIE nimmt sein letztes Segment zurück und macht weiter. <Command id="REDO" /> stellt direkt danach wieder her, was das letzte Z oder ZURÜCK zurückgenommen hat.

## Options

### Auto

Fragt <Keyword id="ON" /> oder <Keyword id="OFF" /> und bietet die aktuelle Einstellung an, die die Einstellungszeile danach zeigt. In AutoCAD macht es aus den Befehlen, die ein Menüeintrag ausführt, einen Schritt; hier führt kein Menü mehr als einen aus, sodass es hier nichts zusammenfasst.

### Control

Fragt, wie viel Rückgängig aufbewahrt werden soll, standardmäßig <Keyword id="All" />. <Keyword id="None" /> verwirft jeden aufbewahrten Schritt und schaltet Rückgängig aus: Z meldet dann <Message id="uDisabled" />, und ZURÜCK fragt gleich nach Steuern. <Keyword id="One" /> behält nur den letzten Schritt, und ZURÜCK fragt dann nach 1 oder Steuern. Ganz schaltet das volle Rückgängig wieder ein. <Keyword id="Combine" /> bestimmt, ob aufeinanderfolgende ZOOM und PAN ein Schritt sind, und <Keyword id="Layer" />, ob es aufeinanderfolgende Änderungen im Layer-Eigenschaften-Manager sind, bei beiden standardmäßig Ja. Die Einstellungen gehören zur Zeichnung und werden nicht mit ihr gespeichert: Eine neue oder geöffnete Zeichnung beginnt bei Ganz, Kombinieren Ja und Layer Ja.

### BEgin

Beginnt eine Gruppe: Die Befehle, die bis <Keyword id="End" /> laufen, bilden einen Schritt, den Z als Ganzes zurücknimmt und mit ihnen `GROUP` nennt. Solange eine Gruppe offen ist, halten Z, eine Zahl und Rück an ihrem Anfang an. Beginn bei offener Gruppe schließt sie zuerst.

### End

Schließt die Gruppe, die Beginn geöffnet hat.

### Mark

Setzt eine Markierung in die Schritte. Rück, Z und eine Zahl halten an ihr an, mit <Message id="markEncountered" />.

### Back

Nimmt jeden Schritt bis zur letzten Markierung zurück, und die Markierung mit ihnen. Ohne Markierung fragt es, ob alles rückgängig gemacht werden soll, standardmäßig Ja.

## Missing

Auto fasst nichts zusammen, da hier kein Menü mehr als einen Befehl ausführt. Kombinieren und Layer gelten für die Browsersitzung, wo AutoCAD sie von einer Sitzung zur nächsten behält. Die Schaltflächen Rückgängig und Wiederholen der oberen Leiste schreiben nichts in den Verlauf, wo AutoCADs Schnellzugriff-Werkzeugkasten seinen eigenen schreibt. Strg+Umschalt+Z stellt ebenfalls wieder her, stumm, obwohl AutoCAD nichts daran bindet.

## Questions

### Wie lautet das Kürzel für ZURÜCK (UNDO) in AutoCAD?

Strg+Z, oder `Z` und die Eingabetaste: ein Schritt zurück. In der deutschen AutoCAD-Version ist `Z` der Befehl für einen Schritt zurück, in der englischen `U`. ZURÜCK hat keinen Alias; tippen Sie ihn vollständig für eine Anzahl von Schritten oder seine Optionen, oder `_UNDO` in jeder Sprache von AutoCAD.

### Was ist der Unterschied zwischen Z und ZURÜCK?

<Command id="U" /> nimmt den letzten Befehl zurück und fragt nichts. ZURÜCK fragt, wie viele zurückgenommen werden sollen, und hat Markierung und Rück, um zu einem von Ihnen markierten Punkt zurückzugehen, Beginn und Ende, um mehrere Befehle zu einem Schritt zu machen, und Steuern, um Rückgängig zu begrenzen oder auszuschalten.

### Wie mache ich mehrere Befehle auf einmal rückgängig?

Tippen Sie `ZURÜCK` und die Anzahl der Befehle, etwa `5`. Oder wählen Sie <Keyword id="Mark" /> vor einer Reihe, die Sie vielleicht verwerfen wollen, und <Keyword id="Back" />, um zu ihr zurückzugehen.

### Warum funktioniert der Befehl ZURÜCK nicht?

Rückgängig wurde mit Steuern <Keyword id="None" /> ausgeschaltet: Z sagt es, und ZURÜCK fragt nach Steuern. Antworten Sie <Keyword id="All" />, um es wieder einzuschalten. Die Schritte davor sind verloren.

### Wie stelle ich wieder her, was ich rückgängig gemacht habe?

<Command id="REDO" /> direkt nach Z oder ZURÜCK stellt alles wieder her. Strg+Y stellt Schritt für Schritt wieder her.
