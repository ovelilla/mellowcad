---
title: "Kvádr v AutoCADu: příkaz KVÁDR (BOX)"
metaTitle: "Kvádr v AutoCADu 3D: příkaz KVÁDR (BOX)"
description: "Jak nakreslit 3D kvádr v AutoCADu příkazem KVÁDR (BOX): dva rohy a výška, Střed, Krychle, Délka a 2Body. Vyzkoušejte zdarma online."
figure: "Kvádr 60 × 40 × 25, ze dvou rohů a výšky, při pohledu od jihovýchodu ve vizuálním stylu Skrytý."
sourceHash: "f272a5f0c236"
---

Příkaz KVÁDR (BOX) nakreslí kvádr jako 3D těleso se stranami podél os USS: zadejte první roh, druhý roh a potom výšku. Výška roste podél osy Z USS, záporná jde dolů a bod ji určí svou vzdáleností od rohu; roh zadaný v jiné výšce Z než první nastaví výšku bez otázky. Poslední výška a poslední délka a šířka krychle nebo možnosti Délka se nabízejí jako výchozí hodnoty, které přijme Enter, společné s ostatními základními tělesy a příkazem <Command id="EXTRUDE" />. Kvádr leží v aktuální hladině a jedním krokem zpět ho odstraníte.

Kvádr si pamatuje své rozměry: <Command id="LIST" /> ukáže jeho polohu, délku, šířku, výšku a otočení a paleta Vlastnosti umožní zadat první čtyři. Jeho uzly ho posouvají, protahují a mimo půdorys nastavují jeho výšku. Je to 3D těleso pro <Command id="UNION" />, <Command id="SUBTRACT" /> a zbytek 3D v MellowCAD, které tvoří jen 3D tělesa, zatím částečně.

## Options

### Center

Na první výzvu: zeptá se na střed, potom na roh, <Keyword id="Cube" /> nebo <Keyword id="Length" />. Kvádr je vystředěn v bodě, i na výšku.

### Cube

Na výzvu k druhému rohu: zeptá se na délku, zadanou nebo ukázanou, a vytvoří krychli se všemi stranami této délky. Zadaná délka míří ke kurzoru, záporná od něj.

### Length

Na výzvu k druhému rohu: zeptá se na délku, potom na šířku. Délka míří ke kurzoru, takže kvádr může ležet pod úhlem; šířka jde na stranu, na které je kurzor.

### 2Point

Na výzvu k výšce: zeptá se na dva body a výška je vzdálenost mezi nimi.

## Missing

Režimy POSUN, OTOČ, MĚŘÍTKO a ZRCADLI z aktivního uzlu, mezi kterými AutoCAD přepíná klávesou Enter. Vlastní 3D příkazy – 3DMĚŘÍTKO, ZRCADLI3D, OTOČ3D, SROVNEJ, 3DSROVNEJ – s jejich gizmy: <Command id="3DMOVE" /> a <Command id="3DROTATE" /> ho posouvají a otáčejí svými gizmy. Tečkované kóty, které AutoCAD kreslí, když zadáváte roh, délku a šířku. Příkazy <Command id="FILLET" /> a <Command id="CHAMFER" /> na jeho hranách, což dělají <Command id="FILLETEDGE" /> a <Command id="CHAMFEREDGE" />. Záznam a zobrazení historie tělesa a řádek Materiál. Vizuální styly, které <Command id="VSCURRENT" /> nemá kromě 2D drátového modelu, Skrytého a Koncepčního.

## Questions

### Jak nakreslit 3D kvádr v AutoCADu?

Spusťte příkaz KVÁDR, zadejte jeden roh, potom protější roh, potom výšku: `0,0`, `60,40` a `25` nakreslí kvádr z ukázky. <Keyword id="Length" /> a šířka místo protějšího rohu natočí kvádr pod libovolným úhlem.

### Proč kvádr vypadá jako obdélník?

Díváte se na něj shora, v půdorysu. Otočte pohled: roh krychle ViewCube, <Command id="-VIEW" /> a <Keyword command="VIEW" id="SEiso" />, nebo <Command id="3DORBIT" />. <Command id="VSCURRENT" /> s možností <Keyword command="VSCURRENT" id="Hidden" /> skryje hrany za ním.

### Jak nakreslit krychli v AutoCADu?

Zadejte první roh, potom zvolte <Keyword id="Cube" /> a zadejte délku strany.

### Jak nakreslit kvádr od středu?

Zvolte <Keyword id="Center" /> a zadejte středový bod, potom roh, <Keyword id="Cube" /> nebo <Keyword id="Length" />: kvádr je vystředěn v bodě, i na výšku.
