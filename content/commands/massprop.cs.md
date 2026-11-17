---
title: "Příkaz HMOTV (MASSPROP) v AutoCADu"
description: "Jak zjistit objem 3D tělesa a těžiště oblasti v AutoCADu příkazem HMOTV (MASSPROP): plocha, momenty setrvačnosti a soubor .mpr. Vyzkoušejte online."
figure: "Kvádr 60 × 40 × 25 v počátku: HMOTV vypíše jeho objem, ohraničující kvádr, těžiště a momenty a Enter zápis do souboru odmítne."
sourceHash: "a0286a5d599e"
---

Příkaz HMOTV (MASSPROP) měří 3D tělesa a oblasti. Vyberte je a stiskněte Enter: zpráva se vypíše na příkazovém řádku, ve sloupcích AutoCADu, a pak se příkaz zeptá, zda ji zapsat do souboru. Výběr bez těles a oblastí vypíše <Message id="massPropNoneSelected" /> a příkaz skončí.

Tělesa se měří společně jako jedno těleso s hustotou 1, takže hmotnost se rovná objemu: hmotnost, objem, ohraničující kvádr, těžiště, momenty setrvačnosti, deviační momenty a poloměry setrvačnosti, vše vzhledem k aktuálnímu USS, a pak hlavní momenty vzhledem k těžišti s jejich směry. Tělesa, která se překrývají, se počítají dvakrát. Pro oblasti v rovině XY USS: plocha, obvod, ohraničující obdélník, těžiště, momenty a deviační moment, poloměry setrvačnosti a hlavní momenty; oblast mimo tuto rovinu dá jen plochu, obvod, ohraničující obdélník a těžiště. Nejprve oblasti, potom tělesa; oblasti mimo rovinu té první se vynechají a zpráva uvede jejich počet. Čísla se píší s přesností výkresu, nastavenou příkazem <Command id="UNITS" />, a jsou přesná: tělesa se integrují plochu po ploše. Příkaz HMOTV ve výkresu nic nemění; zadává se z klávesnice, jako v AutoCADu, jehož pás karet pro něj nemá tlačítko.

## Options

### Yes

U otázky na soubor, jejíž výchozí odpověď je <Keyword id="No" />: zapíše zprávu do souboru tak, jak ji zapisuje AutoCAD, řádek po řádku. V AutoCADu se místo vybírá v dialogu; v prohlížeči je tím dialogem stažení souboru a soubor nese název výkresu s příponou `.mpr`.

## Missing

Jednotky za každým číslem při architektonických nebo inženýrských jednotkách (`sq in`, `cu in`, `lb`), které AutoCAD píše: zde za číslem žádná jednotka není. Volba názvu souboru a dotaz před přepsáním existujícího. Daleko od počátku zapisuje AutoCAD velká čísla v exponenciálním tvaru a ztrácí číslice a jeho poslední číslice se může lišit jeho vlastním zaokrouhlením: čísla MellowCAD jsou přesná. U tělesa se dvěma stejnými hlavními momenty dvojice směrů, kterou zvolí zaokrouhlení AutoCADu.

## Questions

### Jak zjistit objem 3D tělesa v AutoCADu?

Spusťte příkaz HMOTV, vyberte těleso a stiskněte Enter: objem je na druhém řádku zprávy. Kvádr 60 × 40 × 25 z ukázky dá 60000. Na otázku na soubor stiskněte Enter a příkaz skončí.

### Jak najít těžiště tvaru?

Převeďte ho na oblast příkazem <Command id="REGION" /> nebo na těleso, pak spusťte příkaz HMOTV a vyberte ho: Těžiště udává jeho X a Y, u tělesa i Z, v aktuálním USS.

### Proč HMOTV hlásí, že nejsou vybrána žádná tělesa ani oblasti?

To, co jste vybrali, není ani jedno: úsečky, křivky, kružnice a šrafy nemají fyzikální vlastnosti a blok, který obsahuje těleso, není těleso. Uzavřené tvary převeďte na oblasti příkazem <Command id="REGION" /> nebo na tělesa příkazem <Command id="EXTRUDE" />.

### Proč se hmotnost rovná objemu?

Příkaz HMOTV měří s hustotou 1, jako AutoCAD: tělesa tu nemají materiál. Skutečnou hmotnost dostanete, když objem vynásobíte hustotou materiálu.
