---
title: "Příkaz OBLOUK (ARC) v AutoCADu"
metaTitle: "Oblouk v AutoCADu: příkaz OBLOUK (ARC), 3 body"
description: "Jak nakreslit oblouk v AutoCADu příkazem OBLOUK (ARC, O): třemi body, počátek-střed-konec nebo střed-počátek-konec, s Ctrl ve směru hodinových ručiček."
figure: "Tři oblouky: třemi body, od počátku kolem středu do konce a ze středu přes počátek do konce."
sourceHash: "af9b22e35456"
---

Příkaz OBLOUK (ARC) ve výchozím nastavení kreslí oblouk třemi body: jeho počátkem, bodem, kterým prochází, a koncem. Nebo ho kreslí kolem středu, od počátečního bodu ke koncovému, tak jak ho spouštějí tlačítka Počátek, střed, konec a Střed, počátek, konec na pásu karet. Jako v AutoCADu běží oblouk zadaný středem od počátku proti směru hodinových ručiček a konec jen určuje, kde se zastaví: nemusí ležet na oblouku. Zatímco body umísťujete, oblouk sleduje kurzor, s jantarovou čárkovanou čarou od počátku nebo od středu. Oblouk leží v rovině svého prvního bodu. Oblouk, který nelze vytvořit (tři body na jedné přímce nebo konec v počátku), ohlásí <Message id="invalid" /> a nic nenakreslí.

## Options

### Center

Na první výzvu: nejprve zadejte střed, pak počáteční a koncový bod. Na druhou výzvu, po počátku: následuje střed, pak konec. Při zadávání konce v obou případech podržte Ctrl a oblouk poběží ve směru hodinových ručiček.

## Missing

Možnosti, které oblouk ukončí jeho úhlem, délkou tětivy, směrem nebo poloměrem místo koncového bodu, a Konec u druhého bodu, který k nim vede; chybí i tlačítka pásu karet pro tyto způsoby. Pokračování: Enter na první výzvu, který v AutoCADu kreslí oblouk tečný k poslední úsečce nebo oblouku, tady příkaz OBLOUK ukončí. Pole středového úhlu, které dynamické zadávání ukazuje na konci režimů se středem.

## Questions

### Jak se jmenuje příkaz OBLOUK anglicky a jakou má zkratku?

Anglicky ARC, v českém AutoCADu OBLOUK: zadejte `O` a stiskněte Enter nebo mezerník. Anglické `A` v českém AutoCADu nefunguje; `_ARC` funguje v AutoCADu v jakémkoli jazyce.

### Jak v AutoCADu nakreslit oblouk třemi body?

Spusťte příkaz OBLOUK a zadejte tři body: počátek, libovolný bod, kterým oblouk prochází, a konec. To je výchozí způsob, bez volby možnosti.

### Proč se oblouk kreslí na opačnou stranu?

Oblouk kreslený ze středu běží od počátku proti směru hodinových ručiček, jako v AutoCADu. Prohoďte počátek a konec, nebo při zadávání koncového bodu podržte Ctrl a oblouk poběží ve směru hodinových ručiček.

### Jak nakreslit oblouk tečný ke dvěma úsečkám?

Použijte <Command id="FILLET" /> s poloměrem: nakreslí oblouk tečný k oběma úsečkám a ořízne je k němu. Oblouk tečný k předchozímu segmentu nakreslete v křivce, možností oblouku příkazu <Command id="PLINE" />.
