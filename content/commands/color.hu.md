---
title: "Objektumszín az AutoCAD-ben: SZÍN (COLOR) parancs"
metaTitle: "Objektumszín az AutoCAD-ben: SZÍN, Fólia szerint"
description: "Az új objektumok színe az AutoCAD-ben a SZÍN (COLOR, S) paranccsal: Fólia szerint, indexszín névvel vagy számmal, vagy True Color RGB-ben. Próbálja ki ingyen."
figure: "Fólia szerint rajzolt lemez, a lyuka vörösben, a furata 0,128,255 True Color színben, majd a SZÍN ismét Fólia szerint értékre állítva."
sourceHash: "93793c2915da"
---

A SZÍN (COLOR) parancs azt a színt állítja be, amellyel az új objektumok rajzolódnak. Az AutoCAD a Szín kiválasztása párbeszédpanelt nyitja meg; a MellowCAD-ben ez még nincs, így a SZÍN a parancssori változatot futtatja, amely az AutoCAD-ben is megvan: <Command id="-COLOR" />. Bekéri az alapértelmezett objektumszínt, az aktuálisat felkínálva, új rajzban a `FÓLIA` értéket: a Fólia szerint azt jelenti, hogy minden objektum a fóliája színét veszi fel, a helyette választott szín pedig az objektum saját színe. Írja be egy indexszín számát vagy nevét, vagy válassza a <Keyword id="Truecolor" /> opciót. Az Enter megtartja az aktuális színt, a módosítás pedig egy lépés, amelyet a <Command id="U" /> parancs visszavon.

Az olyan szóra, amelyet nem tud értelmezni, az üzenet <Message id="colorRequired" />, a 0-ra, a negatív számra vagy a 255-nél nagyobbra <Message id="invalidColorNumber" />; ezután újra kérdez. Egy parancson belül aposztróffal beírva, `'SZÍN` alakban, minden utána rajzolt objektum az új színt kapja: a <Command id="LINE" /> parancs minden szakasza azt a színt, amely az indulásakor aktuális. A SZÍN csak az ezután rajzolt objektumok színét állítja be; a már megrajzolt objektumokat a Tulajdonságok paletta vagy a felső sáv színlistája módosítja.

## Options

### Truecolor

Három, 0 és 255 közötti értékként kéri a színt – vörös, zöld és kék –, szóköz nélkül, vesszővel elválasztva: a `0,128,255` közepes kék. Az indexszínnel is megegyező színt, például a `255,0,0` értéket, indexszínként tárolja.

### BYLAYER

Az új objektumok a fóliájuk színét kapják, ahogy kezdetben is.

### RED

Az 1-es indexszín, `1`-ként is beírható.

### YELLOW

A 2-es indexszín, `2`-ként is beírható.

### GREEN

A 3-as indexszín, `3`-ként is beírható.

### CYAN

A 4-es indexszín, `4`-ként is beírható.

### BLUE

Az 5-ös indexszín, `5`-ként is beírható.

### MAGENTA

A 6-os indexszín, `6`-ként is beírható.

### WHITE

A 7-es indexszín, `7`-ként is beírható: sötét háttéren fehér, világoson fekete.

## Missing

A Szín kiválasztása párbeszédpanel, a színkatalógusok és a HSL színmegadás. A 8–255-ös indexszínek: csak az 1–7-et fogadja el. A Blokk szerint. Az indexszínnel egyező True Color színt indexszínként tárolja, ahol az AutoCAD megtartja az RGB-értéket. Az átlátszóság (CETRANSPARENCY), valamint a típusonkénti alapértelmezések: HPCOLOR, HPLAYER, DIMLAYER és TEXTLAYER.

## Questions

### Mi az AutoCAD SZÍN parancs angolul, és mi a rövidítése?

Angolul COLOR, a magyar AutoCAD-ben SZÍN: írja be az `S` vagy a `SZIN` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt; a `DPSZÍN` is működik. Az angol `COL` a magyar AutoCAD-ben nem működik; a `_COLOR` az AutoCAD bármely nyelvén igen.

### Hogyan lehet módosítani egy objektum színét az AutoCAD-ben?

Jelölje ki, és válassza ki a színt a felső sáv színlistájában vagy a Tulajdonságok paletta Szín sorában: egyetlen lépésben módosul. Vagy vegye át egy másik objektum színét a <Command id="MATCHPROP" /> paranccsal. A SZÍN csak az utána rajzolt objektumok színét állítja be.

### Mit jelent a Fólia szerint az AutoCAD-ben?

Azt, hogy az objektum a fóliája színét veszi fel, így ha a Fóliatulajdonság-kezelőben módosítja a fólia színét, a rajta lévő összes Fólia szerinti objektum színe megváltozik. Ez az alapértelmezés, és fóliák szerint rendezve tartja a rajz színeit: <Command id="LAYER" />.

### Hogyan lehet RGB-színeket használni az AutoCAD-ben?

Válassza a <Keyword id="Truecolor" /> opciót, és írja be a három értéket vesszővel elválasztva, például `0,128,255`.
