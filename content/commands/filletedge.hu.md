---
title: "AutoCAD ÉLLEKEREKÍT (FILLETEDGE) parancs"
metaTitle: "Élek lekerekítése: ÉLLEKEREKÍT (FILLETEDGE)"
description: "3D szilárdtest éleinek lekerekítése az AutoCAD ÉLLEKEREKÍT (FILLETEDGE) parancsával: élek, Lánc, Hurok, Sugár és a nyíl alakú fogó. Próbálja ki ingyen, online."
figure: "Délkeletről nézett téglatest: az ÉLLEKEREKÍT 8-as sugárral lekerekíti a jobb oldali két függőleges élét."
sourceHash: "403a055efb24"
---

Az ÉLLEKEREKÍT (FILLETEDGE) parancs egy 3D szilárdtest éleit kerekíti le. Kiírja az aktuális sugarat, majd éleket kér az Enter billentyűig: a kattintás a kurzor alatti élt választja ki, amely kiemelve jelenik meg, amikor a kurzor áthalad rajta, a beírt pont pedig azt az élt, amelyen átmegy. Az élek kiválasztása közben a szilárdtest úgy jelenik meg, ahogy majd lesz, a lekerekítésekkel együtt. Az Enter megszámolja az éleket, és kéri, hogy az elfogadáshoz nyomja meg ismét az Enter billentyűt, vagy módosítsa a sugarat; ez az Enter hozza létre a lekerekítéseket. Csak egyetlen szilárdtest élei választhatók: egy másikéra a válasz <Message id="filletMultipleBodies" />, a kétszer kiválasztott élre <Message id="edgeAlreadyPicked" />.

Két sík lap közötti egyenes élből negyedhenger lesz, egy furat vagy perem kör alakú éléből negyedtórusz; a sarokban találkozó lekerekítések összekapcsolódnak, hármuk egy gömbdarabbal. A sugár a rajzban mentődik, és legközelebb ismét felkínálja. A szilárdtest megtartja a fóliáját és a tulajdonságait, de elveszíti, amiből létrejött: a téglatest többé nem téglatest. A teljes parancs egyetlen visszavonási lépés. A MellowCAD-ben a 3D egyelőre csak szilárdtesteket jelent, és csak részben érhető el.

## Options

### Chain

A kiválasztott élt és minden hozzá érintőlegesen csatlakozó élt kiválasztja, egymás után: például egy olyan téglatest tetején körbefutó nyolc élt, amelynek függőleges élei már le vannak kerekítve. Ha egyik sem érintőleges, a válasz <Message id="noTangentChainEdges" />, és csak a kiválasztott élt veszi. Az <Keyword id="Edge" /> opció visszavált az egyes élekre.

### Loop

Egy lap körül futó összes élt kiválasztja: válasszon ki egy élt, majd fogadja el a megjelenített hurkot az <Keyword id="Accept" /> opcióval, vagy válassza a <Keyword id="Next" /> opciót annak a másik lapnak a hurkához, amelyhez az él tartozik.

### Radius

A sugarat kéri, beírva vagy két pont távolságaként; 0 vagy kisebb érték esetén a válasz <Message id="radiusTooSmall" />. A <Keyword id="Expression" /> opció képletként fogadja el. Az elfogadást kérő promptnál a megjelenített lekerekítések sugarát módosítja. Az első lekerekítés közepén lévő nyíl alakú fogóval húzással is beállítható: kattintson rá, mozgassa, kattintson; a <Keyword id="eXit" /> vagy az Esc változatlanul hagyja.

## Missing

Két különböző sugarú lekerekítés találkozása, és az ívelt lapon végződő lekerekítés. A mellette lévő lapnál szélesebb lekerekítés, amelyet az AutoCAD átgördít a következő élen: itt modellezési hibával meghiúsul. Az ívelt lap melletti egyenes él, a hengere tengelyétől eltérő kör alakú él, valamint a gömb, a tórusz, a kihúzott és a megforgatott szilárdtest bármely éle, amelyek ugyanígy meghiúsulnak. Néhány sarok, ahol a lekerekítések eltérő dőlésű éleken találkoznak. A nyíl alakú fogó az elsőn kívül bármely más élen, és a tőle a kurzorig húzódó vonal. A szilárdtest élének kiválasztása a <Command id="FILLET" /> paranccsal, amit az AutoCAD szintén lehetővé tesz. A lekerekítés hálóként való megjelenítése kiválasztás közben, és a felületek.

## Questions

### Hogyan lehet egy 3D szilárdtest élét lekerekíteni az AutoCAD-ben?

Indítsa el az ÉLLEKEREKÍT parancsot, válassza a <Keyword id="Radius" /> opciót, és írja be a sugarat, válassza ki az éleket, majd nyomja meg kétszer az Enter billentyűt: egyszer a kiválasztás befejezéséhez, egyszer az elfogadáshoz. A bemutatóban a `8` egy téglatest két élét kerekíti le.

### Hogyan lehet egy lap összes élét lekerekíteni?

Válassza a <Keyword id="Loop" /> opciót, és válassza ki a lap egyik élét, majd az <Keyword id="Accept" /> opciót, vagy a <Keyword id="Next" /> opciót, ha a megjelenített hurok a másik lapé. Az egymásba simán átmenő éleknél, például egy lekerekített téglatest tetején, a <Keyword id="Chain" /> opció mindet kiválasztja.

### Miért nem működik a LEKEREKÍT parancs 3D szilárdtesten?

Az AutoCAD <Command id="FILLET" /> parancsa a szilárdtest élét is lekerekíti, a MellowCAD-é viszont még nem: használja az ÉLLEKEREKÍT parancsot, letöréshez pedig az <Command id="CHAMFEREDGE" /> parancsot.

### Hogyan lehet módosítani a lekerekítés sugarát?

Válassza a <Keyword id="Radius" /> opciót a kiválasztás előtt vagy az elfogadást kérő promptnál, vagy húzza az első lekerekítés közepén lévő nyíl alakú fogót. Az utolsó sugarat legközelebb ismét felkínálja.
