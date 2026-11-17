---
title: "Příkaz DĚLÚ (DIVIDE) v AutoCADu"
description: "Jak v AutoCADu rozdělit úsečku nebo kružnici na stejné díly příkazem DĚLÚ (DIVIDE, zkratka DU): body nebo bloky, a proč body nejsou vidět. Vyzkoušejte zdarma."
figure: "PDMODE 3, aby se body zobrazily jako křížky, pak úsečka rozdělená na 5 a kružnice na 6, začínající v jejím bodě 0°."
sourceHash: "6f3c52078466"
---

Příkaz DĚLÚ (DIVIDE) vyznačí na objektu stejné díly. Vyberte jednu úsečku, oblouk, kružnici, elipsu, eliptický oblouk, křivku, 3D křivku nebo spline, výběrem nebo zadáním bodu na něm, a pak zadejte počet segmentů, od 2 do 32767: příkaz DĚLÚ umístí do každého místa dělení bodový objekt a skončí. Objekt nerozdělí, ten zůstane celý. Otevřený objekt rozdělený na 5 dostane 4 body, počítáno od jeho začátku; uzavřený dostane 5 a mezi nimi i svůj začátek: kružnice od svého bodu 0°, proti směru hodinových ručiček, uzavřená křivka od svého prvního vrcholu. Body leží na objektu, v jeho výšce, v aktuální hladině s aktuální barvou, typem čáry a tloušťkou čáry.

Body se kreslí podle stylu bodu výkresu a výchozí je tečka, která se schová pod čárou: nejdřív nastavte viditelný tvar příkazem <Command id="PTYPE" /> nebo proměnnou PDMODE. Celé rozdělení je jeden krok, který vrátí příkaz <Command id="U" />, a jeho body tvoří sadu Předchozí, připravenou k vymazání nebo posunutí. Jakýkoli jiný objekt, text nebo reference bloku, vyvolá <Message id="cannotDivideObject" /> a příkaz skončí. Příkaz DĚLÚ spouští také rozevírací seznam Body v nástrojích kreslení.

## Options

### Block

Místo bodů reference bloku, který už ve výkresu je: zadejte jeho název, pak zda každou referenci zarovnat s objektem, <Keyword id="Yes" /> (výchozí) nebo <Keyword id="No" />, a pak počet segmentů. Zarovnaná reference se otočí s objektem v místě, kde leží, podél úsečky nebo tečně k oblouku; nezarovnaná si každá ponechá osu X systému USS. Název, za kterým není žádný blok, se odmítne a otázka na název se zopakuje. Proměnné atributy bloku se vynechají, jako v AutoCADu.

## Missing

Šroubovice, kterou MellowCAD zatím neumí nakreslit. Bloky podél objektu, který neleží v rovině USS, se kladou do roviny USS, kde je nápověda AutoCADu klade do roviny samotného objektu. Body kružnice vždy začínají na ose X systému USS, kde je AutoCAD začíná pod úhlem krokování, SNAPANG, který MellowCAD nemá.

## Questions

### Jak se jmenuje příkaz DĚLÚ anglicky a jakou má zkratku?

DIVIDE. V české verzi AutoCADu je jeho zkratka `DU`: zadejte ji a stiskněte Enter nebo mezerník. Anglická zkratka `DIV` v české verzi nefunguje; `_DIVIDE` funguje v AutoCADu v každém jazyce.

### Proč příkaz DĚLÚ nefunguje?

Nejspíš funguje: body tam jsou, nakreslené jako tečky na čáře. Otevřete příkaz <Command id="PTYPE" /> a zvolte křížek nebo kroužek, nebo zadejte PDMODE a `3`: každý bod ve výkresu se hned změní. Chcete-li je vybrat, použijte uchopení Uzel, `BOD`.

### Jak v AutoCADu rozdělit úsečku na stejné díly?

Spusťte příkaz DĚLÚ, vyberte úsečku a zadejte počet dílů, `5` pro pět. Čtyři body mezi díly jsou místa, kam uchopovat: najde je uchopení Uzel.

### Jak rozdělit kružnici na stejné díly?

Stejně: vyberte kružnici a zadejte počet dílů. Uzavřený objekt dostane tolik bodů, kolik je dílů, takže 6 dá šest bodů, první v bodě 0° kružnice, další proti směru hodinových ručiček.

### Jak rozdělit úsečku na samostatné kusy?

Příkaz DĚLÚ místa jen vyznačí. Chcete-li úsečku v nich přerušit, použijte příkaz <Command id="BREAK" /> nebo <Command id="BREAKATPOINT" /> v každém bodě, s uchopením Uzel.
