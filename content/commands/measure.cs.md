---
title: "Příkaz DĚLM (MEASURE) v AutoCADu"
description: "Jak rozmístit body po zadané délce v AutoCADu příkazem DĚLM (MEASURE, zkratka DM): body nebo bloky od bližšího konce úsečky, oblouku či křivky. Vyzkoušejte."
figure: "Křivka dlouhá 190 rozměřená po 15 od konce, u kterého byla vybrána: dvanáct bodů, poslední 10 před druhým koncem."
sourceHash: "3975c3873eff"
---

Příkaz DĚLM (MEASURE) označí objekt po zadané délce. Vyberte jednu úsečku, oblouk, kružnici, elipsu, eliptický oblouk, křivku, 3D křivku nebo spline a pak zadejte délku, číslem nebo dvěma body: příkaz DĚLM umístí podél objektu bodový objekt vždy po této délce, dokud se vejde, a skončí. Vzdálenost za vás neměří a objekt nerozdělí. Začíná od konce bližšího místu, kde jste objekt vybrali, takže ho vyberte blízko konce, od kterého chcete měřit; zbytek zůstane na druhém konci, a když se délka do objektu vejde beze zbytku, dostane bod i druhý konec. Kružnice začíná ve svém bodě 0° a postupuje proti směru hodinových ručiček, ať ji vyberete kdekoli; uzavřená křivka začíná ve svém prvním vrcholu.

Body se kreslí podle stylu bodu výkresu, ve výchozím stavu jako tečka: nejprve nastavte viditelný tvar příkazem <Command id="PTYPE" /> nebo proměnnou PDMODE. Body leží na objektu, v aktuální hladině, s aktuální barvou, typem čáry a tloušťkou čáry; celé spuštění je jeden krok, který vrátí <Command id="U" />, a body tvoří výběrovou množinu Předchozí. Při délce delší než objekt vypíše <Message id="objectNotThatLong" /> a při délce tak krátké, že by vzniklo přes 32767 bodů, <Message id="objectTooLong" />; v obou případech nevznikne nic. Na jakýkoli jiný objekt odpoví <Message id="cannotMeasureObject" />. Příkaz DĚLM spouští i rozevírací nabídka Body mezi nástroji Kreslit.

## Options

### Block

Místo bodů reference bloku, který už ve výkresu je: zadejte jeho název, pak zda každou referenci zarovnat s objektem, <Keyword id="Yes" /> (výchozí) nebo <Keyword id="No" />, a pak délku. Zarovnaná reference se otočí s objektem v místě, kde leží, podél úsečky nebo tečně k oblouku, ať měření začíná od kteréhokoli konce; nezarovnaná si ponechá osu X USS. Název, za kterým není žádný blok, se odmítne a příkaz se na něj zeptá znovu.

## Missing

Směr uzavřené křivky vybrané za její polovinou: zde se měří zpět od jejího prvního vrcholu, jak AutoCAD měří uzavřenou elipsu nebo spline, ale samotná křivka v AutoCADu ověřená nebyla. Body na kružnici vždy začínají ve směru osy X USS, kdežto AutoCAD je začíná v úhlu kroku, SNAPANG, který MellowCAD nemá.

## Questions

### Jak se jmenuje příkaz DĚLM anglicky?

MEASURE. V českém AutoCADu je jeho zkratka `DM`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `ME` v české verzi spouští příkaz MĚŘÍTKO; celý název `DĚLM` funguje také a `_MEASURE` v AutoCADu v jakémkoli jazyce.

### Měří příkaz DĚLM vzdálenosti?

Ne: rozmísťuje body po zadané délce. Vzdálenost mezi dvěma body zjistíte příkazem <Command id="DIST" />; délku objektu příkazem <Command id="LIST" /> nebo <Command id="AREA" />.

### Od kterého konce příkaz DĚLM začíná?

Od konce bližšího bodu, ve kterém jste objekt vybrali. Vyberte ho blízko konce, od kterého se má měřit první délka.

### Proč nevidím body, které příkaz DĚLM vytvořil?

Kreslí se jako tečky, výchozí styl bodu. Otevřete <Command id="PTYPE" /> a zvolte křížek nebo kroužek, nebo nastavte PDMODE na `3`: všechny body se změní najednou.

### Jaký je rozdíl mezi příkazy DĚLM a DĚLÚ (DIVIDE)?

<Command id="DIVIDE" /> rozdělí objekt na zadaný počet stejných dílů; příkaz DĚLM postupuje po objektu o zadanou délku a zbytek nechá na druhém konci.
