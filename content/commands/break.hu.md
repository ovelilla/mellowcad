---
title: "Vonal megtörése az AutoCAD-ben: MEGTÖR (BREAK) parancs"
metaTitle: "Megtörés az AutoCAD-ben: MEGTÖR (BREAK) parancs"
description: "Vonal megtörése az AutoCAD-ben a MEGTÖR (BREAK, MG) paranccsal: a kijelölés az első pont, majd a második, vagy az Első pont opció; megtörés egy pontban."
figure: "Egy vonal, amelyet az Első pont opcióval megadott két pont között tör meg, és egy kör, amelyet a kijelölés helyétől az óramutató járásával ellentétesen egy második pontig tör meg."
sourceHash: "f351112ef2fc"
---

A MEGTÖR (BREAK) parancs rést vág egy objektumba, vagy kettévágja. Jelölje ki az objektumot: ahogy az AutoCAD-ben, a kijelölés helye az első töréspont, így a következő prompt már csak a másodikat kéri, és a kettő közötti rész eltűnik. Egy vonal, ív, nyitott vonallánc, elliptikus ív vagy spline elveszíti a pontok közötti részt, és két objektum lesz belőle; egy kör vagy ellipszis az első ponttól a másodikig az óramutató járásával ellentétesen futó részét veszíti el, egy zárt vonallánc pedig a csúcspontjai sorrendjében a kettő közötti részt: mindegyikből egyetlen nyitott objektum lesz. Az objektumon kívüli pontot a legközelebbi pontjára veszi, a végén túli pedig az adott végig vág. Amíg a második pontot adja meg, az objektumon látszik az a rész, amelyet a MEGTÖR megtartana. A megtörés egyetlen lépés, amelyet a Vissza visszavon.

## Options

### First point

A második töréspontnál: adja meg újra az első töréspontot, majd a másodikat, ha a rés nem ott kezdődik, ahol az objektumot kijelölte.

## Missing

Az FKR-rel nem egy síkban fekvő ív, kör vagy ellipszis, amelyet az AutoCAD megtör, a MellowCAD pedig nem talál meg. A <Command id="MIRROR" /> paranccsal megfordított teljes ellipszis, amelyet az AutoCAD fordított irányban tör meg.

## Questions

### Mi az AutoCAD MEGTÖR parancs angolul, és mi a rövidítése?

Angolul BREAK, a magyar AutoCAD-ben MEGTÖR: írja be az `MG` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `BR` a magyar AutoCAD-ben nem működik; a `_BREAK` az AutoCAD bármely nyelvén igen.

### Hogyan lehet egy vonalat egy pontban megtörni?

Futtassa a <Command id="BREAKATPOINT" /> parancsot, jelölje ki a vonalat, és adja meg a pontot: két vonal lesz belőle, amelyek ott találkoznak. A MEGTÖR parancsban ugyanezt éri el, ha a második töréspontnál `@` jelet ír be.

### Hogyan lehet egy vonalat két pont között megtörni?

Jelölje ki a vonalat, válassza az <Keyword id="First point" /> opciót, majd adja meg az első és a második pontot: a köztük lévő rész eltűnik. Vagy jelölje ki a vonalat az első pontnál, és csak a másodikat adja meg.

### Miért nem lehet megtörni egy blokkot vagy egy szöveget?

A MEGTÖR vonalakat, íveket, köröket, vonalláncokat, ellipsziseket és spline-okat tör meg. Blokkreferenciára az üzenet <Message id="cannotBreakBlock" />, szövegre, méretre vagy sraffozásra <Message id="objectCannotBeBroken" />; a darabjai megtöréséhez előbb vesse szét a blokkot a <Command id="EXPLODE" /> paranccsal.

### Merre vágja a MEGTÖR a kört?

Az óramutató járásával ellentétesen, az első ponttól a másodikig, ahogy az AutoCAD-ben. Fordított sorrendben adja meg a pontokat, ha a másik részt szeretné megtartani.
