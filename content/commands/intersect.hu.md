---
title: "AutoCAD KÖZÖSRÉSZ (INTERSECT) parancs"
metaTitle: "AutoCAD KÖZÖSRÉSZ: szilárdtestek közös része"
description: "Az AutoCAD KÖZÖSRÉSZ (INTERSECT, KO) parancsa: két vagy több 3D szilárdtestből vagy egy síkban fekvő lemezekből csak a közös rész marad, a többi törlődik."
figure: "Egy téglatest és egy belé nyúló gömb közös része: hat sík lappal határolt gömb, délkeletről nézve."
sourceHash: "c8ea61c0525d"
---

A KÖZÖSRÉSZ (INTERSECT) parancs csak azt tartja meg, ami két vagy több 3D szilárdtestben, illetve két vagy több egy síkban fekvő lemezben közös, a többit törli: egy téglatestből és egy belé nyúló gömbből sík lapokkal határolt gömb marad. Az Enter billentyűig kér objektumokat, ahogy az <Command id="UNION" /> parancs, és átugorja, ami sem szilárdtest, sem lemez. Ahogy az AutoCAD 2027-ben, a parancs előtt kijelölt objektumokat elveti, és újra kéri őket. A szilárdtesteket és a lemezeket külön dolgozza fel, a lemezeket síkonként.

Az elsőként kiválasztott objektum lesz az eredmény, a fóliájával és a színével, a többi törlődik; ablakkal, metszőablakkal vagy a MIND opcióval kijelölve a legújabb közülük. Az eredmény összetett szilárdtest, többé nem téglatest vagy gömb, és nincs előzménye. Ha az objektumokban nincs semmi közös, a válasz <Message id="nullSolid" /> vagy <Message id="nullRegion" />, és mindet törli, ahogy az AutoCAD is. A teljes parancs egyetlen visszavonási lépés. A MellowCAD-ben a 3D egyelőre csak részben érhető el: szilárdtestek vannak, felületek és hálók nincsenek.

## Missing

A felületek, amelyek itt nem léteznek. Olyan görbe lapok, amelyek egy olyan görbe mentén találkoznak, amelynek a MellowCAD-ben még nincs pontos alakja: hengerek, kúpok, gömbök vagy tóruszok, amelyek tengelyei sem nem esnek egybe, sem nem párhuzamosak, sem – két henger esetén – nem metszik egymást; kúp bármivel, ami nem sík vagy a tengelyén lévő szilárdtest; tórusz vagy megforgatott szilárdtest olyan síkkal, amely sem nem merőleges a tengelyére, sem nem megy át rajta, vagy a tengelyén kívüli szilárdtesttel; kihúzott szilárdtest bármivel, ami nem sík vagy nem a kihúzás irányában kihúzott lap. Ezeket a parancs azzal az üzenettel utasítja el, hogy egy logikai művelet nem sikerült, és a szilárdtesteket változatlanul hagyja; ugyanígy jár az élt érintőlegesen elérő vágás, a majdnem, de nem pontosan egy felületre eső lapok, és a vágás és egy él közötti nagyon vékony szelet. Az egy téglatest lapján fekvő henger egyesítése a helyes térfogatot adja, de eggyel kevesebb éllel és lappal, mint az AutoCAD-ben. A szilárdtest előzményei nem őrződnek meg (SOLIDHIST, SHOWHISTORY), és hogy Felfűz vagy Előző kijelöléskor melyik objektum marad meg, nincs ellenőrizve.

## Questions

### Mi az AutoCAD KÖZÖSRÉSZ parancs angolul?

INTERSECT. A magyar AutoCAD-ben a rövidítése `KO`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig az `_INTERSECT` is; az angol `IN` a magyar változatban nem működik.

### Mi a különbség az EGYESÍT, a KIVON és a KÖZÖSRÉSZ parancs között?

Mindhárom egyetlen objektumot készít 3D szilárdtestekből vagy egy síkban fekvő lemezekből. Az <Command id="UNION" /> parancs mindent megtart, amit bármelyikük lefed, a <Command id="SUBTRACT" /> parancs az első készletet tartja meg a második nélkül, a KÖZÖSRÉSZ pedig csak azt, ami mindegyikükben közös. Mindegyik egyetlen visszavonási lépés, és mindegyik törli a felhasznált objektumokat.

### Hogyan lehet vonalak metszéspontját megkeresni az AutoCAD-ben?

Nem a KÖZÖSRÉSZ paranccsal, amely szilárdtestekkel és lemezekkel dolgozik, a vonalakat pedig átugorja. Két vonal metszéspontjára a Metszéspont tárgyraszterrel lehet illeszkedni; a találkoztatásukhoz használja a <Command id="FILLET" /> parancsot 0 sugárral, a <Command id="TRIM" /> vagy az <Command id="EXTEND" /> parancsot.

### Miért törli a KÖZÖSRÉSZ parancs az objektumaimat?

Mert nincs bennük semmi közös: közös rész híján a válasz <Message id="nullSolid" />, lemezeknél <Message id="nullRegion" />, és törli őket, ahogy az AutoCAD is. A <Command id="U" /> parancs visszahozza őket. Egy szilárdtest és egy lemez, vagy két különböző síkban fekvő lemez közös részét a parancs egyáltalán nem képezi: a válasz <Message id="booleanNeedsTwo" />, és semmi sem változik.
