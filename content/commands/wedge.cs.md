---
title: "Příkaz KLÍN (WEDGE) v AutoCADu"
description: "Jak v AutoCADu nakreslit 3D klín příkazem KLÍN (WEDGE, zkratka KL), krok za krokem: dva rohy a výška, Střed, Krychle, Délka a 2Body."
figure: "Klín 60 na 40 na 25 ze dvou rohů a výšky, se sklonem od strany prvního rohu, viděný od jihovýchodu ve vizuálním stylu Skrytý."
sourceHash: "06fba2eeb7be"
---

Příkaz KLÍN (WEDGE) nakreslí 3D těleso ve tvaru klínu: kvádr, jehož horní plocha klesá od jednoho konce ke druhému. Ptá se na totéž co <Command id="BOX" />: první roh, druhý roh a pak výšku. Vysoký konec je u prvního rohu a sklon klesá podél osy X systému USS směrem ke straně druhého rohu; druhý roh s menším X klín obrátí. Výška se měří podél osy Z systému USS, záporná dolů. Délka, šířka a výška jsou výchozí hodnoty příkazu <Command id="BOX" />, které převezme Enter. Klín vznikne v aktuální hladině a Zpět ho odstraní v jednom kroku.

<Command id="LIST" /> ukáže jeho polohu, délku, šířku, výšku a natočení a v paletě Vlastnosti je lze zapsat. Jeho uzly jsou stejné jako u příkazu <Command id="BOX" />. Je to 3D těleso pro příkazy <Command id="UNION" />, <Command id="SUBTRACT" /> a zbytek 3D v MellowCAD, který zahrnuje jen 3D tělesa, zatím částečně; <Command id="EXPLODE" /> z něj udělá samostatnou oblast pro každou plochu.

## Options

### Center

V první výzvě: zeptá se na střed a pak na roh, <Keyword id="Cube" /> nebo <Keyword id="Length" />. Klín je vystředěný v bodě, i ve výšce, a jeho vysoký konec leží naproti zadanému rohu.

### Cube

U druhého rohu: zeptá se na délku a vytvoří klín se všemi stranami této délky. Na rozdíl od příkazu <Command id="BOX" /> vede klín podél osy X systému USS, při záporné hodnotě dozadu.

### Length

U druhého rohu: zeptá se na délku, podél osy X systému USS, a pak na šířku, podél jeho osy Y; záporná hodnota vede dozadu. Bod určí jen svou vzdálenost, nikdy směr.

### 2Point

U výšky: zeptá se na dva body a výška je vzdálenost mezi nimi.

## Missing

To, co chybí příkazu <Command id="BOX" />: posun, otočení, změna měřítka a zrcadlení z aktivního uzlu, vlastní 3D příkazy, tečkované kóty při zadávání rohu a vizuální styly, které chybějí příkazu <Command id="VSCURRENT" />. V půdorysu najde uchopení Koncový bod pod vysokým koncem roh horní plochy, zatímco AutoCAD najde roh základny.

## Questions

### Jak se jmenuje příkaz KLÍN anglicky?

WEDGE. V české verzi AutoCADu zadejte `KLÍN` nebo zkratku `KL` a stiskněte Enter nebo mezerník; zkratka `WE` z anglické verze v české nefunguje. `_WEDGE` funguje v AutoCADu v každém jazyce. Pak zadejte první roh, druhý roh a výšku: `0,0`, `60,40` a `25` nakreslí klín z ukázky.

### Kterým směrem klín klesá?

Dolů od strany prvního rohu, podél osy X systému USS. Chcete-li ho obrátit, zadejte druhý roh s menším X, což ho otočí o 180°, nebo ho otočte dodatečně příkazem <Command id="ROTATE" />.

### Jak v AutoCADu nakreslit trojboký hranol?

Klín jím je: pravoúhlý trojúhelník na každém konci, protažený po celé šířce. Jakýkoli jiný trojúhelník nakreslete jako uzavřenou křivku příkazem <Command id="PLINE" /> a vysuňte ho příkazem <Command id="EXTRUDE" />.

### Jak nakreslit klín ze středu?

Zvolte <Keyword id="Center" /> a zadejte středový bod, pak roh, <Keyword id="Cube" /> nebo <Keyword id="Length" />: klín je vystředěný v bodě, i ve výšce.
