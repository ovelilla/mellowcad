---
title: "Příkaz SPLINEDIT v AutoCADu"
description: "Jak funguje příkaz SPLINEDIT (zkratka SPE) v AutoCADu: uzavření, připojení, body vyhlazení, vrcholy, převod na křivku a obrácení. Vyzkoušejte zdarma."
figure: "Spline pěti body vyhlazení uzavřená příkazem SPLINEDIT: hladká smyčka, která prochází všemi."
sourceHash: "bedcaab2fac3"
---

Příkaz SPLINEDIT upravuje spline. Určete ji ve výzvě `Vyberte spline:`, nebo ji vyberte před spuštěním příkazu; poklepání na spline na ní také spustí příkaz SPLINEDIT. U každého jiného objektu příkaz vypíše <Message id="objectNotSpline" /> a zeptá se znovu; křivka vyhlazená možností <Keyword command="PEDIT" id="Spline" /> příkazu <Command id="PEDIT" /> se beze slova změní ve spline se stejným průběhem. Pak se příkaz ptá na možnost znovu a znovu, každou použije hned, dokud nezvolíte <Keyword id="eXit" /> nebo nestisknete Enter. Spline ukazuje uzly svých bodů vyhlazení a při úpravě vrcholů své řídicí vrcholy a rámeček. Celá úprava je jeden krok, který vrátí <Command id="U" />. Zapsaný `'ZOOM` funguje u každé jeho výzvy.

## Options

### Close

Uzavře spline hladce: spline s body vyhlazení přes své body vyhlazení, spline s řídicími vrcholy na jejích vrcholech. U uzavřené spline je touto možností <Keyword id="Open" /> a <Keyword id="Join" /> se nenabízí.

### Join

Připojí otevřené křivky, které se dotýkají jejích konců, podle pravidel příkazu SPOJ pro spline, a vypíše, kolik jich připojil.

### Fit data

Upravuje body, kterými spline prochází. Spline s řídicími vrcholy, která je nemá, nejprve dostane body vyhlazení na své křivce. Její možnosti: <Keyword id="Add" /> vybere bod vyhlazení a za něj přidává nové, znovu a znovu (u prvního bodu otevřené spline <Keyword id="After" /> nebo <Keyword id="Before" />); <Keyword id="Delete" /> odebírá body vyhlazení, až na dva, u uzavřené spline na tři (<Message id="cannotDeleteBeyond" />); <Keyword id="Move" /> prochází body vyhlazení možnostmi <Keyword id="Next" /> a <Keyword id="Previous" />, nebo <Keyword id="Select point" />, a aktuální přesune do zadaného bodu; <Keyword id="Purge" /> zahodí data vyhlazení a ponechá spline s řídicími vrcholy; <Keyword id="Tangents" /> nastaví počáteční a koncový směr, nebo <Keyword id="System default" />; <Keyword id="Close" /> a <Keyword id="eXit" /> fungují jako v první výzvě. Po výběru něčeho, co není bodem vyhlazení, příkaz vypíše <Message id="notAFitPoint" />.

### Edit vertex

Upravuje řídicí vrcholy; spline s body vyhlazení při první úpravě ztratí data vyhlazení. <Keyword id="Add" /> umístí vrchol do bodu, který na spline určíte; <Keyword id="Delete" /> jeden odebere, až na dva, u uzavřené spline na tři; <Keyword id="Elevate order" /> zvýší řád, nejvýše na 26, nikdy ho nesníží; <Keyword id="Move" /> přesouvá vrcholy a prochází jimi jako <Keyword id="Move" /> v <Keyword id="Fit data" />; <Keyword id="Weight" /> nastaví váhu vrcholu, po zprávě <Message id="splineMadeRational" />, takže se k němu křivka přiblíží nebo se od něj vzdálí. Po výběru něčeho, co není vrcholem, příkaz vypíše <Message id="notAControlVertex" />.

### convert to Polyline

Zeptá se na přesnost od 0 do 99, výchozí 10, a nahradí spline křivkou z přímých segmentů, tím početnějších, čím vyšší je přesnost; 3D křivkou, když spline neleží rovně, rovnoběžně s rovinou XY. Ukončí příkaz. Přesnost zůstane zachována po celou relaci a používá ji i převod v příkazu <Command id="PEDIT" />.

### Reverse

Obrátí spline, její první bod se stane posledním: <Message id="splineReversed" />.

### Undo

Vrátí poslední možnost, celou <Keyword id="Fit data" /> nebo <Keyword id="Edit vertex" /> najednou. Když už nic nezbývá: <Message id="commandCompletelyUndone" />.

### eXit

Ukončí příkaz, jako Enter.

## Missing

Bod zalomení (Kink), který vytvoří ostrý roh v bodě vyhlazení nebo ve vrcholu; TOLerance, která spline znovu proloží v rámci tolerance; Tečny uzavřené spline. <Keyword id="convert to Polyline" /> vytvoří ze spline s body vyhlazení mnohem víc vrcholů než AutoCAD, nikdy oblouky, a spline vždy nahradí. Skupina ve výzvě `Vyberte spline:`. Značka `+`, kterou AutoCAD kreslí na aktuálním bodě, když body procházíte.

## Questions

### Jak se jmenuje příkaz SPLINEDIT česky?

Také SPLINEDIT: česká verze AutoCADu jeho název nepřekládá. Zadejte `SPLINEDIT` nebo zkratku `SPE` a stiskněte Enter nebo mezerník; zkratka `SPE` je stejná jako v anglické verzi. `_SPLINEDIT` funguje v AutoCADu v každém jazyce. Spustí ho také poklepání na spline.

### Jak převést spline na křivku?

Spusťte příkaz SPLINEDIT, vyberte spline a zvolte <Keyword id="convert to Polyline" />; přesnost 10 dá hladkou křivku. Příkaz <Command id="PEDIT" /> u spline převod také nabídne.

### Jak v AutoCADu přidat nebo posunout body spline?

Zvolte <Keyword id="Fit data" />, chcete-li pracovat s body, kterými prochází, a pak <Keyword id="Add" /> nebo <Keyword id="Move" />. Zvolte <Keyword id="Edit vertex" />, chcete-li pracovat s řídicími vrcholy, které ji obklopují.

### Jak uzavřít spline?

Zvolte <Keyword id="Close" />: spline se uzavře hladce, bez rohu v místě, kde se její konce setkají. <Keyword id="Open" /> ji znovu otevře.

### Jak spojit dvě spline?

Zvolte <Keyword id="Join" /> a vyberte spline, jejíž konec se dotýká konce této, nebo použijte příkaz <Command id="JOIN" />.
