---
title: "Typ čáry v AutoCADu: příkaz TYPČ (LINETYPE)"
description: "Jak načíst typ čáry v AutoCADu příkazem TYPČ (LINETYPE, zkratka TC): acadiso.lin, aktuální typ pro nové objekty, DleHlad a proč čárkovaná čára vypadá plná."
figure: "Deska, jejíž otvor je nakreslen s aktuálním typem HIDDEN a obě osy s typem CENTER, pak TYPČ nastavený zpět na DleHlad."
sourceHash: "d15530a865c1"
---

Příkaz TYPČ (LINETYPE) nastaví typ čáry, kterým se kreslí nové objekty. AutoCAD otevře Správce typů čar; MellowCAD ho zatím nemá, a tak příkaz TYPČ spustí verzi pro příkazový řádek, kterou má i AutoCAD, <Command id="-LINETYPE" />. Vypíše aktuální typ čáry, na začátku `DleHlad`, a po každé odpovědi se znovu ptá na volbu, dokud ho Enter neukončí. DleHlad znamená, že každý objekt přebírá typ čáry své hladiny; typ zadaný názvem je vlastním typem objektu. Celé spuštění je jeden krok, který vrátí <Command id="U" />, a když příkaz zadáte s apostrofem uvnitř jiného příkazu, jeho typ čáry platí pro to, co ten příkaz nakreslí dál.

Výkres si nese vlastní typy čar, uložené s ním i v jeho DXF. Nový jich má šest: Continuous a z metrického souboru AutoCADu acadiso.lin DASHED, HIDDEN, CENTER, PHANTOM a DASHDOT; ostatní se načítají z acadiso.lin a soubor DXF přináší vlastní, i ISO a složené, jejichž text, třeba `GAS` u GAS_LINE, se kreslí podél čáry. Vzor se na každou čáru klade jako v AutoCADu: vystředěný po její délce, se stejnými čárkami na obou koncích, ve velikosti podle <Command id="LTSCALE" /> a podle vlastního měřítka typu čáry objektu, které nastavují <Command id="CHPROP" /> a paleta Vlastnosti a novým objektům dává CELTSCALE.

## Options

### ?

Vypíše typy čar ve dvou sloupcích, název a popis. Na výzvě voleb se zeptá, který soubor vypsat, ve výchozím stavu acadiso.lin, nebo acad.lin, soubor AutoCADu v palcích, a vypíše jeho typy čar v pořadí souboru; na výzvě volby <Keyword id="Set" /> ty, které jsou načtené ve výkresu a jejichž názvy odpovídají zadanému textu, při `*` všechny, seřazené podle názvu.

### Load

Zeptá se, které typy čar načíst, jeden název nebo několik oddělených čárkami, i se zástupnými znaky (`DASH*`), a pak, ve kterém souboru hledat: nejprve v acadiso.lin, potom v naposledy prohledaném. Každý nalezený se načte a vypíše, v pořadí souboru; na typ už načtený se nejprve zeptá a <Keyword id="Yes" />, výchozí odpověď, ho načte znovu. Název, který soubor nemá, nebo jiný soubor než acadiso.lin a acad.lin oznámí.

### Set

Zeptá se na název typu čáry a nabídne aktuální; zadejte název načteného typu nebo <Keyword id="BYLayer" />. Typ, který má acadiso.lin, se nejprve načte, jako to dělá AutoCAD; jakýkoli jiný se nenajde, což oznámí stejně jako AutoCAD, a vrátí se výzva voleb. Enter ponechá aktuální.

## Missing

Správce typů čar a vytváření typů čar nebo jejich načítání z vlastního souboru. Tvary složených typů čar, jako je BATTING nebo ZIGZAG, kreslené jako mezery na jejich místě. DleBlok. PSLTSCALE a MSLTSCALE, protože tu není výkresový prostor. Soubor acadiso.lin AutoCADu v jednotlivých jazycích, z něhož španělský nebo německý AutoCAD načítá své názvy (TRAZOS, STRICHLINIE): volba <Keyword id="Load" /> čte ve všech jazycích anglický, i když výkres vytvořený s těmito názvy se otevře s vlastními. PLINEGEN: nová křivka začíná vzor znovu v každém vrcholu, pokud to nezapne volba <Keyword command="PEDIT" id="Ltype gen" /> příkazu <Command id="PEDIT" />.

## Questions

### Jak se jmenuje příkaz TYPČ anglicky?

LINETYPE. V českém AutoCADu jsou jeho zkratky `TC`, `DDLTYPE` a `DIATYPČ`: zadejte jednu z nich a stiskněte Enter nebo mezerník. Anglické `LT` a `LTYPE` v české verzi nefungují, `DDLTYPE` ano; celý název `TYPČ` funguje také a `_LINETYPE` v AutoCADu v jakémkoli jazyce.

### Proč se čárkovaná čára zobrazuje jako plná?

Čára kratší než jedno opakování vzoru se kreslí plná, jako v AutoCADu: vzor CENTER je při výchozím měřítku dlouhý asi 51 jednotek. Zvětšete nebo zmenšete <Command id="LTSCALE" />, aby vzor odpovídal výkresu. Zkontrolujte také, že typ čáry objektu, nebo jeho hladiny, když je DleHlad, není Continuous.

### Jak změnit typ čáry existujícího objektu?

Vyberte ho a zvolte typ čáry v řádku Typ čáry palety Vlastnosti, nebo ho zkopírujte z jiného objektu příkazem <Command id="MATCHPROP" />. Příkaz TYPČ nastavuje jen typ čáry objektů nakreslených po něm.

### Jak změnit měřítko typu čáry v AutoCADu?

Zadejte <Command id="LTSCALE" /> a nový faktor: 2 prodlouží každou čárku na dvojnásobek, v celém výkresu.

### Jak načíst typ čáry v AutoCADu?

AutoCAD ho načítá ve Správci typů čar. Zde zadejte `-TYPČ`, zvolte <Keyword id="Load" />, zadejte název typu čáry, třeba `HIDDEN2` nebo `ACAD_ISO02W100`, a stiskněte Enter, aby se prohledal acadiso.lin. <Keyword id="Set" /> načte typ, který má acadiso.lin, a rovnou ho nastaví jako aktuální.
