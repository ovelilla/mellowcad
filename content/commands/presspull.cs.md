---
title: "Příkaz TLAČTÁHNI (PRESSPULL) v AutoCADu"
description: "Jak příkaz TLAČTÁHNI (PRESSPULL) v AutoCADu zatlačí nebo vytáhne, na co kliknete: uzavřený objekt, oblast mezi objekty, plochu 3D tělesa. Vyzkoušejte online."
figure: "Oblast mezi obdélníkem a kružnicí zatlačená o 8 dolů: deska s otvorem viděná od jihovýchodu ve vizuálním stylu Skrytý."
sourceHash: "b806d59060e1"
---

Příkaz TLAČTÁHNI (PRESSPULL) vysune to, na co kliknete: uzavřený objekt, oblast, kterou objekty kolem kliknutí uzavírají, nebo rovinnou plochu 3D tělesa. Klikněte a pak zadejte výšku, nebo pohněte kurzorem a klikněte: kladná výška táhne, záporná tlačí. Uzavřený objekt nebo oblast se stane novým tělesem, tím, které by vytvořil příkaz <Command id="EXTRUDE" />, a objekty zůstanou; ostrovy oblasti jsou v něm otvory, jako v ukázce. Plocha přidá svůj hranol ke svému tělesu nebo ho z něj odebere: vytažením horní plochy kvádru se kvádr zvýší. Výzva se vrací pro další kliknutí až do Enter a celé spuštění je jeden krok, který vrátí <Command id="U" />.

Podržte Ctrl a plocha, kterou by kliknutí vzalo, se zvýrazní; Ctrl+kliknutí tuto plochu místo toho odsadí a sousední plochy prodlouží, aby na ni navazovaly, takže šikmá stěna si ponechá sklon. Stejně jako v AutoCADu pracuje příkaz TLAČTÁHNI kliknutím: na číslo nebo bod zadaný na první výzvě odpoví <Message id="presspullClick" /> a zeptá se znovu.

## Options

### Multiple

Na výzvě k výšce nebo ke vzdálenosti odsazení: klikejte dál a přidávejte další – uzavřené objekty a oblasti, nebo plochy jednoho tělesa – pak stiskněte Enter a jedna výška platí pro všechny. Plocha vybraná po objektu nebo oblasti se odfiltruje.

## Missing

Zakřivená plocha, kterou AutoCAD také odsadí: zde kliknutí žádnou plochu nenajde. Odsazení, jehož sousední plochy jsou kužely, koule nebo anuloidy, nebo roviny a zakřivené plochy dohromady, nebo které by protlačilo plochu skrz protější: těleso zůstane, jak bylo. Oblasti, které na ploše vytvářejí IMPRINT a IMPLIEDFACE, a Ctrl+Shift+E. Otevřený objekt, který AutoCAD vysune na povrch: povrchy tu zatím nejsou. Během tažení náhled ukazuje hranol plochy nebo nové těleso, ne těleso, jak bude vypadat, a plocha se zvýrazní jen s Ctrl. Oblast ohraničená mimo rovinu USS není vyzkoušená.

## Questions

### Jaký je rozdíl mezi příkazy TLAČTÁHNI a VYTÁHNI (EXTRUDE)?

<Command id="EXTRUDE" /> bere vybrané uzavřené objekty, maže je podle DELOBJ a nabízí směr, zúžení a výraz. Příkaz TLAČTÁHNI bere kliknutí – uzavřený objekt, oblast uvnitř několika objektů nebo plochu tělesa, kterou k tělesu přidá nebo z něj vyřízne – a objekty ponechá. Z objektu oba vytvoří stejné těleso.

### Jak vysunout plochu tělesa?

Spusťte příkaz TLAČTÁHNI, klikněte na plochu a zadejte vzdálenost: kladná ji vytáhne a těleso naroste, záporná ji zatlačí dovnitř. Podržíte-li při kliknutí Ctrl, plocha se místo toho odsadí. Zatím jen rovinné plochy.

### Proč příkaz TLAČTÁHNI nefunguje?

Chce kliknutí na něco uzavřeného. Na číslo nebo bod zadaný na první výzvě, na kliknutí na otevřený objekt nebo na zakřivenou plochu odpoví <Message id="presspullClick" /> a zeptá se znovu. Klikněte na uzavřený objekt, dovnitř oblasti, kterou objekty v půdorysu uzavírají, nebo na rovinnou plochu tělesa.

### Má příkaz TLAČTÁHNI zkratku?

Nemá: zadejte TLAČTÁHNI, nebo `_PRESSPULL` v AutoCADu v jakémkoli jazyce. Ctrl+Shift+E, klávesa AutoCADu pro něj, zatím hotová není.
