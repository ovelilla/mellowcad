---
title: "Víceřádkový text v AutoCADu: příkaz MTEXT"
description: "Jak psát víceřádkový text v AutoCADu příkazem MTEXT (zkratka T): dva rohy nebo šířka, výška, zarovnání a řádkování, odstavce v jednom objektu. Vyzkoušejte."
figure: "Poznámka v rámečku: nejprve nastavená výška, pak protější roh a jeden odstavec zalomený na šířku mezi nimi."
sourceHash: "a53001f9674d"
---

Příkaz MTEXT píše víceřádkový text: jeden objekt s odstavci, které se zalamují na šířku. Ukážete první roh a protější roh a rámeček mezi nimi určí šířku; pak píšete v editoru zobrazeném přímo na místě, kde Enter začne nový odstavec a Ctrl+Enter nebo kliknutí mimo rámeček text uloží. Esc, když je něco napsáno, se zeptá, zda text uložit, jako dialog AutoCADu o neuložených změnách. Pro řádky, z nichž každý je samostatným objektem, použijte <Command id="TEXT" />.

První řádek vypíše aktuální styl a výšku. Každá volba se nabízí na výzvě k protějšímu rohu a vrací se k ní, takže jedno spuštění nastaví výšku, zarovnání a další, než se rámeček uzavře. Slova se zalomí tam, kde by řádek přesáhl šířku, a slovo delší než šířka ji přesáhne. Výšku sdílí s příkazem <Command id="TEXT" /> a ukládá se ve výkresu; zarovnání, natočení a řádkování začínají při každém spuštění od výchozích hodnot. <Command id="-MTEXT" /> se ptá stejně, pak převezme text z příkazového řádku, po řádcích.

## Options

### Height

Nastaví výšku textu, zadanou číslem nebo jako vzdálenost od prvního rohu k bodu; musí být větší než nula. Zůstane pro další spuštění i pro <Command id="TEXT" />.

### Justify

Nastaví, ze kterého z devíti bodů rámečku text visí: ve výchozím stavu vlevo nahoře, nebo nahoře, uprostřed a dole, vždy vlevo, na střed a vpravo, jak je výzva vypisuje. Text visí z tohoto bodu rámečku, ať byl rámeček tažen jakýmkoli směrem.

### Line spacing

Zeptá se na typ, nejméně (výchozí), který udělá místo pro řádek s vyššími písmeny, nebo přesně, pak na faktor zapsaný s x, třeba `2x`, nebo na vzdálenost. Jednoduché řádkování je 1x a faktor jde od 0,25x do 4x.

### Rotation

Otočí rámeček i s textem o úhel zadaný číslem nebo ukázaný od prvního rohu.

### Style

Nastaví aktuální textový styl podle názvu; <Keyword id="?" /> vypíše styly výkresu a název, který výkres nemá, se odmítne. Styly se vytvářejí v paletě, kterou otevře <Command id="STYLE" />.

### Width

Místo protějšího rohu se zeptá na šířku, číslem nebo jako vzdálenost k bodu, a pak otevře editor. Šířka 0 nebo Enter ponechá řádky nezalomené, každý tak dlouhý, jak byl napsán.

## Missing

Sloupce, které AutoCAD 2027 nabízí na výzvě k protějšímu rohu, nabízeny nejsou. Formátování uvnitř textu, například výška, písmo nebo barva slova, zlomky nebo podtržení, se nekreslí ani nepoužije a editor nemá pravítko, tabulátory, odsazení, seznamy ani kartu Textový editor na pásu karet, ani kurzor ve výkresu. Chybí maska pozadí a rámeček textu, definovaná výška, poznámkové měřítko a uchopení Bod na jeho rozích a kliknutí dovnitř jeho rámečku ho vybere i mimo písmena, kde AutoCAD nevybere nic.

## Questions

### Jaká je zkratka příkazu MTEXT v AutoCADu?

`T` nebo `MT`, stejně jako v anglickém AutoCADu, pak Enter nebo mezerník; `_MTEXT` v AutoCADu v jakémkoli jazyce. <Command id="-MTEXT" />, `-T`, se ptá stejně a text převezme z příkazového řádku.

### Jak začít nový řádek ve víceřádkovém textu?

Stiskněte Enter: začne nový odstavec. Uvnitř odstavce se řádky zalamují samy na šířku rámečku. Ctrl+Enter nebo kliknutí mimo rámeček zavře editor a text uloží.

### Jak změnit šířku víceřádkového textu?

Vyberte ho a táhněte uzel na jeho boku: text se při změně šířky znovu zalomí, kolem svého bodu zarovnání. Řádek Definovaná šířka v paletě Vlastnosti to udělá číslem a její řádky řádkování mění rozestup.

### Jak převést MTEXT na jednořádkový text?

Rozložte ho příkazem <Command id="EXPLODE" />: každý jeho řádek se stane objektem <Command id="TEXT" />, zarovnaným vlevo tam, kde řádek stál, jako v AutoCADu. Chcete-li ho jen přepsat, poklepejte na něj a upravte ho v editoru.
