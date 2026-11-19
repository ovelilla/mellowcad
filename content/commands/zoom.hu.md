---
title: "AutoCAD ZOOM parancs"
description: "Így működik az AutoCAD ZOOM (Z) parancsa: Terjedelem, Ablak, Előző, Arány nX-szel, Objektum és Mind, az egérgörgő, nagyítás parancs közben. Próbálja ki ingyen."
figure: "Lemez kis furattal a sarka közelében: ZOOM Terjedelem, majd ablak a furat köré, amely ezután kitölti a nézetet."
sourceHash: "cd72af4956e4"
---

A ZOOM parancs nagyítja vagy kicsinyíti a nézetet; a rajzban semmi sem mozdul el, és semminek sem változik a mérete. Első kérdése sarokpontot fogad el, amely ablakot kezd, léptéktényezőt vagy egy opciót. Aposztróffal begépelve (`'ZOOM` vagy `'Z`) egy másik parancson belül is működik, és az a parancs utána folytatódik. Az egérgörgő a kurzor körül nagyít és kicsinyít, a görgőgombra duplán kattintva pedig ZOOM Terjedelem lesz. Minden ZOOM egy visszavonási lépés, az egymást követők egyetlen lépés, így a <Command id="U" /> parancs a nézetet is visszaállítja.

## Options

### All

Mindent mutat, amit megrajzolt, ahogy a <Keyword id="Extents" /> is.

### Extents

Mindent mutat, amit megrajzolt, akkorára nagyítva, amekkorát az ablak megenged. Ha nincs semmi megrajzolva, ezt írja ki: <Message id="regeneratingModel" />, másik parancson belül begépelve pedig ezzel az üzenettel utasítja el: <Message id="requiresRegen" />, ahogy az AutoCAD is.

### Previous

Visszatér az előző nézethez, legfeljebb 20 nézetet visszalépve. Ha már nincs előző: <Message id="noPreviousView" />.

### Scale

Tényező: a `2X` kétszer közelebbre nagyít, mint az aktuális nézet, a `0.5X` feleannyira közelre, az X nélküli `2` pedig a ZOOM Mind nézet léptékének kétszeresére. Az `nXP`, a papírtér tényezője, `nX`-ként értendő: itt csak modelltér van. Az első kérdésnél begépelt tényező ugyanezt teszi az opció kiválasztása nélkül.

### Window

Két kattintással vagy húzással megadott sarokpont: a nézet ezt a téglalapot mutatja. Az első kérdésnél kattintott sarokpont ugyanezt teszi.

### Object

A kijelölt objektumokat mutatja, vagy azokat, amelyeket a ZOOM előtt jelölt ki.

## Missing

A Valósidejű: az első kérdésnél az Enter befejezi a ZOOM parancsot, míg az AutoCAD-ben egérrel való nagyítást indít; itt ezt a görgő végzi. A Dinamikus, a Közép, valamint a rejtett Bal és Vmax opció.

## Questions

### Mi az AutoCAD ZOOM parancs magyarul?

A magyar AutoCAD-ben is ZOOM a neve. Írja be a `ZOOM` nevet vagy a `Z` rövidítést, és nyomja meg az Enter billentyűt vagy a szóközt; a `_ZOOM` az AutoCAD bármely nyelvi változatában működik. A `Z`, majd a `T` a ZOOM Terjedelem.

### Hogyan lehet a teljes rajzot megjeleníteni?

<Keyword id="Extents" />: írja be a `Z` betűt, Enter, `T`, Enter. Vagy kattintson duplán az egérgörgő gombjára.

### Mit jelent az AutoCAD-ben a ZOOM XP?

Az `nXP` egy elrendezés nézetablakát a papírtérhez viszonyított léptékre nagyítja: az `1/50XP` a modellt 1:50 léptékben mutatja a lapon. A MellowCAD-ben nincsenek elrendezések, ezért az `XP` `X`-ként értendő.

### Hogyan lehet egy objektumra nagyítani az AutoCAD-ben?

Válassza az <Keyword id="Object" /> opciót, és jelölje ki az objektumot, vagy előbb jelölje ki, majd futtassa a ZOOM Objektum parancsot: a nézet az objektumot mutatja.

### Hogyan lehet visszatérni az előző nézethez?

<Keyword id="Previous" />, újra és újra az azt megelőző nézetekhez, legfeljebb 20-ig.
