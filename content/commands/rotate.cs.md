---
title: "Příkaz OTOČ (ROTATE) v AutoCADu"
description: "Jak v AutoCADu otočit objekt příkazem OTOČ (ROTATE, zkratka OT): základní bod a úhel, Kopie se zachováním originálu, Reference."
figure: "Obdélník otočený o 30° kolem rohu s možností Kopie: originál zůstane na místě."
sourceHash: "0e5ae021e108"
---

Příkaz OTOČ (ROTATE) otáčí vybrané objekty kolem základního bodu: vyberte je, zadejte základní bod a pak úhel – zapsaný, nebo určený bodem, jehož směr od základního bodu udává úhel. První řádek uvádí, který směr je kladný, ve výchozím nastavení proti směru hodinových ručiček (ANGDIR), a kde leží 0 (ANGBASE). Enter u úhlu zopakuje poslední otočení, v novém výkresu 0. Objekty se otáčejí kolem osy rovnoběžné s osou Z systému USS, procházející základním bodem, takže ve 3D si zachovají svou výšku. Otočení je jeden krok, který lze vrátit zpět.

## Options

### Copy

Otočí kopii a objekty ponechá na místě se zprávou <Message id="rotatingCopy" />. Pak se znovu zeptá na úhel.

### Reference

Otočí z úhlu, který objekty mají, do úhlu, který mít mají: zeptá se na referenční úhel (zapsaný, nebo změřený dvěma body), pak na nový úhel a otočí o rozdíl. Chcete-li vyrovnat šikmou hranu do vodorovné polohy, určete její dva konce jako referenci a zadejte 0.

### Points

U nového úhlu možnosti <Keyword id="Reference" />: nový úhel je úhel úsečky mezi dvěma určenými body, takže se objekty vyrovnají podél hrany, která už je nakreslená.

## Missing

Při zadávání úhlu sleduje otáčená sada kurzor v barvě každého objektu, ale bez jeho typu čáry a tloušťky čáry.

## Questions

### Jak se jmenuje příkaz OTOČ anglicky?

ROTATE. V české verzi AutoCADu zadejte `OTOČ` nebo zkratku `OT` a stiskněte Enter nebo mezerník; zkratka `RO` z anglické verze v české spouští -ROZVRŽENÍ (-LAYOUT). Anglický název s podtržítkem, `_ROTATE`, funguje v AutoCADu v každém jazyce.

### Jak v AutoCADu otočit objekt rovnoběžně s jiným?

Zvolte <Keyword id="Reference" />, určete dva body podél hrany objektu, pak zvolte <Keyword id="Points" /> a určete dva body podél čáry, ke které se má vyrovnat.

### Jak otočit objekt a zachovat originál?

Zvolte <Keyword id="Copy" />, než zadáte úhel: otočí se kopie a originál zůstane.

### Proč příkaz OTOČ otáčí na špatnou stranu?

Kladný úhel otáčí proti směru hodinových ručiček, jak uvádí ANGDIR v prvním řádku. Zadejte záporný úhel, například `-30`, a objekt se otočí po směru hodinových ručiček.
