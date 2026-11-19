---
title: "AutoCAD TOLHÚZ (PRESSPULL) parancs"
metaTitle: "AutoCAD TOLHÚZ (PRESSPULL): lapok és területek"
description: "Az AutoCAD TOLHÚZ (PRESSPULL) parancsa benyomja vagy kihúzza, amire kattint: zárt objektumot, objektumok közti területet, 3D szilárdtest lapját. Ingyen, online."
figure: "Egy téglalap és egy kör közötti terület 8-cal lefelé nyomva: furatos alaplap délkeletről nézve, Takartvonalas látványstílusban."
sourceHash: "b806d59060e1"
---

A TOLHÚZ (PRESSPULL) parancs kihúzza, amire kattint: egy zárt objektumot, egy területet, amelyet a kattintás helye körül objektumok zárnak be, vagy egy 3D szilárdtest sík lapját. Kattintson, majd írja be a magasságot, vagy mozgassa a kurzort, és kattintson: a pozitív magasság kihúz, a negatív benyom. A zárt objektumból vagy a területből új szilárdtest lesz, ugyanaz, amelyet a <Command id="EXTRUDE" /> készítene, és az objektumok megmaradnak; a terület szigetei lyukak lesznek benne, ahogy a mintában. A lap a hasábját hozzáadja a szilárdtestéhez, vagy kivonja belőle: a téglatest kihúzott teteje magasabbá teszi a testet. A prompt a következő kattintáshoz újra megjelenik, amíg meg nem nyomja az Enter billentyűt, és a teljes futás egyetlen lépésként vonható vissza.

Ha lenyomva tartja a Ctrl billentyűt, kiemelődik az a lap, amelyet a kattintás megfogna; a Ctrl+kattintás ehelyett párhuzamosan eltolja a lapot, a szomszédos lapjai pedig vele mozdulnak, hogy találkozzanak vele, így a ferde oldal megtartja a lejtését. Ahogy az AutoCAD-ben, a TOLHÚZ kattintásokkal dolgozik: az első promptnál beírt számra vagy pontra <Message id="presspullClick" /> a válasz, és a prompt újra megjelenik.

## Options

### Multiple

A magasság vagy az eltolási távolság promptjánál: kattintson tovább, hogy újabbakat adjon hozzá – zárt objektumokat és területeket, vagy egyetlen szilárdtest lapjait –, majd nyomja meg az Enter billentyűt, és egyetlen magasság érvényes mindegyikre. Az objektum vagy terület után kattintott lapot kiszűri.

## Missing

Az ívelt lap, amelyet az AutoCAD szintén eltol: itt a kattintás nem talál lapot. Az olyan eltolás, amelynek szomszédos lapjai kúpok, gömbök vagy tóruszok, vagy síkok és ívelt lapok vegyesen, vagy amely egy lapot átnyomna a vele szemközti lapon: a szilárdtest változatlan marad. Az IMPRINT és az IMPLIEDFACE által a lapon létrehozott területek, és a Ctrl+Shift+E. A nyitott objektum, amelyet az AutoCAD felületté húz ki: felületek még nincsenek. Húzás közben az előnézet a lap hasábját vagy az új szilárdtestet mutatja, nem a szilárdtestet úgy, ahogy lesz, és a lap csak a Ctrl billentyűvel emelődik ki. Az FKR síkján kívül körülhatárolt terület nincs kipróbálva.

## Questions

### Mi a különbség a TOLHÚZ és a KIHÚZ (EXTRUDE) parancs között?

A <Command id="EXTRUDE" /> kiválasztott zárt objektumokkal dolgozik, a DELOBJ szerint törli őket, és irányt, szűkítési szöget és kifejezést is kínál. A TOLHÚZ kattintásokkal dolgozik – egy zárt objektumra, több objektum belsejében lévő területre vagy egy szilárdtest lapjára, amelyet hozzáad a szilárdtesthez vagy kivág belőle –, és megtartja az objektumokat. Objektumból mindkettő ugyanazt a szilárdtestet készíti.

### Hogyan lehet kihúzni egy szilárdtest lapját?

Futtassa a TOLHÚZ parancsot, kattintson a lapra, és adja meg a távolságot: a pozitív kihúzza, és a szilárdtest nő, a negatív benyomja. Ha kattintás közben lenyomva tartja a Ctrl billentyűt, a lapot ehelyett párhuzamosan eltolja. Egyelőre csak sík lapokkal működik.

### Miért nem működik a TOLHÚZ?

Zárt dologra kell kattintani. A TOLHÚZ az első promptnál beírt számra vagy pontra, a nyitott objektumra vagy ívelt lapra történő kattintásra <Message id="presspullClick" /> üzenettel válaszol, és újra kérdez. Kattintson egy zárt objektumra, egy felülnézetben objektumok által körülzárt terület belsejébe, vagy egy szilárdtest sík lapjára.

### Van rövidítése a TOLHÚZ parancsnak?

Nincs rövidítése: írja be, hogy `TOLHÚZ`, vagy az AutoCAD bármely nyelvi változatában `_PRESSPULL`. A Ctrl+Shift+E, az AutoCAD billentyűparancsa hozzá, még nincs megvalósítva.
