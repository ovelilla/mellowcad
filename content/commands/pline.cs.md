---
title: "Křivka v AutoCADu: příkaz KŘIVKA (PLINE)"
description: "Jak nakreslit křivku (polyline) v AutoCADu příkazem KŘIVKA (PLINE, zkratka K): úsečky a oblouky v jednom objektu, šířka a polovina šířky, délka a uzavření."
figure: "Úsečka, tečný oblouk a úsečka zpět, pak hrot široký 10 zužující se do 0: jedna křivka."
sourceHash: "216b83656483"
---

Příkaz KŘIVKA (PLINE) kreslí křivku (polyline): jeden objekt z přímých segmentů a oblouků navazujících konec na konec, každý se šířkou. Po počátečním bodu vypíše aktuální šířku; pak každý bod přidá segment, dokud příkaz neukončí Enter nebo <Keyword id="Close" />. Stejně jako v AutoCADu začíná úsečkami: <Keyword id="Arc" /> přepne na oblouky, každý tečný k předchozímu segmentu, a <Keyword id="Line" /> přepne zpět. Enter u počátečního bodu naváže na konec naposledy nakreslené úsečky, oblouku nebo křivky.

## Options

### Arc

Režim oblouků: každý koncový bod nakreslí oblouk tečný k poslednímu segmentu, nebo, jako první segment, ve směru, kterým končí naposledy nakreslená úsečka, oblouk nebo křivka. Podržením Ctrl směr přepnete. Volby níže tvarují další oblouk.

### Close

Nabízí se, jakmile existuje segment: uzavře křivku zpět do jejího začátku a ukončí příkaz; v režimu oblouků tečným obloukem.

### Halfwidth

Jako <Keyword id="Width" />, ale každá šířka se měří od středu segmentu k jeho okraji.

### Length

Úsečka zadané délky ve směru, kterým křivka pokračuje: podél posledního segmentu nebo tečně k poslednímu oblouku. Záporná délka vede zpět.

### Undo

Vrátí poslední segment a pokračuje v režimu toho předchozího. Když už žádný nezbývá, vypíše <Message id="allSegmentsUndone" />

### Width

Počáteční šířka, pak koncová, každá zadaná číslem nebo ukázaná od posledního vrcholu: 10 až 0 se zúží do hrotu, jako šipka. Koncová šířka platí i pro další segmenty a jako PLINEWID i pro příští spuštění příkazu KŘIVKA.

### Angle

Režim oblouků: středový úhel oblouku, pak jeho koncový bod, střed nebo poloměr.

### Center

Režim oblouků: střed oblouku, pak jeho koncový bod, středový úhel nebo délka tětivy.

### Direction

Režim oblouků: směr, kterým oblouk vychází z posledního vrcholu, místo tečny, pak jeho koncový bod.

### Line

Režim oblouků: zpět k přímým segmentům.

### Radius

Režim oblouků: poloměr oblouku, pak jeho koncový bod nebo středový úhel. Záporný poloměr nakreslí větší oblouk.

### Second pt

Režim oblouků: bod, kterým oblouk prochází, pak jeho koncový bod: oblouk třemi body.

## Missing

PLINEGEN: nová křivka klade typ čáry segment po segmentu, jako při PLINEGEN 0 (volba <Keyword command="PEDIT" id="Ltype gen" /> příkazu <Command id="PEDIT" /> ho zapne pro jednu křivku). Přerušovaný typ čáry na širokém segmentu se kreslí plný. Náhled širokého segmentu se nekreslí tlumenějším odstínem a výzva oblouku je na jednom řádku, kde ji AutoCAD láme na dva.

## Questions

### Jak se jmenuje příkaz KŘIVKA anglicky?

PLINE. V českém AutoCADu je jeho zkratka `K`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `PL` v české verzi spouští příkaz PLOCHA; celý název `KŘIVKA` funguje také a `_PLINE` v AutoCADu v jakémkoli jazyce.

### Jak nakreslit křivku s oblouky?

Zvolte <Keyword id="Arc" />: každý bod pak ukončí oblouk tečný k předchozímu segmentu, až do <Keyword id="Line" />. Chcete-li vyhladit už nakreslenou křivku přes její vrcholy, použijte <Command id="PEDIT" /> a jeho volbu <Keyword command="PEDIT" id="Fit" /> nebo <Keyword command="PEDIT" id="Spline" />.

### Proč se moje křivka kreslí silná?

Šířka zadaná v dřívějším příkazu KŘIVKA se pamatuje a další křivka s ní začíná, jak říká řádek po jejím počátečním bodu. Zvolte <Keyword id="Width" /> a dvakrát zadejte 0, abyste kreslili zase tence. S vypnutým <Command id="FILL" /> se široké křivky zobrazují jako obrysy.

### Jak spojit úsečky do křivky?

Spusťte <Command id="JOIN" /> a vyberte úsečky, oblouky a křivky, které navazují koncovými body: každý řetěz se stane jednou křivkou. Nebo spusťte <Command id="PEDIT" /> na úsečce, odpovězte <Keyword command="PEDIT" id="Yes" />, aby se převedla na křivku, a zbytek přidejte volbou <Keyword command="PEDIT" id="Join" />.

### Jak zjistit plochu nebo délku křivky?

Spusťte <Command id="AREA" />, stiskněte Enter pro <Keyword command="AREA" id="Object" /> a vyberte křivku: uzavřená vypíše svou plochu a obvod, otevřená svou délku.
