---
title: "Jehlan v AutoCADu: příkaz JEHLAN (PYRAMID)"
description: "Jak nakreslit 3D jehlan v AutoCADu příkazem JEHLAN (PYRAMID, zkratka JE): strany, podstava, výška, hrana, vepsaná podstava, horní poloměr komolého jehlanu."
figure: "Šestiboký jehlan s podstavou o poloměru 25 ke středu každé strany a výškou 40, viděný od jihovýchodu ve vizuálním stylu Skrytý."
sourceHash: "acbc5ffa71cb"
---

Příkaz JEHLAN (PYRAMID) nakreslí 3D těleso jehlanu: jeho první řádek uvede, kolik stran má podstava a jak se čte její poloměr, pak se zeptá na střed podstavy, poloměr a výšku. Podstava je pravidelný mnohoúhelník, jaký kreslí <Command id="POLYGON" />, na začátku čtyřstranný: zadaný poloměr ji natočí ke kurzoru, bod k sobě. Výška stoupá podél osy Z USS, záporná jde dolů, a bod ji určí svou vzdáleností od podstavy. Počet stran a způsob čtení poloměru se pamatují pro příští spuštění příkazu JEHLAN; poloměr a výška jsou společné výchozí hodnoty primitiv. Jehlan leží v aktuální hladině a <Command id="U" /> ho vrátí v jednom kroku.

<Command id="LIST" /> ukáže jeho polohu, poloměr podstavy i horní poloměr, výšku, natočení a počet stran a v paletě Vlastnosti lze zadat poloměry, strany a výšku. Jeho uzly ho posouvají, nastavují jeho výšku a mění velikost podstavy z rohu nebo ze středu strany. Je to 3D těleso pro <Command id="UNION" />, <Command id="SUBTRACT" /> a zbytek 3D v MellowCAD: jen 3D tělesa, zatím částečně; <Command id="EXPLODE" /> ho rozloží na oblast pro každou plochu.

## Options

### Edge

Ve výzvě ke středu podstavy: zeptá se na oba konce jedné strany podstavy, která se nakreslí nalevo od této strany.

### Sides

Ve výzvě ke středu podstavy: zeptá se na počet stran, 3 až 32, a pak znovu na střed.

### Inscribed

Ve výzvě k poloměru: čte poloměr k rohu podstavy, mnohoúhelník vepsaný do této kružnice, a zeptá se na něj znovu.

### Circumscribed

Ve výzvě k poloměru, když byla zvolena možnost <Keyword id="Inscribed" />: čte poloměr ke středu strany, mnohoúhelník opsaný této kružnici, jako na začátku, a zeptá se na něj znovu.

### 2Point

Ve výzvě k výšce: zeptá se na dva body a výška je vzdálenost mezi nimi.

### Axis

Ve výzvě k výšce: zeptá se na vrchol. Jehlan vede od středu podstavy k tomuto bodu v libovolném směru, s podstavou kolmou k ose.

### Top

Ve výzvě k výšce: zeptá se na horní poloměr, čtený jako poloměr podstavy, a pak znovu na výšku. Jehlan skončí menším mnohoúhelníkem místo bodu, komolým jehlanem; horní podstava stejně velká jako dolní vytvoří hranol.

## Missing

To, co chybí u <Command id="BOX" />: Posunout, Otočit, Měřítko a Zrcadlit z aktivního uzlu, vlastní 3D příkazy a vizuální styly, které nemá <Command id="VSCURRENT" />. Jeho typ, vepsaný nebo opsaný, zadávaný v paletě Vlastnosti. Tečkované kóty, které AutoCAD kreslí, zatímco zadáváte poloměr a hranu.

## Questions

### Jak se jmenuje příkaz JEHLAN anglicky?

PYRAMID. V českém AutoCADu je jeho zkratka `JE`: zadejte ji a stiskněte Enter nebo mezerník, pak zadejte střed podstavy, poloměr a výšku. Anglické `PYR` v české verzi nefunguje; `_PYRAMID` funguje v AutoCADu v jakémkoli jazyce.

### Jak nakreslit šestiboký jehlan?

Před středem podstavy zvolte <Keyword id="Sides" /> a zadejte `6`, pak zadejte střed, poloměr a výšku: `0,0`, `25` a `40` nakreslí jehlan z ukázky. Příští spuštění příkazu JEHLAN si šest stran ponechá.

### Jak nakreslit jehlan se zadanou stranou podstavy?

Zvolte <Keyword id="Edge" /> a zadejte oba konce jedné strany: strana od `0,0` do `50,0` vytvoří čtvercovou podstavu 50 s výchozími 4 stranami.

### Jak nakreslit komolý jehlan?

Ve výzvě k výšce zvolte <Keyword id="Top" />, zadejte horní poloměr a pak výšku. Jehlan skončí menším mnohoúhelníkem se stejným počtem stran jako podstava.
