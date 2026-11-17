---
title: "Příkaz PRŮŘEZ (SECTION) v AutoCADu"
description: "Jak příkaz PRŮŘEZ (SECTION, zkratka PRU) v AutoCADu vytvoří oblast tam, kde rovina protíná 3D tělesa: 3body, Objekt, Zosa, Pohled, XY, YZ, ZX."
figure: "Kvádr s průchozím otvorem proříznutý rovinou ZX středem otvoru: PRŮŘEZ vytvoří profil, vysunutý dopředu, dva obdélníky s mezerou po otvoru."
sourceHash: "f1c01b76c810"
---

Příkaz PRŮŘEZ (SECTION) vytvoří průřez 3D těles: oblast v místě, kde rovina protíná každé z nich, a tělesa zůstanou beze změny. Ptá se na tělesa, dokud nestisknete Enter: jako v AutoCADu 2027 se sada vybraná předem zahodí a příkaz se zeptá znovu, co není těleso, se přeskočí a u sady bez tělesa vypíše <Message id="noSolidsSelected" />. Pak rovina: ve výchozím nastavení na ní zadáte tři body a možnosti ji určí jinak, jako u příkazu <Command id="SLICE" />.

Každé těleso, které rovina protne, dostane svou oblast, ležící v této rovině: kvádr s průchozím otvorem dá obrys s mezerou po otvoru, válec proříznutý podél osy obdélník. Rovina ležící na ploše tělesa dá tuto plochu. U tělesa, které rovina mine, vypíše <Message id="sectionMissedOne" />. Oblasti dostanou aktuální hladinu a vlastnosti, ne vlastnosti tělesa; příkaz <Command id="MOVE" /> jednu vysune, abyste ji viděli, příkazy <Command id="AREA" /> a <Command id="MASSPROP" /> ji změří a příkaz <Command id="EXTRUDE" /> z ní udělá těleso. Celý příkaz je jeden krok, který lze vrátit zpět. 3D v MellowCAD jsou jen 3D tělesa, zatím částečně.

## Options

### Object

Převezme rovinu objektu, který vyberete: kružnice, elipsy, oblouku, 2D spline nebo 2D křivky.

### Zaxis

Zeptá se na bod v rovině a pak na bod na její ose Z, přímce k ní kolmé.

### View

Rovina rovnoběžná s obrazovkou, procházející zadaným bodem.

### XY

Rovina XY systému USS, procházející zadaným bodem: bod v určité výšce tam vytvoří vodorovný průřez. Enter převezme počátek USS.

### YZ

Rovina YZ systému USS, procházející zadaným bodem; Enter převezme počátek USS.

### ZX

Rovina ZX systému USS, procházející zadaným bodem; Enter převezme počátek USS. Průřez v ukázce určuje tato rovina středem otvoru.

### 3points

Tři body v rovině, která pak může být skloněná libovolně. Je to výchozí možnost první výzvy, takže bod zadaný v ní je prvním ze tří.

## Missing

Povrchy a sítě, které MellowCAD nemá. Rovinná 3D křivka jako objekt určující rovinu, kterou AutoCAD přijímá. Řezy, pro které MellowCAD zatím nemá přesný tvar, jako u příkazu <Command id="SLICE" />: skončí zprávou, že jedna booleovská operace selhala. Příkaz SECTIONPLANE a živé řezy, které pás karet AutoCADu nabízí místo příkazu PRŮŘEZ: zde se PRŮŘEZ zadává z klávesnice.

## Questions

### Jak v AutoCADu udělat řez 3D tělesem?

Spusťte příkaz PRŮŘEZ, vyberte těleso a stiskněte Enter, pak určete rovinu: <Keyword id="ZX" /> a bod uprostřed ho proříznou zepředu dozadu, <Keyword id="XY" /> a bod v určité výšce vodorovně. Oblast leží uvnitř tělesa: vysuňte ji příkazem <Command id="MOVE" />, abyste ji viděli.

### Jaký je rozdíl mezi příkazy PRŮŘEZ a ODŘÍZNI?

<Command id="SLICE" /> rozřízne těleso na dvě části a ponechá jednu nebo obě. PRŮŘEZ ponechá těleso celé a nakreslí oblast tam, kde ho rovina protíná.

### Jak se jmenuje příkaz PRŮŘEZ anglicky?

SECTION. V české verzi AutoCADu zadejte `PRŮŘEZ` nebo zkratku `PRU` a stiskněte Enter nebo mezerník; zkratka `SEC` z anglické verze v české nefunguje. `_SECTION` funguje v AutoCADu v každém jazyce.

### Proč příkaz PRŮŘEZ hlásí, že rovina neprotíná těleso?

Rovina ho míjí: zkontrolujte, jak jste ji zadali. <Keyword id="XY" />, <Keyword id="YZ" /> a <Keyword id="ZX" /> jsou roviny systému USS, takže bod ve špatné výšce nebo na špatné straně umístí rovinu mimo těleso.
