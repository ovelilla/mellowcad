---
title: "Vonaltípuslépték az AutoCAD-ben: VTLÉPTÉK (LTSCALE) parancs"
metaTitle: "Vonaltípuslépték AutoCAD-ben: VTLÉPTÉK (LTSCALE)"
description: "Az AutoCAD VTLÉPTÉK (LTSCALE, rövidítése VTL) parancsa az egész rajz vonaltípuslépték-tényezőjét állítja be, hogy a szaggatott vonal minden méretben látsszon."
before: "Egy 4 méter hosszú alaplap, a furata HIDDEN, a tengelyei CENTER vonaltípussal, az alapértelmezett 1-es vonaltípusléptékkel: a szaggatások túl aprók ahhoz, hogy látsszanak."
figure: "Ugyanez az alaplap a VTLÉPTÉK 20 után: a furat és a tengelyek szaggatásai 20-szor hosszabbak."
sourceHash: "33b956c956fa"
---

A VTLÉPTÉK (LTSCALE) parancs a globális vonaltípuslépték-tényezőt állítja be: azt, hogy milyen hosszúak a rajzban minden szaggatott vonaltípus vonalkái és hézagai. Bekéri az új tényezőt, és felajánlja az aktuálisat, új rajzban `1.0000`-t: 2 esetén minden vonalka kétszer olyan hosszú lesz, 0,5 esetén feleakkora. A tényezőnek 0-nál nagyobbnak kell lennie, különben <Message id="positiveNonzero" /> üzenetet ír ki, és újra kérdez; az `1/2` és az `1e3` számként érvényes. A változtatás az egész rajzot újrarajzolja, az AutoCAD 2027 szavaival `Modell regenerálása.`, és a rajzzal együtt mentődik; olyan lépés, amelyet a <Command id="U" /> visszavon. Ha egy másik parancs közben aposztróffal írja be, `'VTLÉPTÉK`, a rajz annak a parancsnak a végén rajzolódik újra.

A vonaltípusok papírméretű rajzhoz készült minták: egy 4 méter széles, milliméterben készült rajzban a CENTER mintája, amely nagyjából 51 egység hosszú, mintegy 80-szor ismétlődik, túl sűrűn ahhoz, hogy látsszon, az egy mintánál rövidebb vonal pedig folytonosnak rajzolódik. A megfelelő lépték általában maga a rajz léptéke: 20 az 1:20-as, 50 az 1:50-es léptékben olvasandó rajzhoz.

## Missing

A Vonaltípus-kezelő, amelynek Globális léptéktényezője a VTLÉPTÉK, Aktuális objektum léptéke pedig a CELTSCALE. A PSLTSCALE és az MSLTSCALE, mivel nincs papírtér. Az összetett vonaltípusok, például a BATTING alakzatai, amelyek helyén hézag rajzolódik.

## Questions

### Mi az AutoCAD VTLÉPTÉK parancs angolul?

LTSCALE. A magyar AutoCAD-ben a rövidítése `VTL`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `LTS` rövidítés a magyar változatban nem működik; a teljes `VTLÉPTÉK` név igen, a `_LTSCALE` pedig az AutoCAD bármely nyelvi változatában.

### Miért látszik folytonosnak a szaggatott vonal?

A mintája az aktuális léptéknél nem illik a rajzhoz. Az egy mintaismétlésnél rövidebb vonal folytonosnak rajzolódik; a hosszú vonal kis léptéknél olyan sűrűn hozza a vonalkáit, hogy folytonosnak tűnik. Nagy rajznál növelje, kicsinél csökkentse a VTLÉPTÉK értékét, amíg a szaggatás meg nem jelenik.

### Milyen VTLÉPTÉK értéket érdemes használni?

A rajz léptékét: egy milliméterben készült, 1:50-es léptékben olvasandó rajzban `50`-et. Papírméretű rajzhoz 1-et.

### Mi a különbség a VTLÉPTÉK és maga a vonaltípus között?

A vonaltípus, amelyet a <Command id="LINETYPE" /> paranccsal vagy a fóliával állít be, a minta: vonalkák, pontok és hézagok. A VTLÉPTÉK azt adja meg, milyen hosszúra rajzolódik ez a minta, a rajz minden objektumára ugyanazzal a tényezővel.
