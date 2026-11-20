---
title: "Konstrukční přímka v AutoCADu: příkaz PŘÍMKA (XLINE)"
metaTitle: "Konstrukční přímka v AutoCADu: PŘÍMKA (XLINE)"
description: "Jak v AutoCADu nakreslit konstrukční přímku příkazem PŘÍMKA (XLINE, zkratka PK): dvěma body, vodorovně, svisle, pod úhlem, osou úhlu nebo odsazením."
figure: "Konstrukční přímky procházející bodem, vodorovná přímka a osa úhlu mezi dvěma úsečkami, každá přes celý pohled."
sourceHash: "5b81d2c75993"
---

Příkaz PŘÍMKA (XLINE) kreslí konstrukční přímky: čáry nekonečné délky, které vedou přes celý pohled, ať ho posunete nebo zvětšíte jakkoli daleko, abyste si rozvrhli výkres dřív, než přijdou skutečné čáry. Určete bod a pak bod, kterým přímka prochází: přímka vede oběma a každý další bod vytvoří další přímku procházející prvním bodem, dokud Enter příkaz neukončí. Bod v místě prvního bodu se odmítne zprávou <Message id="invalid" />. Každá přímka leží v aktuální hladině s aktuální barvou, typem čáry a tloušťkou čáry.

Přímka nemá konce: když zobrazíte celý rozsah výkresu, nezapočítá se do něj, jako v AutoCADu. Uchopení Polovina najde bod, kterým byla nakreslena, Nejbližší, Kolmo a Průsečík fungují podél ní a příkaz <Command id="TRIM" /> nebo <Command id="BREAK" /> z ní udělá polopřímku, nebo dvě – tak se z konstrukčních přímek stávají čáry výkresu. Příkaz <Command id="RAY" /> kreslí tu její polovinu, která začíná v bodě.

## Options

### Hor

Vodorovné přímky, podél osy X systému USS, každá bodem, který zadáte, dokud nestisknete Enter.

### Ver

Svislé přímky, podél osy Y systému USS, každá bodem, který zadáte.

### Ang

Přímky pod úhlem: zadejte ho, nebo určete dva body, a pak body, kterými přímky procházejí. Enter u úhlu převezme 0. Možnost <Keyword id="Reference" /> měří úhel proti směru hodinových ručiček od vybraného lineárního objektu – úsečky, přímky nebo polopřímky: cokoli jiného se odmítne zprávou <Message id="noUsableObjectSelected" />.

### Bisect

Přímka, která půlí úhel: určete jeho vrchol, bod na prvním rameni, pak bod na druhém rameni, a osa úhlu projde vrcholem. Každý další bod na druhém rameni vytvoří další osu se stejným prvním ramenem.

### Offset

Přímky rovnoběžné s lineárním objektem – úsečkou, přímkou nebo polopřímkou: zadejte vzdálenost, vyberte objekt a určete stranu, znovu a znovu, dokud nestisknete Enter. Možnost <Keyword id="Through" /> místo toho vede každou přímku bodem, který zadáte. Vzdálenost je ta, kterou si pamatuje příkaz <Command id="OFFSET" />, a ta, kterou příště nabídne.

## Missing

LENGTHEN a JOIN u konstrukční přímky zatím nejsou ověřené proti AutoCADu, stejně jako nabídky jejích uzlů.

## Questions

### Jak se jmenuje příkaz PŘÍMKA anglicky a jakou má zkratku?

XLINE. V české verzi AutoCADu je jeho zkratka `PK`: zadejte ji a stiskněte Enter nebo mezerník; `_XLINE` funguje v AutoCADu v každém jazyce. Na pásu karet je to Konstrukční přímka v rozbaleném panelu Kreslit; zde je v nástrojích kreslení vedle Polopřímky.

### Jak nakreslit vodorovnou nebo svislou konstrukční přímku?

Spusťte příkaz PŘÍMKA, zadejte `H` pro <Keyword id="Hor" /> nebo `V` pro <Keyword id="Ver" /> a určete body, kterými přímky procházejí. Vodorovně a svisle se rozumí v aktuálním USS.

### Jak oříznout konstrukční přímku?

Příkazem <Command id="TRIM" />, jako kteroukoli čáru: oříznutá na jedné straně se přímka stane polopřímkou, na obou úsečkou. Totéž udělá příkaz <Command id="BREAK" />.

### Proč ZOOM Maximálně ignoruje konstrukční přímky?

Přímka nemá rozsah: vede do nekonečna oběma směry. AutoCAD přímky a polopřímky do rozsahu výkresu nezapočítává a MellowCAD také ne.

### Jaký je rozdíl mezi přímkou a polopřímkou v AutoCADu?

Přímka vede do nekonečna oběma směry; polopřímka, kterou kreslí příkaz <Command id="RAY" />, začíná v bodě a vede jen jedním směrem.
