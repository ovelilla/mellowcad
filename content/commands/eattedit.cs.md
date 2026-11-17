---
title: "Příkaz EATREDIT (EATTEDIT) v AutoCADu"
description: "Jak v AutoCADu změnit atributy bloku příkazem EATREDIT (EATTEDIT) v Rozšířeném editoru atributů a proč ho spustí dvojklik na blok. Vyzkoušejte zdarma online."
figure: "Dva stoly, reference bloku s atributy NUM a PART: EATREDIT vybere druhý a jeho pole PART se změní na B-200."
sourceHash: "3517c89fd5da"
---

Příkaz EATREDIT (EATTEDIT) otevře Rozšířený editor atributů AutoCADu pro jednu referenci bloku: vyzve k výběru bloku a pak zobrazí pole pro každý jeho atribut, označené štítkem a vyplněné hodnotou, jak je uvádí karta Atribut editoru. Přepište hodnoty, mezi poli přecházejte klávesou Tab, a Enter je použije v jednom kroku, který vrátí příkaz <Command id="U" />; Esc nic nezmění.

Dvojklik na referenci s atributy spustí příkaz EATREDIT, jako v AutoCADu: příkazový řádek ho zapíše s bodem dvojkliku jako odpovědí a okno se hned otevře. Výběr vezme objekt pod výběrovým čtverečkem: cokoli kromě reference bloku se odmítne, stejně jako blok bez atributů, a otázka se zopakuje. Změní se jen vybraná reference; definice bloku a jeho ostatní reference si ponechají své hodnoty.

## Missing

Karta Možnosti textu editoru (styl, zarovnání, výška, natočení, poměr šířky a další nastavení textu každého atributu) a jeho karta Vlastnosti (hladina, typ čáry, barva, tloušťka čáry) a také jeho tlačítko „Vybrat blok“. Příkaz ATRPEDIT (ATTIPEDIT), který upravuje jeden atribut na místě, a jeho Ctrl+dvojklik. Vlastní uzel odemknutého atributu na referenci a řádky atributů v paletě Vlastnosti. `-ATREDIT`.

## Questions

### Jak v AutoCADu otevřít Rozšířený editor atributů?

Poklepejte na referenci bloku, která má atributy, nebo zadejte `EATREDIT` a vyberte ji. `_EATTEDIT` funguje v AutoCADu v každém jazyce.

### Jak v AutoCADu změnit hodnotu atributu?

Poklepejte na blok, zadejte novou hodnotu do pole atributu a stiskněte Enter. Každá reference má vlastní hodnoty: změna jedné ostatní nechá, jak jsou.

### Proč dvojklik neotevře atributy bloku?

Příkaz EATREDIT se otevře pro referenci, jejíž blok obsahuje atributy, a blok vytvořený bez nich žádné nemá: definujte je příkazem <Command id="ATTDEF" /> a při vytváření bloku je vyberte spolu s ostatními objekty. Pokud hodnota atributu není vidět, zkontrolujte příkaz <Command id="ATTDISP" />, který může skrýt neviditelné atributy nebo všechny.

### Jaký je rozdíl mezi příkazy EATREDIT (EATTEDIT) a ATREDIT (ATTEDIT)?

Oba upravují tytéž hodnoty. Příkaz EATREDIT označí každé pole štítkem, jako karta Atribut Rozšířeného editoru atributů; příkaz <Command id="ATTEDIT" /> výzvou, jako dialog Upravit atributy. V AutoCADu příkaz EATREDIT upravuje i možnosti textu a vlastnosti každého atributu.
