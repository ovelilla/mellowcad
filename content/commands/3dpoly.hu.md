---
title: "3D vonallánc az AutoCAD-ben: 3DVLÁNC (3DPOLY) parancs"
metaTitle: "3D vonallánc az AutoCAD-ben: 3DVLÁNC (3DPOLY)"
description: "3D vonallánc az AutoCAD-ben a 3DVLÁNC (3DPOLY, 3V) paranccsal: egyenes szakaszok, minden pont saját Z-vel, Bezárás, Vissza, eltérés a VLÁNC parancstól."
figure: "Egy 3D vonallánc, amely a talajon fekvő 60 × 40-es téglalap minden sarkánál 15-tel emelkedik, délkelet felől nézve."
sourceHash: "b74d0c411c73"
---

A 3DVLÁNC (3DPOLY) parancs 3D vonalláncot rajzol: egyenes szakaszokat olyan pontokon át, amelyeknek mind saját Z koordinátájuk van, egyetlen objektumként. Adja meg a kezdőpontot, majd minden szakasz végpontját, amíg az Enter be nem fejezi; még egy magában álló kezdőpont is megmarad, egycsúcsú vonalláncként. A kezdőpontnál az Enter billentyűt a parancs elutasítja: <Message id="invalidPoint" />, mert nincs Folytatás opció, amely a VONAL parancsnak van. A Z-vel beírt pont megtartja azt, például `30,0,15`; a Z nélkül beírt vagy kattintással megadott pont a munkasík szintjén fekszik, a tárgyraszterrel egy objektumon fogott pont pedig az objektum ottani Z értékét veszi fel. A pontokat az aktuális FKR-ben olvassa.

A <Command id="PLINE" /> paranccsal szemben nincs síkja, ívei, szélességei és vastagsága, és bármilyen vonaltípusa van, folytonos vonallal rajzolódik, bár a vonaltípusát megtartja. A teljes vonallánc egyetlen lépés, amelyet a <Command id="U" /> parancs visszavon; az Esc megtartja, amit már megrajzolt. A VLEDIT parancs rövidebb opciólistával szerkeszti, a Spline-görbe opciója pedig sima görbét illeszt rá.

## Options

### Close

A második szakasztól kezdve: egy szakaszt rajzol vissza a kezdőpontba, és befejezi a parancsot.

### Undo

Visszavonja az utolsó csúcspontot, és az azt megelőzőtől folytatja. Ha már nem maradt szakasz: <Message id="all3dSegmentsUndone" />.

## Missing

A görbével illesztett 3D vonallánc a Tulajdonságok paletta Illeszt/Simít sorában Nincs értéket mutat, ahol az AutoCAD Másodfokút vagy Harmadfokút ír, és ott nem is módosítható. Nem lehet sraffozás határa, sem a KIOSZTÚTVONAL útvonala, és a palettán nincs Anyag sora. A dinamikus bevitel a kezdőpontot egyetlen mezőben kéri, a Z-t egy második vessző után kell beírni, ahol az AutoCAD X, Y és Z mezőt mutat. A fogók rámutatáskor megjelenő menüi: Nyújtás, Töréspont hozzáadása, Töréspont eltávolítása és a többi.

## Questions

### Mi az AutoCAD 3DVLÁNC parancs angolul, és mi a rövidítése?

Angolul 3DPOLY, a magyar AutoCAD-ben 3DVLÁNC: írja be a `3V` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `3P` a magyar AutoCAD-ben nem működik; a `_3DPOLY` az AutoCAD bármely nyelvén igen.

### Mi a különbség a VLÁNC és a 3DVLÁNC parancs között?

A <Command id="PLINE" /> egyetlen síkban fekszik, és lehetnek ívei és szélességei. A 3D vonalláncnak csak egyenes szakaszai vannak, de minden csúcspontja más magasságban lehet: csővezeték, egy út tengelyvonala, egy kábel.

### Hogyan lehet 3D vonalláncot rajzolni különböző magasságokban?

Minden pontot a Z koordinátájával együtt írjon be, `x,y,z` alakban, vagy fogja meg tárgyraszterrel a kívánt magasságban lévő objektumokat. Dinamikus bevitelnél az első utáni pont relatív: a `60,0,15` az előző ponttól 60-nal megy X irányban és 15-tel feljebb.

### Hogyan lehet egy 3D vonalláncot simává tenni?

Szerkessze a <Command id="PEDIT" /> paranccsal, és válassza a Spline-görbe opciót: a csúcspontok által keretezett sima görbét kap. A Kisimít opció ismét egyenesekké alakítja.
