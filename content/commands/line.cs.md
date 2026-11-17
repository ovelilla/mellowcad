---
title: "Příkaz ÚSEČKA (LINE) v AutoCADu"
description: "Jak nakreslit úsečku v AutoCADu příkazem ÚSEČKA (LINE, zkratka U), výzva po výzvě: body určené nebo zadané, Zpět, Uzavřít a navázání. Vyzkoušejte online."
figure: "Trojúhelník: první bod zadaný, další dva od posledního bodu, pak Uzavřít."
sourceHash: "5065fc1817a1"
---

Příkaz ÚSEČKA (LINE) kreslí přímé segmenty, každý jako samostatný objekt: zadejte první bod, pak každý další, dokud nestisknete Enter. Bod lze ukázat, uchopit na objektu nebo zadat. Stejně jako v AutoCADu se zapnutým dynamickým zadáváním se bod zadaný po prvním měří od posledního, takže `80,0` nakreslí 80 ve směru X a historie ho zapíše jako `@80,0`; samotné číslo je vzdálenost ve směru kurzoru a `<30` zamkne další bod na úhel 30°. Enter nebo pravé tlačítko u prvního bodu naváže na konec poslední úsečky, křivky nebo oblouku, od oblouku tečně a s dotazem jen na délku. Ať nakreslí segmentů kolik chce, jedno <Command id="U" /> vrátí celý příkaz.

## Options

### Undo

Vrátí poslední segment a znovu se ptá od předchozího bodu. Když nezbude žádný segment, vypíše <Message id="allLineSegmentsUndone" /> a znovu se zeptá na první bod.

### Close

Nabízí se od druhého segmentu: nakreslí poslední segment zpět do prvního bodu a příkaz ukončí, takže tvar uzavře.

## Missing

Uchopení Tečna nebo Kolmo zadané u prvního bodu čeká na další bod (odložené uchopení), jako v AutoCADu, ale jen nad úsečkami, kružnicemi a oblouky, ne nad segmentem křivky, elipsou nebo spline, a dvě odložená uchopení Kolmo se neřeší.

## Questions

### Jak se jmenuje příkaz ÚSEČKA anglicky?

LINE. V českém AutoCADu je jeho zkratka `U`: zadejte ji a stiskněte Enter nebo mezerník. Pozor: v anglickém AutoCADu `U` vrací krok zpět, v českém kreslí úsečku a zpět vrací `Z`; anglické `L` v české verzi nefunguje. Celý název `ÚSEČKA` funguje také a `_LINE` v AutoCADu v jakémkoli jazyce.

### Jak nakreslit úsečku dané délky pod úhlem?

Zadejte první bod a další zadejte jako délku a úhel: `@100<30` nakreslí 100 pod úhlem 30°. Nebo zapněte polární trasování, veďte kurzor po jeho vodicí čáře pod tímto úhlem a zadejte jen délku.

### Jak navázat na naposledy nakreslenou úsečku?

Spusťte příkaz ÚSEČKA a u prvního bodu stiskněte Enter: začne od konce poslední úsečky, křivky nebo oblouku. Od oblouku pokračuje úsečka tečně k němu a příkaz se ptá jen na její délku. Když není na co navázat, vypíše <Message id="noLineOrArcToContinue" />.

### Proč se moje čára skládá ze samostatných kusů?

Každý segment, který příkaz ÚSEČKA nakreslí, je samostatná úsečka, jako v AutoCADu. Chcete-li jeden objekt, kreslete příkazem <Command id="PLINE" />, nebo úsečky dodatečně spojte příkazem <Command id="JOIN" />.
