---
title: "Příkaz ODŘÍZNI (SLICE) v AutoCADu"
description: "Jak funguje příkaz ODŘÍZNI (SLICE, zkratka OZ) v AutoCADu: tělesa, rovina dvěma body, 3body, objektem nebo USS, pak strana, která zůstane."
figure: "Válec rozříznutý osou dvěma body, se zachovanou polovinou na určené straně: pohled od jihovýchodu."
sourceHash: "07b1512fb042"
---

Příkaz ODŘÍZNI (SLICE) rozřízne 3D tělesa rovinou a ponechá část na jedné její straně, nebo obě části jako dvě tělesa. Ptá se na tělesa k rozříznutí, dokud nestisknete Enter: jako v AutoCADu 2027 se sada vybraná předem zahodí a příkaz se zeptá znovu, a co není těleso, se přeskočí. Pak rovina: ve výchozím nastavení zadáte dva body a rovina jimi prochází svisle, kolmo k rovině XY systému USS; možnosti ji určí jinak. Nakonec bod na straně, kterou chcete ponechat, nebo Enter pro ponechání obou.

Každé těleso sady se rozřízne stejnou rovinou. Těleso, které rovina mine nebo se ho dotkne jen v ploše, podél hrany nebo v rohu, zůstane beze změny a příkaz ODŘÍZNI to oznámí. Rozříznuté těleso už není kvádr ani válec a nemá historii. Celý příkaz je jeden krok, který lze vrátit zpět. 3D v MellowCAD je zatím částečné: tělesa existují, povrchy a sítě ne.

## Options

### Object

Převezme rovinu objektu, který vyberete: kružnice, elipsy, oblouku, 2D křivky nebo rovinné spline, i skloněné kružnice. Úsečka ani samotné těleso nemají vlastní rovinu: příkaz vypíše <Message id="unableToExtractPlane" /> a zeptá se znovu. Enter příkaz ukončí.

### Surface

Zeptá se na povrch, podél kterého se má řezat. MellowCAD zatím nemá povrchy, takže po výběru vypíše <Message id="noSurfacesSelected" /> a Enter příkaz ukončí.

### Zaxis

Zeptá se na bod v rovině a pak na bod na její ose Z, přímce k ní kolmé. Nesmí to být tentýž bod.

### View

Rovina rovnoběžná s obrazovkou, procházející zadaným bodem; Enter převezme 0,0,0.

### XY

Rovina XY systému USS, procházející zadaným bodem: bod v určité výšce tam vytvoří vodorovný řez. Enter převezme počátek USS.

### YZ

Rovina YZ systému USS, procházející zadaným bodem; Enter převezme počátek USS.

### ZX

Rovina ZX systému USS, procházející zadaným bodem; Enter převezme počátek USS.

### 3points

Tři body v rovině, která pak může být skloněná libovolně. Je to výchozí možnost první výzvy, takže ji zvolí Enter. Druhý bod se musí lišit od prvního a třetí nesmí ležet na přímce jimi procházející.

### Both

Nabízí se ve výzvě k zadání strany a je v ní výchozí, takže ji zvolí Enter: zůstanou obě části. Těleso si ponechá jednu a druhá se stane novým tělesem se stejnou hladinou, barvou, typem čáry a tloušťkou čáry, ne s aktuálními. Bod místo toho ponechá stranu, na které leží, a druhou zahodí; bod v rovině se odmítne.

## Missing

Povrchy, jako řezná rovina i jako objekty k rozříznutí, a sítě. Rovinná 3D křivka jako objekt určující rovinu, kterou AutoCAD přijímá. Anuloid nebo rotační těleso rozříznuté ani kolmo k ose, ani podél ní, a další řezy, pro které MellowCAD zatím nemá přesný tvar: skončí zprávou, že jedna booleovská operace selhala.

## Questions

### Jak se jmenuje příkaz ODŘÍZNI anglicky?

SLICE. V české verzi AutoCADu zadejte `ODŘÍZNI` nebo zkratku `OZ` a stiskněte Enter nebo mezerník; zkratka `SL` z anglické verze v české nefunguje. Anglický název s podtržítkem, `_SLICE`, funguje v AutoCADu v každém jazyce.

### Jak v AutoCADu rozříznout 3D těleso?

Vyberte těleso a stiskněte Enter. Určete dva body, kterými řez prochází: rovina jimi vede svisle. Pak určete bod na straně, kterou chcete ponechat, nebo stiskněte Enter, aby zůstaly obě poloviny, a jednu odsuňte příkazem <Command id="MOVE" />. Pro šikmý řez zvolte <Keyword id="3points" /> a zadejte v rovině tři body.

### Rozřízne příkaz ODŘÍZNI úsečky nebo 2D objekty?

Ne: příkaz ODŘÍZNI řeže 3D tělesa a úsečky, oblasti a bloky přeskočí; sada složená jen z nich příkaz ukončí. K řezání 2D objektů použijte příkaz <Command id="TRIM" /> nebo <Command id="BREAK" />. V AutoCADu příkaz ODŘÍZNI řeže i povrchy a sítě, které MellowCAD zatím nemá.

### Proč příkaz ODŘÍZNI hlásí, že rovina neprotíná těleso?

Protože ho rovina míjí nebo se ho dotýká jen v ploše, podél hrany nebo v rohu: takové těleso zůstane celé. Zkontrolujte, jak byla rovina zadána. Zadaná dvěma body je svislá, takže dva body na horní ploše tělesa ho rozříznou svisle, ne vodorovně; pro vodorovný řez zvolte <Keyword id="XY" /> a zadejte bod ve výšce řezu.
