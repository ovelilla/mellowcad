---
title: "Příkaz KÓTMEZERA (DIMSPACE) v AutoCADu"
description: "Jak v AutoCADu zarovnat kóty příkazem KÓTMEZERA (DIMSPACE): stejný rozestup mezi kótami, nebo 0 pro zarovnání do řady, a Auto podle výšky textu."
before: "Horní hrana desky okótovaná řetězem tří kót, každá ve vlastní výšce, jak byly nakresleny."
figure: "KÓTMEZERA od první kóty, další dvě vybrané a rozestup 0: řetěz zarovnaný na jednu čáru."
sourceHash: "7ec7c0eb9883"
---

Příkaz KÓTMEZERA (DIMSPACE) upraví rozestup mezi rovnoběžnými lineárními a šikmými kótami. Vyberete základní kótu, která zůstane na místě, a pak kóty, které se mají rozmístit; Enter výběr ukončí a zeptá se na rozestup. Kótovací čára každé kóty se pak posune, od základní kóty v pořadí, v jakém leží, do této vzdálenosti od předchozí. Rozestup 0 je všechny zarovná na čáru základní kóty: řetěz rozházený tak, jak byl nakreslen, se čte jako jeden. Změní se jen poloha kótovacích čar, v jednom kroku, který vrátí příkaz <Command id="U" />.

Základní kótu lze vybrat, zadat jako bod nebo vzít možností `Poslední`; objekt, který není kótou, vyvolá <Message id="selectedObjectNotDimension" /> a otázka se zopakuje. Sada vybraná před příkazem je sadou k rozmístění. Kóta pod úhlem k základní se započítá a zůstane na místě a záporný rozestup se odmítne zprávou <Message id="negativeSpacing" />.

## Options

### Auto

Výchozí možnost, Enter: rozestup rovný dvojnásobku výšky textu kótovacího stylu základní kóty, vynásobený jeho celkovým měřítkem, aby se do řady vešel její vlastní text.

## Missing

Úhlové kóty, které příkaz KÓTMEZERA zatím nerozmísťuje. AutoCAD posune kótu jen tam, kde je to potřeba; zde se znovu rozmístí každá vybraná kóta.

## Questions

### Jak zarovnat kóty v AutoCADu?

Spusťte příkaz KÓTMEZERA, vyberte kótu, ke které se mají ostatní zarovnat, vyberte je, stiskněte Enter a zadejte `0`: každá kótovací čára se přesune na čáru základní kóty.

### Jak nastavit stejné rozestupy mezi kótami?

Spusťte příkaz KÓTMEZERA, jako základní vyberte kótu nejblíže objektu, vyberte ostatní a stiskněte dvakrát Enter: <Keyword id="Auto" /> je rozmístí po dvojnásobku výšky textu. Nebo zadejte vzdálenost, kterou chcete, například `8`.

### Jaký je výchozí rozestup kót v AutoCADu?

<Keyword id="Auto" /> příkazu KÓTMEZERA je dvojnásobek výšky textu kótovacího stylu. Příkaz <Command id="DIMBASELINE" /> místo toho používá pro každou přidanou kótu „Odsazení základny“ stylu, 3,75 v ISO-25.

### Proč příkaz KÓTMEZERA neposune kótu?

Rozmísťuje jen kóty rovnoběžné se základní: kóta pod jiným úhlem se započítá a zůstane na místě. Úhlové kóty se zatím nerozmísťují.
