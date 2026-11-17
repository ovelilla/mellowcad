---
title: "Příkaz TEXTEDIT v AutoCADu"
description: "Jak příkaz TEXTEDIT (zkratka ED) v AutoCADu upravuje text, víceřádkový text a definice atributů, jeden po druhém, se Zpět a Režim. Vyzkoušejte zdarma."
figure: "Chybně napsané PALTE na štítku vybrané příkazem TEXTEDIT a přepsané na PLATE, pak Esc příkaz ukončí."
sourceHash: "2d0ed6fe5acc"
---

Příkaz TEXTEDIT upravuje poznámkové objekty: uvede aktuální režim úprav, na začátku <Keyword id="Multiple" />, a vyzve k výběru objektu. Jednořádkový text se otevře k přepsání tam, kde je, víceřádkový text v editoru příkazu <Command id="MTEXT" /> a definice atributu jako její identifikátor, výzva a výchozí hodnota. V režimu <Keyword id="Multiple" /> se příkaz pak ptá na další objekt, dokud ho Esc nebo Enter neukončí, a celé spuštění je jeden krok, který vrátí <Command id="U" />. Poklepání na text nebo definici atributu spustí TEXTEDIT a na víceřádkovém textu otevře editor pro tento jeden objekt.

Esc v editoru jednořádkového textu zahodí tuto úpravu a zeptá se na další objekt; druhé stisknutí Esc příkaz ukončí. U objektu v zamknuté hladině příkaz vypíše <Message id="objectOnLockedLayer" /> a zeptá se znovu a výběr čehokoli jiného otázku zopakuje beze zprávy. Jeden text vybraný před spuštěním příkazu se otevře hned.

## Options

### Undo

Vrátí poslední úpravu tohoto spuštění a zeptá se znovu; když už nic nezbývá, oznámí, že příkaz byl zcela vrácen.

### Mode

Zeptá se na režim úprav: <Keyword id="Single" /> ukončí příkaz po jednom objektu, <Keyword id="Multiple" /> se zeptá na další. Režim se zachová pro další spuštění příkazu TEXTEDIT, v každém výkresu.

## Missing

Text kóty: TEXTEDIT neupravuje text kóty, který určuje možnost Text příkazu <Command id="DIMLINEAR" /> při jejím umisťování. Úprava obsahu textu v paletě Vlastnosti. Zapsaný MTEDIT a -MTEDIT. Když je editor otevřený, příkazový řádek ukazuje `TEXTEDIT:`, zatímco AutoCAD upravuje na místě a na nic se neptá.

## Questions

### Jak se jmenuje příkaz TEXTEDIT česky?

Také TEXTEDIT: česká verze AutoCADu jeho název nepřekládá. Zadejte `ED` a stiskněte Enter nebo mezerník; fungují i `TED` a `DIAEDIT`, česká obdoba staršího `DDEDIT`. `_TEXTEDIT` funguje v AutoCADu v každém jazyce.

### Jak v AutoCADu upravit text?

Poklepejte na něj, nebo zadejte `ED` a vyberte ho; přepište ho a stiskněte Enter. TEXTEDIT se pak ptá na další text k úpravě, dokud nestisknete Esc. Jeho výška a natočení jsou řádky palety Vlastnosti a jeho styl řádek Styl.

### Jak upravit několik textů po sobě?

Nechte TEXTEDIT v režimu <Keyword id="Multiple" />, výchozím: po každém textu se zeptá na další. <Keyword id="Mode" /> a <Keyword id="Single" /> zařídí, že skončí po jednom, jako při poklepání.

### Proč poklepání text neupraví?

Text může ležet v zamknuté hladině: odemkněte hladinu ve Správci vlastností hladin. Text kóty TEXTEDIT zatím neupravuje a hodnoty atributů bloku otevře <Command id="EATTEDIT" />.
