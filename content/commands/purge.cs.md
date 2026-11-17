---
title: "Příkaz ČISTI (PURGE) v AutoCADu"
description: "Jak odstranit nepoužité bloky a typy čar v AutoCADu příkazem ČISTI (PURGE, zkratka CI): podle názvu nebo všechny najednou, s potvrzením nebo bez. Vyzkoušejte."
figure: "Dva bloky, TAG vložený na zeď a BOX, jehož jediná reference byla vymazána: ČISTI, všechny názvy, bez ověření, odstraní jen BOX."
sourceHash: "7a22ff19d409"
---

Příkaz ČISTI (PURGE) odstraní to, co výkres definuje, ale nepoužívá; zde jsou to bloky a typy čar. V AutoCADu příkaz ČISTI otevře dialog Vyčistit; MellowCAD ho nemá, a tak se příkaz ČISTI ptá na příkazovém řádku na to, na co se ptá <Command id="-PURGE" />, jako to dělá konzole AutoCADu. Vypíše nastavení Vnořené položky a Osamocená data, obě vypnutá, a zeptá se, jaký typ nepoužitých objektů vyčistit, s nabídkou <Keyword id="Blocks" /> a <Keyword id="LTypes" />; Enter tam příkaz ukončí.

Blok se používá, dokud ho umisťuje reference ve výkresu nebo ho obsahuje definice používaného bloku, v jakékoli hloubce. Vymazání poslední reference bloku ponechá jeho definici ve výkresu, kde ho <Command id="INSERT" /> může znovu umístit: odstraní ji až příkaz ČISTI. Blok obsažený v ponechaném bloku se nikdy neodstraní a řetězec bloků, které obsahují jen sebe navzájem, zmizí v jednom spuštění. Když není co odstranit, vypíše <Message id="noUnreferencedBlocks" />. Každé spuštění je jeden krok, který vrátí <Command id="U" />.

## Options

### Blocks

Zeptá se na názvy k vyčištění, ve výchozím stavu `*` pro všechny nepoužité bloky, nebo na názvy se zástupnými znaky, oddělené čárkami. Pak se zeptá, zda ověřit každý název: <Keyword id="Yes" />, výchozí, se před odstraněním zeptá na každý blok, <Keyword id="No" /> odstraní všechny a vypíše každý název a jejich počet.

### LTypes

Zeptá se na názvy a na ověření každého, stejně jako <Keyword id="Blocks" />, a odstraní typy čar, které nic nepoužívá. Continuous, aktuální typ čáry a typ, který používá hladina nebo objekt, i uvnitř bloku, vždy zůstanou; když není co odstranit, vypíše <Message id="noUnreferencedLinetypes" />. Možnost <Keyword command="LINETYPE" id="Load" /> příkazu <Command id="LINETYPE" /> typ čáry vrátí.

## Missing

Dialog Vyčistit a všechny ostatní typy: hladiny, textové a kótovací styly, skupiny, materiály, styly multiodkazů a tabulek a vizuální styly, registrované aplikace, geometrie nulové délky, prázdné textové objekty, osamocená data a Vše. Nastavení Vnořené položky a Osamocená data nelze změnit.

## Questions

### Jak se jmenuje příkaz ČISTI anglicky?

PURGE. V českém AutoCADu je jeho zkratka `CI`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `PU` v české verzi nefunguje. `-ČISTI` je <Command id="-PURGE" />, verze pro příkazový řádek, kterou příkaz ČISTI spouští i zde. `_PURGE` funguje v AutoCADu v jakémkoli jazyce.

### Jak vyčistit nepoužité bloky v AutoCADu?

Zadejte `CI`, zvolte <Keyword id="Blocks" />, stiskněte Enter pro všechny názvy a odpovězte <Keyword id="No" />, aby se odstranily všechny bez dotazu na každý.

### Proč nemohu vyčistit blok?

Protože se používá: umisťuje ho reference ve výkresu nebo ho obsahuje používaný blok, třeba vnořený o několik úrovní hlouběji. Vymažte jeho reference nebo rozložte bloky, které ho obsahují, a příkaz ČISTI ho odstraní.

### Jak vyčistit hladiny?

V AutoCADu typem Hladiny příkazu ČISTI. Zde zatím ne: příkaz ČISTI tu čistí bloky a typy čar; prázdnou hladinu místo toho odstraňte ve Správci vlastností hladin.
