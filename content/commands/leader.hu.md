---
title: "AutoCAD MUTATÓ (LEADER) parancs"
metaTitle: "Mutatóvonal az AutoCAD-ben: MUTATÓ (LEADER)"
description: "Az AutoCAD MUTATÓ (LEADER, MUT) parancsa: mutatóvonal a nyílfejtől a szövegig, a talpvonal, a formátum opciói, és miben más, mint a TMUTATÓ. Próbálja ki ingyen."
figure: "Egy furat és a megjegyzése: MUTATÓ a kör kerületétől, két pont, majd két sor szöveg; az utolsó szakasz emelkedik, ezért talpvonal köti a szöveghez."
sourceHash: "3e9e26bfe826"
---

A MUTATÓ (LEADER) parancs egy nyílfejtől egy megjegyzésig húzódó vonalat rajzol. Adja meg a kezdőpontot, ahová a nyílfej kerül, majd tetszőleges számú pontot; a második ponttól kezdve a prompt felkínálja a <Keyword id="Annotation" /> opciót, amelyet az Enter is kiválaszt, valamint a <Keyword id="Format" /> és a <Keyword id="Undo" /> opciót. Az első két pontnál az Enter befejezi a parancsot, és nem rajzol semmit. Ezután írja be a megjegyzést soronként, mindegyik után Enterrel, és egy üres sorban nyomott Enterrel fejezze be: a mutató és a szövege, egy bekezdéses szöveg, együtt, egyetlen lépésben jön létre, az aktuális fólián, az aktuális színnel, vonaltípussal és vonalvastagsággal.

A szöveg a magasságát, a vonaltól mért távolságát és a helyét az aktuális méretstílusból veszi: a mutató vége után, vagy előtte, ha a mutató jobbról érkezik, és az utolsó vonal fölött, amely a szöveg alatt folytatódik. Ha az utolsó szakasz 15°-nál jobban emelkedik a vízszinteshez képest, a MUTATÓ talpvonalat ad hozzá: egy nyílfejnyi hosszú vízszintes vonalat, amely a megadott pontban végződik. A nyílfej a zárt, kitöltött nyíl, és csak akkor jelenik meg, ha az első szakasz legalább kétszer olyan hosszú, mint a nyílfej.

A mutató követi a szövegét: ha a szöveget mozgatja, elforgatja vagy átméretezi, a mutató vége vele megy, és a talpvonal újraszámolódik; ha a szöveget törli, a mutató megmarad, talpvonal nélkül. Az együtt másolt mutató és szöveg pár marad. A mutató fogói a pontjain vannak; a Tulajdonságok paletta megmutatja a típusát, a nyílméretét, a szöveg eltolását és helyzetét, valamint a léptékét.

## Options

### Annotation

A szöveget kéri, soronként. Az első sornál az Enter ehelyett más fajta feliratozást kér: a <Keyword id="Mtext" /> (az alapértelmezés) megnyitja a szövegszerkesztőt a mutató végénél, ahol az Enter sort tör, a Ctrl+Enter vagy egy kattintás a szerkesztőn kívül pedig befejezi; a <Keyword id="Copy" /> egy kijelölt bekezdéses szöveg, egysoros szöveg vagy blokkreferencia másolatát helyezi a végére, minden mást a <Message id="leaderCopyRefused" /> üzenettel elutasítva; a <Keyword id="None" /> csak a mutatót rajzolja meg.

### Format

Beállítja, hogyan rajzolódjon a mutató, majd visszatér a pontokhoz: a <Keyword id="Spline" /> a pontokon átmenő sima görbévé teszi, az <Keyword id="STraight" /> ismét egyenes szakaszokká, a <Keyword id="Arrow" /> visszateszi a nyílfejet, a <Keyword id="None" /> pedig elhagyja. Az Enter változatlanul hagyja a formátumot.

### Undo

Visszavonja az utolsó pontot, és újra kéri. A második pontnál nincs mit visszavonni, és ezt a <Message id="invalidInputCapital" /> üzenet jelzi.

## Missing

A Tűrés és a Blokk feliratozás: a MellowCAD-ben nincs alaktűrés-objektum, és blokk nem illeszthető be a MUTATÓ parancsból, ezért az opciók promptja a Másol, a Nincs és a Bszöveg opciót sorolja fel. A zárt, kitöltött nyíltól eltérő nyílfejek, és a mutató saját vonalszíne és vonalvastagsága a méretstílusból. A GYMUTATÓ (QLEADER) és a TMUTATÓ (MLEADER), a gyorsmutató és a többszörös mutató még nincs meg: egy DXF többszörös mutatói megnyílnak, és újra menthetők, de egyetlen parancs sem hoz létre ilyet, és nem szerkeszti a mutatóvonalait.

## Questions

### Mi az AutoCAD MUTATÓ parancs angolul?

LEADER. A magyar AutoCAD-ben a rövidítése `MUT`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig a `_LEADER` is; az angol `LEAD` a magyar változatban nem működik.

### Mi a különbség a MUTATÓ és a TMUTATÓ parancs között?

A MUTATÓ a régebbi parancs: egy mutatóvonal és egy különálló szöveg, amelyet a vonal követ. A TMUTATÓ (MLEADER), amelyet az AutoCAD ma javasol, egyetlen többszörös mutató objektumot készít, saját stílusokkal és akár több mutatóvonallal egy megjegyzéshez. A MellowCAD-ben a MUTATÓ van meg; a DXF-fájlok mutatóit és többszörös mutatóit is megnyitja és menti, de TMUTATÓ parancs nincs, amellyel többszörös mutatót lehetne létrehozni vagy szerkeszteni.

### Hogyan lehet szöveges mutatót készíteni?

Indítsa el a MUTATÓ parancsot, adja meg a pontot, amelyre mutatni kell, majd azt, ahol a szöveg legyen, nyomja meg az Enter billentyűt, és írja be a szöveget soronként. Egy üres sorban nyomott Enter befejezi. Ha ehelyett az első sornál nyom Entert, a többi feliratozási mód jelenik meg, köztük a szövegszerkesztő.

### Hogyan lehet módosítani a mutató nyilának méretét?

Jelölje ki a mutatót, és módosítsa a Tulajdonságok palettán a Nyílméret értékét, amely csak erre a mutatóra vonatkozik; vagy módosítsa a méretstílus nyílméretét, amelyet az adott stílusú összes mutató követ. A talpvonal hossza is a nyílmérethez igazodik.

### Miért nincs nyila a mutatónak?

Vagy a Formátum Nincs opciója hagyta el, vagy az első szakasz rövidebb a nyílméret kétszeresénél, amikor az AutoCAD sem rajzol nyílfejet. Adja meg a második pontot távolabb az elsőtől, vagy állítson be kisebb nyílméretet.
