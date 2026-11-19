---
title: "Ív rajzolása az AutoCAD-ben: ÍV (ARC) parancs"
metaTitle: "Ív az AutoCAD-ben: ÍV (ARC) parancs, 3 pont"
description: "Ív rajzolása az AutoCAD-ben az ÍV (ARC, I) paranccsal: három pont, kezdőpont-középpont-végpont vagy fordítva, és a Ctrl az óramutató irányához. Próbálja ki."
figure: "Három ív: három ponton át, egy kezdőpontból a középpont körül egy végpontig, és egy középpontból a kezdőpontján át a végpontjáig."
sourceHash: "af9b22e35456"
---

Az ÍV (ARC) parancs alapértelmezés szerint három ponton át rajzol ívet: a kezdőpontján, egy olyan ponton, amelyen áthalad, és a végpontján. Vagy egy középpont körül rajzol, egy kezdőponttól egy végpontig, ahogy a szalag Kezdőpont, középpont, végpont és Középpont, kezdőpont, végpont gombja futtatja. Ahogy az AutoCAD-ben, a középpontjával megadott ív a kezdőpontjától az óramutató járásával ellentétesen halad, a végpont pedig csak azt jelöli ki, hol áll meg: nem kell az íven feküdnie. Amíg a pontokat adja meg, az ív követi a kurzort, a kezdőponttól vagy a középponttól pedig borostyánszínű szaggatott vonal indul. Az ív az első pontja síkjában fekszik. A meg nem szerkeszthető ív – egy egyenesbe eső három pont vagy a kezdőpontra eső végpont – üzenete <Message id="invalid" />, és semmi sem rajzolódik.

## Options

### Center

Az első promptnál: először a középpontot adja meg, majd a kezdőpontot és a végpontot. A második promptnál, a kezdőpont után: ezután a középpont következik, majd a végpont. Bármelyik végén tartsa lenyomva a Ctrl billentyűt, hogy az ív az óramutató járásával megegyezően fusson.

## Missing

Azok az opciók, amelyek az ívet a végpont helyett a szögével, a húrhosszával, egy iránnyal vagy egy sugárral fejezik be, és a második pontnál a Végpont opció, amely hozzájuk vezet; a szalagon e módok gombjai is hiányoznak. A folytatás: az első promptnál az Enter, amely az AutoCAD-ben az utolsó vonalhoz vagy ívhez érintő ívet rajzol, itt befejezi az ÍV parancsot. A bezárt szög mezője, amelyet a dinamikus bevitel a középpontos módok végén mutat.

## Questions

### Mi az AutoCAD ÍV parancs angolul, és mi a rövidítése?

Angolul ARC, a magyar AutoCAD-ben ÍV: írja be az `I` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `A` a magyar AutoCAD-ben nem működik; az `_ARC` az AutoCAD bármely nyelvén igen.

### Hogyan lehet három ponttal ívet rajzolni az AutoCAD-ben?

Indítsa el az ÍV parancsot, és adjon meg három pontot: a kezdőpontot, egy tetszőleges pontot, amelyen az ív áthalad, és a végpontot. Ez az alapértelmezés, nem kell opciót választani.

### Miért rossz irányba rajzolódik az ív?

A középpontjával megadott ív a kezdőpontjától az óramutató járásával ellentétesen halad, ahogy az AutoCAD-ben. Cserélje fel a kezdőpontot és a végpontot, vagy a végpont megadása közben tartsa lenyomva a Ctrl billentyűt, hogy az óramutató járásával megegyezően fusson.

### Hogyan lehet két vonalhoz érintő ívet rajzolni?

Használja a <Command id="FILLET" /> parancsot egy sugárral: mindkét vonalhoz érintő ívet rajzol, és a vonalakat hozzá vágja. Az előző szakaszhoz érintő ívet vonalláncban rajzolja meg, a <Command id="PLINE" /> parancs ív opciójával.
