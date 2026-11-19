---
title: "3D keringés az AutoCAD-ben: 3DKERINGÉS (3DORBIT) parancs"
metaTitle: "3D keringés az AutoCAD-ben: 3DKERINGÉS, 3DO"
description: "3D keringés az AutoCAD-ben a 3DKERINGÉS (3DORBIT; 3DO, KERING) paranccsal: húzással, Shifttel és a görgővel, a kilépés és vissza felülnézetbe. Ingyen, online."
figure: "Egy téglatest először felülnézetben: 3DKERINGÉS, húzás oldalra és lefelé, majd Enter, és a téglatest felülről, az elülső sarka felől látszik."
sourceHash: "66fc1859c8fd"
---

A 3DKERINGÉS (3DORBIT) parancs húzás közben körbeforgatja a nézetet a rajz körül; a rajzban semmi sem mozdul és semmi sem változik. Az oldalirányú húzás a világ Z tengelye körül forgatja a kamerát, a fel-le húzás emeli vagy süllyeszti, mindezt a képernyő közepe alatt lévő rajzrész körül, párhuzamos vetítésben. Indításkor kiírja, hogyan lehet kilépni belőle: amíg fut, csak keringeni lehet, és az Enter vagy az Esc befejezi, akár volt húzás, akár nem.

A Shift és a görgőgomb lenyomva tartásával bárhonnan lehet keringeni, akár egy másik parancson belül is, és a navigációs sáv Keringés gombja is elindítja. Aposztróffal beírva, `'3DKERINGÉS` alakban, egy másik parancson belül is működik, és az a parancs utána folytatódik. Minden húzás egy lépés a <Command id="ZOOM" /> parancs <Keyword command="ZOOM" id="Previous" /> opciója számára, a teljes futás pedig egyetlen visszavonási lépés, így a <Command id="U" /> parancs visszaállítja a nézetet. Ha a szilárdtesteket testként, nem drótvázként szeretné látni, használja az <Command id="VSCURRENT" /> parancsot; a MellowCAD 3D-ben csak szilárdtesteket kezel, egyelőre részben.

## Missing

A jobb gombos helyi menü a vetítési módokkal, a látványstílusokkal és a többi navigációs móddal. Keringés csak a kijelölt objektumok körül. A perspektíva. A 3DSZKERINGÉS, a 3DFKERINGÉS és az AutoCAD többi 3D navigációs parancsa.

## Questions

### Mi a 3D keringés rövidítése az AutoCAD-ben?

`3DO`, `3DK` vagy `KERING`, majd Enter vagy Szóköz; angolul a parancs 3DORBIT, és a `_3DORBIT` az AutoCAD bármely nyelvén működik. Gépelés nélkül: tartsa lenyomva a Shift billentyűt és a görgőgombot, és húzza az egeret.

### Hogyan lehet egérrel keringeni az AutoCAD-ben?

Tartsa lenyomva a Shift billentyűt, nyomja le a görgőgombot, és húzza az egeret: oldalra húzva a modell körbefordul, fel-le húzva magasabbról vagy alacsonyabbról látja. Engedje el, és visszatér abba a parancsba, amelyben volt.

### Hogyan lehet kilépni a 3D keringésből?

Nyomja meg az Enter vagy az Esc billentyűt. A nézet ott marad, ahol hagyta.

### Hogyan lehet keringés után visszatérni felülnézetbe?

Futtassa az <Command id="PLAN" /> parancsot, és nyomja meg az Enter billentyűt, vagy a <Command id="-VIEW" /> parancsot a <Keyword command="VIEW" id="Top" /> opcióval, vagy kattintson a ViewCube tetejére. A <Command id="ZOOM" /> parancs <Keyword command="ZOOM" id="Previous" /> opciója húzásonként lép vissza.
