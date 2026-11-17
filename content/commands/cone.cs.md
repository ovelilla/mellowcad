---
title: "Příkaz KUŽEL (CONE) v AutoCADu"
metaTitle: "Kužel a komolý kužel v AutoCADu: KUŽEL"
description: "Jak nakreslit 3D kužel nebo komolý kužel v AutoCADu příkazem KUŽEL (CONE): podstava, poloměr, výška, Horní poloměr, Eliptický a koncový bod osy."
figure: "Kužel o poloměru 20 a výšce 40, od středu podstavy, z jihovýchodu ve vizuálním stylu Skrytý."
sourceHash: "1c40f02e6b3c"
---

Příkaz KUŽEL (CONE) nakreslí kužel jako 3D těleso: zadejte střed jeho podstavy, pak poloměr, pak výšku, a kužel se zúží do bodu. Ptá se na totéž co <Command id="CYLINDER" />, s možností <Keyword id="Top" /> u výšky pro komolý kužel. Podstava leží v rovině XY systému USS, ve výšce Z středu, a výška roste podél jeho osy Z; záporná kužel otočí dolů a bod ji určí vzdáleností od podstavy. Poloměr a výška se nabízejí jako výchozí hodnoty, které přijme Enter, společné s ostatními základními tělesy. Kužel leží v aktuální hladině a jeden krok zpět ho odstraní.

<Command id="LIST" /> zobrazí jeho polohu, normálu, poloměr podstavy, horní poloměr a výšku a paleta Vlastnosti je umožňuje zadat. Jeho uzly ho posouvají, nastavují jeho výšku, poloměr podstavy v každé čtvrtině podstavy a horní poloměr. Vrchol se uchopí jako koncový bod. Je to 3D těleso pro příkazy <Command id="UNION" />, <Command id="SUBTRACT" /> a zbytek 3D v MellowCAD, které tvoří jen 3D tělesa, zatím částečně.

## Options

### 3P

U středu podstavy: zeptá se na tři body a podstavou je kružnice, která jimi prochází, v jejich rovině.

### 2P

U středu podstavy: zeptá se na dva koncové body průměru podstavy.

### Ttr

U středu podstavy: vyberte dvě úsečky, kružnice nebo oblouky, s uchopením Tečna, a zadejte poloměr: podstava se dotýká obou.

### Elliptical

U středu podstavy: podstava je elipsa, zadaná oběma koncovými body první osy a koncovým bodem druhé, nebo s možností <Keyword id="Center" /> od svého středu. Horní poloměr zmenší tutéž elipsu.

### Diameter

U poloměru: zeptá se místo něj na průměr a nabídne dvojnásobek posledního poloměru.

### 2Point

U výšky: zeptá se na dva body a výškou je vzdálenost mezi nimi.

### Axis

U výšky: zeptá se na vrchol. Kužel vede od středu podstavy k tomuto bodu v libovolném směru, s podstavou kolmou k ose.

### Top

U výšky: zeptá se na horní poloměr a pak znovu na výšku. Kužel končí kružnicí místo bodu, jako komolý kužel; horní podstava stejně široká jako dolní dá stěny válce, širší kužel rozšiřující se vzhůru. Nabídne horní poloměr posledního kužele, na začátku 0.

## Missing

Příkaz <Command id="EXPLODE" /> na kuželu, který AutoCAD rozloží na podstavu a povrch: MellowCAD povrchy nemá, takže vypíše, že ho nemohl rozložit. Změna kruhového kužele na eliptický zadáním v paletě Vlastnosti. Při `ISOLINES` rovném 0 tečka, kterou AutoCAD kreslí ve vrcholu. A to, co chybí příkazu <Command id="CYLINDER" />: Posunout, Otočit, Měřítko a Zrcadlit z aktivního uzlu, tečkované kóty při zadávání poloměru a vizuální styly, které nemá <Command id="VSCURRENT" />.

## Questions

### Jak nakreslit kužel v AutoCADu?

Spusťte příkaz KUŽEL, zadejte střed podstavy, poloměr a výšku: `0,0`, `20` a `40` nakreslí kužel z ukázky. Abyste ho viděli, otočte pohled rohem krychle ViewCube nebo příkazem <Command id="-VIEW" /> s možností <Keyword command="VIEW" id="SEiso" />.

### Jak nakreslit komolý kužel v AutoCADu?

U výšky zvolte <Keyword id="Top" />, zadejte horní poloměr a pak výšku. Kužel skončí kružnicí s tímto poloměrem.

### Jak nakreslit obrácený kužel?

Zadejte zápornou výšku: kužel směřuje od podstavy dolů. Nebo zvolte <Keyword id="Axis" /> a zadejte vrchol kamkoli.

### Může být podstava kužele elipsa?

Ano: u středu podstavy zvolte <Keyword id="Elliptical" /> a zadejte její osy. Horní poloměr udělá z horní podstavy tutéž elipsu, menší.
