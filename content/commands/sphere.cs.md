---
title: "Příkaz KOULE (SPHERE) v AutoCADu"
description: "Jak v AutoCADu nakreslit 3D kouli příkazem KOULE (SPHERE): střed a poloměr, Průměr, 3B, 2B a Ttr, a proč se koule zobrazí čarami. Vyzkoušejte zdarma."
figure: "Koule o poloměru 25 nakreslená ze středu, viděná od jihovýchodu ve vizuálním stylu Koncepční."
sourceHash: "c7bc67d1d847"
---

Příkaz KOULE (SPHERE) nakreslí 3D těleso ve tvaru koule: zadejte střed a pak poloměr. Poloměr určený myší se odečte v rovině procházející středem a poslední poloměr, společný s příkazy <Command id="CYLINDER" />, <Command id="CONE" /> a dalšími základními tělesy, se nabídne jako výchozí hodnota, kterou převezme Enter. Koule leží v aktuální hladině a Zpět ji odstraní v jednom kroku.

Ve vizuálních stylech 2D drátový model a Skrytý se kreslí čarami: poledníky a rovnoběžkami, v počtu podle `ISOLINES`, a uchopení objektu na ní najde jen střed. <Command id="LIST" /> ukáže její polohu a poloměr a v paletě Vlastnosti lze zapsat poloměr nebo průměr. Její uzly ji posouvají a uzly v kvadrantech rovníku mění poloměr. Je to 3D těleso pro příkazy <Command id="UNION" />, <Command id="SUBTRACT" /> a další 3D příkazy MellowCAD, jehož 3D zahrnuje jen 3D tělesa, zatím částečně.

## Options

### 3P

U středu: zeptá se na tři body a koule dostane střed a poloměr kružnice, která jimi prochází.

### 2P

U středu: zeptá se na dva konce průměru, kdekoli v prostoru.

### Ttr

U středu: vyberte dvě úsečky, kružnice nebo oblouky s uchopením Tečna a zadejte poloměr: střed leží na kružnici o tomto poloměru, která se dotýká obou, v jejich výšce.

### Diameter

U poloměru: zeptá se místo toho na průměr a nabídne dvojnásobek posledního poloměru.

## Missing

<Command id="EXPLODE" /> koule, kterou AutoCAD změní v povrch: MellowCAD nemá povrchy, takže oznámí, že ji nemůže rozložit. Posun, otočení, změna měřítka a zrcadlení z aktivního uzlu a vlastní 3D příkazy (3DMĚŘÍTKO): <Command id="3DMOVE" /> a <Command id="3DROTATE" /> ji posouvají a otáčejí. Obrys, který v AutoCADu kreslí `DISPSILH`. Vizuální styly, které příkazu <Command id="VSCURRENT" /> chybějí kromě stylů 2D drátový model, Skrytý a Koncepční.

## Questions

### Jak v AutoCADu udělat kouli?

Spusťte příkaz KOULE, zadejte střed a pak poloměr: `0,0,0` a `25` nakreslí kouli z ukázky. Otočte pohled, abyste ji viděli prostorově: rohem krychle ViewCube nebo příkazem <Command id="-VIEW" /> s možností <Keyword command="VIEW" id="SEiso" />.

### Proč koule vypadá jako kružnice s čarami?

Styly 2D drátový model a Skrytý kreslí kouli jako její poledníky a rovnoběžky; v půdorysu jsou to kružnice a čáry, které jí procházejí. Příkaz <Command id="VSCURRENT" /> s možností <Keyword command="VSCURRENT" id="Conceptual" /> ji vystínuje a `ISOLINES` určuje, kolik čar ukáže.

### Jak v AutoCADu udělat polokouli?

Nakreslete kouli a pak ji rozřízněte středem příkazem <Command id="SLICE" />: tři body v rovině nebo <Keyword command="SLICE" id="XY" /> a střed, a nakonec určete stranu, kterou chcete ponechat.

### Jak nakreslit kouli o daném průměru?

U poloměru zvolte <Keyword id="Diameter" /> a zadejte průměr. Kouli určí také dva konce průměru zadané v možnosti <Keyword id="2P" />.
