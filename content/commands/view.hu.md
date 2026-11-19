---
title: "AutoCAD NÉZET (VIEW) parancs"
metaTitle: "AutoCAD NÉZET (VIEW): izometrikus és felülnézet"
description: "Így fordít az AutoCAD NÉZET (VIEW, N, -NÉZET) parancsa a hat ortografikus és a négy izometrikus nézetre, és milyen FKR-t állít be az ortografikus. Próbálja ki!"
figure: "Felülnézetben rajzolt lépcsős tömb: -NÉZET és DNy-i izometrikus, és délnyugatról, felülről látszik, Takartvonalas látványstílusban."
sourceHash: "261c8657f5f7"
---

A NÉZET (VIEW) parancs az AutoCAD tíz előre beállított nézetének egyikére fordítja a nézetet: hat ortografikusra, amely egyenesen a modell egyik oldalára néz, és négy izometrikusra, amely egy sarokból néz le. A rajzban semmi sem mozdul el. A NÉZET parancs a <Command id="-VIEW" /> parancsot, a parancssori változatot futtatja: első promptja felsorolja az <Keyword id="Orthographic" /> opciót, amely aztán az oldalt kéri, de egy nézet nevét is rögtön elfogadja, ahogy az AutoCAD menüi megadják: <Command id="-VIEW" />, majd <Keyword id="SWiso" />. Minden nézet a teljes rajzot mutatja, és ezt írja ki: <Message id="regeneratingModel" />.

A rajzterület bal felső sarkában lévő nézetvezérlő ugyanezt a tíz nézetet sorolja fel, és a <Command id="-VIEW" /> parancsot futtatja, a ViewCube lapjai és sarkai pedig szintén ezekre fordítanak, az FKR-t változatlanul hagyva. Minden NÉZET parancs egy visszavonási lépés, így a <Command id="U" /> parancs a nézetet az általa beállított FKR-rel együtt vonja vissza. Aposztróffal egy másik parancson belül begépelve ezzel az üzenettel utasítja el: <Message id="requiresRegen" />. A MellowCAD 3D-je csak szilárdtestekből áll, és egyelőre részleges.

## Options

### Orthographic

Azt az oldalt kéri, amelyre nézni szeretne, alapértelmezés szerint a <Keyword id="Top" /> nézetet, így ott az Enter a felülnézetet adja: <Keyword id="Top" />, <Keyword id="Bottom" />, <Keyword id="Front" />, <Keyword id="BAck" />, <Keyword id="Left" /> vagy <Keyword id="Right" />. Mindegyik álló helyzetű: a felülnézetben az X jobbra, az Y felfelé mutat, az elölnézetben az X jobbra, a Z felfelé, az alulnézetben, alulról nézve, az X balra. Az első promptnál begépelve mindegyik oldal az opció nélkül is működik.

Mindegyik az FKR-t is a néző felé fordítja, a világ tengelyeiből kiindulva, bármilyen volt is az FKR, az origót a `0,0,0` pontba téve, ahogy az <Command id="UCS" /> parancs ortografikus opciója: az elölnézet után az XY sík az elülső oldal, így amit rajzol, az laposan fekszik a képernyőn, és az FKR neve `*ELÖL*`. A felülnézet után a világ tengelyei érvényesek, a neve `*FELÜL*`.

### SWiso

Délnyugati izometrikus: elölről és balról, a sarokból néz le, és az elülső oldalt, a bal oldalt és a tetejét mutatja. Az FKR változatlan marad. Ez a minta nézete.

### SEiso

Délkeleti izometrikus: elölről és jobbról, a sarokból néz le, és az elülső oldalt, a jobb oldalt és a tetejét mutatja. Az FKR változatlan marad.

### NEiso

Északkeleti izometrikus: hátulról és jobbról, a sarokból néz le, és a hátsó oldalt, a jobb oldalt és a tetejét mutatja. Az FKR változatlan marad.

### NWiso

Északnyugati izometrikus: hátulról és balról, a sarokból néz le, és a hátsó oldalt, a bal oldalt és a tetejét mutatja. Az FKR változatlan marad.

## Missing

Az elnevezett nézetek: az első prompt csak az <Keyword id="Orthographic" /> opciót sorolja fel, míg az AutoCAD-é a `?`, a Töröl, a Visszaállít, az elMent, a Beállítások és az ABlak opciót is, és az ott begépelt nevet a parancs elutasítja. A Nézetkezelő, amelyet az AutoCAD-ben a NÉZET parancs nyit meg. Üres rajznál a nézet megtartja a nagyítást, míg az AutoCAD a rajzhatárokat mutatja. Az UCSORTHO és az UCSBASE változó: az ortografikus nézet mindig a világ tengelyeiből igazítja az FKR-t. Az igazított FKR az <Command id="UCS" /> parancs <Keyword command="UCS" id="Previous" /> listájában.

## Questions

### Hogyan lehet izometrikus nézetet beállítani az AutoCAD-ben?

Írja be a <Command id="-VIEW" /> parancsot, majd a délnyugati izometrikus nézethez a <Keyword id="SWiso" /> opciót; a <Keyword id="SEiso" />, az <Keyword id="NEiso" /> és az <Keyword id="NWiso" /> a másik három sarkot adja. Vagy válassza a DNy-i izometrikus nézetet a bal felső nézetvezérlőben, vagy kattintson a ViewCube egyik felső sarkára. Az <Command id="VSCURRENT" /> parancs <Keyword command="VSCURRENT" id="Hidden" /> opciója elrejti a hátsó éleket.

### Melyik paranccsal lehet felülnézetet beállítani?

<Command id="-VIEW" />, majd <Keyword id="Top" />, amely az FKR-t is a világ tengelyeire állítja. Az <Command id="PLAN" /> parancs ezzel szemben az aktuális FKR-re néz le, és azt változatlanul hagyja.

### Miért változott meg az FKR az elölnézet után?

Az ortografikus nézet az FKR-t a néző felé fordítja, hogy amit rajzol, a képernyő síkjában feküdjön. Az <Command id="UCS" /> parancs és az Enter visszavisz a világ koordináta-rendszerhez; a <Command id="U" /> parancs a nézetet és az FKR-jét együtt vonja vissza.

### Ugyanaz az izometrikus nézet, mint az izometrikus rajz?

Nem. Az izometrikus nézet egy sarokból néz egy 3D modellre. Az izometrikus rajz 2D, és az izometrikus síkokon készül a RASZTER parancs izometrikus stílusával, amely a MellowCAD-ben még nincs meg.

### Hol van a Nézetkezelő?

A NÉZET parancs a parancssorban a <Command id="-VIEW" /> parancsot futtatja: Nézetkezelő nincs, és az elnevezett nézetek (Mentés, Visszaállítás) itt még nem érhetők el.
