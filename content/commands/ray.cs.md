---
title: "Polopřímka v AutoCADu: příkaz POLOPŘÍMKA (RAY)"
metaTitle: "Polopřímka v AutoCADu: POLOPŘÍMKA (RAY)"
description: "Jak v AutoCADu nakreslit polopřímku příkazem POLOPŘÍMKA (RAY): konstrukční čára z bodu do nekonečna jedním směrem a jak ji oříznout na úsečku. Vyzkoušejte."
figure: "Polopřímky z jednoho počátečního bodu třemi body, každá pokračuje za okraj pohledu."
sourceHash: "732d6e8c23de"
---

Příkaz POLOPŘÍMKA (RAY) kreslí polopřímky: konstrukční čáry, které začínají v bodě a vedou do nekonečna jedním směrem. Určete počáteční bod a pak bod, kterým polopřímka prochází: začíná v prvním a prochází druhým. Každý další bod vytvoří další polopřímku ze stejného počátku, dokud Enter příkaz neukončí. Bod v místě počátku se odmítne zprávou <Message id="invalid" />. Každá polopřímka leží v aktuální hladině s aktuální barvou, typem čáry a tloušťkou čáry.

Polopřímka vede přes celý pohled, ať ho posunete nebo zvětšíte jakkoli daleko, a do rozsahu výkresu se nezapočítává, jako v AutoCADu. Uchopení Koncový najde její počátek, Nejbližší, Kolmo a Průsečík fungují podél ní. Příkazy <Command id="TRIM" /> a <Command id="BREAK" /> udělají z úseku, na kterém leží počátek, úsečku a příkaz <Command id="EXTEND" /> prodlouží počátek zpět k hraně za ním. Příkaz <Command id="XLINE" /> kreslí čáry, které vedou oběma směry.

## Missing

LENGTHEN a JOIN u polopřímky zatím nejsou ověřené proti AutoCADu, stejně jako nabídky jejích uzlů.

## Questions

### Co je příkaz POLOPŘÍMKA v AutoCADu?

Konstrukční čára s počátkem: začíná v bodě a pokračuje donekonečna jedním směrem. Použijte ji jako vodítko, podle kterého kreslíte, a pak ji ořízněte na úsečku nebo vymažte.

### Jak se jmenuje příkaz POLOPŘÍMKA anglicky a má zkratku?

RAY. AutoCAD mu žádnou zkratku nedává, takže zadejte `POLOPŘÍMKA` celé, nebo `_RAY`, které funguje v AutoCADu v každém jazyce. Je v rozbaleném panelu Kreslit na pásu karet a zde v nástrojích kreslení vedle Konstrukční přímky.

### Jak zastavit polopřímku na čáře?

Ořízněte ji: spusťte příkaz <Command id="TRIM" /> a vyberte část za čárou. Co zbude od počátku k čáře, je objekt úsečka.

### Jaký je rozdíl mezi polopřímkou a úsečkou?

Úsečka má dva konce; polopřímka jeden, svůj počátek, a pokračuje bez konce. V souboru DXF se polopřímka ukládá jako RAY a jako polopřímka se i otevře.
