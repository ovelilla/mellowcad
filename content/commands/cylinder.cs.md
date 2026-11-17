---
title: "Příkaz VÁLEC (CYLINDER) v AutoCADu"
metaTitle: "Válec v AutoCADu 3D: příkaz VÁLEC, VAL"
description: "Jak nakreslit 3D válec v AutoCADu příkazem VÁLEC (CYLINDER, zkratka VAL): základna, poloměr, výška, 3B, 2B, Ttr, Eliptický, koncový bod osy. Zdarma online."
figure: "Válec o poloměru 20 a výšce 40, ze středu základny, při pohledu od jihovýchodu ve vizuálním stylu Skrytý."
sourceHash: "ce397d8dcb5d"
---

Příkaz VÁLEC (CYLINDER) kreslí válec jako 3D těleso: zadejte střed jeho základny, pak poloměr, pak výšku. Základna leží v rovině XY souřadného systému USS, ve výšce Z středu, a výška stoupá podél jeho osy Z; záporná jde dolů a bod ji udává svou vzdáleností od základny, jako u příkazu <Command id="BOX" />. Poloměr a výška se nabízejí jako výchozí hodnoty, které přijme Enter, sdílené s ostatními základními tělesy a příkazem <Command id="EXTRUDE" />. Válec leží v aktuální hladině a krok zpět ho odstraní najednou.

Válec si ponechává své rozměry: <Command id="LIST" /> ukáže jeho polohu, normálu, poloměr a výšku a paleta Vlastnosti dovolí poloměr a výšku přepsat. Jeho uzly ho posouvají, nastavují jeho výšku a v každé čtvrtině základny jeho poloměr. Je to 3D těleso pro příkazy <Command id="UNION" />, <Command id="SUBTRACT" /> a zbytek 3D v MellowCADu, který tvoří jen 3D tělesa, zatím částečně.

## Options

### 3P

U středu základny: zeptá se na tři body a základna je kružnice jimi procházející, v jejich rovině. Tři body v rovině XY souřadného systému USS dají válec, který stále stoupá podél Z.

### 2P

U středu základny: zeptá se na oba konce průměru základny; druhý se čte v rovině prvního.

### Ttr

U středu základny: vyberte dvě úsečky, kružnice nebo oblouky, s uchopením Tečna, a zadejte poloměr: základna se dotkne obou, co nejblíže vybraným bodům, v jejich výšce.

### Elliptical

U středu základny: základna je elipsa. Zadejte oba konce její první osy, pak konec druhé; nebo vyberte <Keyword id="Center" /> a zadejte její střed, polovinu délky první osy a pak konec druhé osy.

### Diameter

U poloměru: zeptá se místo něj na průměr a nabídne dvojnásobek posledního poloměru.

### 2Point

U výšky: zeptá se na dva body a výška je vzdálenost mezi nimi.

### Axis

U výšky: zeptá se na druhý konec osy. Válec vede ze středu základny do tohoto bodu v libovolném směru, se základnou kolmou k ose.

## Missing

<Command id="EXPLODE" /> válce, který AutoCAD rozloží na obě podstavy a plochu: MellowCAD plochy nemá, a tak ohlásí, že ho rozložit nemohl. Posun, Otočení, Měřítko a Zrcadlení z aktivního uzlu a výška tažená za základnu. Tečkované kóty, které AutoCAD kreslí, když zadáváte poloměr, body elipsy a osu. Změna kruhového válce na eliptický zadáním v paletě Vlastnosti. Obrysy, které kreslí `DISPSILH` v AutoCADu. V půdorysu, kde horní kružnice zakrývá kružnici základny, najde uchopení Nejbližší kružnici základny, kde AutoCAD najde horní. Vizuální styly, které <Command id="VSCURRENT" /> nemá kromě stylů 2D drátový model, Skrytý a Koncepční.

## Questions

### Jak se jmenuje příkaz VÁLEC anglicky a jakou má zkratku?

Anglicky CYLINDER, v českém AutoCADu VÁLEC: zadejte `VAL`, stiskněte Enter nebo mezerník a pak zadejte střed základny, poloměr a výšku: `0,0`, `20` a `40` nakreslí válec z ukázky. Anglické `CYL` v českém AutoCADu nefunguje; `_CYLINDER` funguje v AutoCADu v jakémkoli jazyce.

### Jak v AutoCADu nakreslit vodorovný válec?

U výšky vyberte <Keyword id="Axis" /> a zadejte druhý konec osy: od základny v `0,0,0` položí bod `60,0,0` válec podél X.

### Jak vytvořit dutý válec nebo trubku?

Nakreslete dva válce ze stejného středu, vnitřní užší, a pak spusťte <Command id="SUBTRACT" />: vyberte vnější, Enter, vnitřní, Enter.

### Proč válec vypadá jako kružnice?

Díváte se na něj shora, v půdorysu. Otočte pohled: roh krychle ViewCube, <Command id="-VIEW" /> a <Keyword command="VIEW" id="SEiso" />, nebo <Command id="3DORBIT" />.
