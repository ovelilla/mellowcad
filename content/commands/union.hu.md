---
title: "AutoCAD EGYESÍT (UNION) parancs"
description: "Így működik az AutoCAD EGYESÍT (UNION, EG) parancsa: 3D szilárdtestek vagy egy síkban lévő lemezek egy objektummá, mit hagy ki, miért kér kettőt. Próbálja ki!"
figure: "Két egymást átfedő téglatest az EGYESÍT paranccsal egy szilárdtestté egyesítve: délkeletről nézve, takart vonalak nélkül."
sourceHash: "be43813a7dee"
---

Az EGYESÍT (UNION) parancs két vagy több 3D szilárdtestet egyetlen szilárdtestté egyesít, vagy két vagy több, egy síkban fekvő lemezt egyetlen lemezzé: ahol átfedik egymást, az egyszer számít, és a belső élek eltűnnek. Objektumokat kér, annyit, amennyit akar, és az Enter egyesíti őket. Ahogy az AutoCAD 2027-ben, az előre kijelölt halmazt elveti, és újra rákérdez, ami pedig se nem szilárdtest, se nem lemez, azt kihagyja. A szilárdtesteket és a lemezeket külön egyesíti: az összes szilárdtestet egybe, a lemezeket síkonként.

Az elsőként kijelölt objektumból lesz az eredmény, a fóliájával és a színével, a többit törli; ablakkal, metszőablakkal vagy a MIND kijelöléssel közülük a legújabb. Az eredmény összetett szilárdtest: már nem téglatest vagy henger, nincs története (a <Command id="LIST" /> parancs is ezt mutatja), és kijelölve egyetlen fogója van, amely egészben mozgatja. Az egymáshoz nem érő szilárdtestek egy kétrészes objektummá válnak. Az egész parancs egyetlen visszavonási lépés. A MellowCAD 3D-s része egyelőre részleges: szilárdtestek vannak, felületek és hálók még nincsenek.

## Missing

A felületek, amelyek itt nem léteznek. Az olyan görbe lapok, amelyek olyan görbe mentén találkoznak, amelynek a MellowCAD-ben még nincs pontos alakja: hengerek, kúpok, gömbök vagy tóruszok, amelyeknek a tengelye se nem esik egybe, se nem párhuzamos (két henger keresztezheti is egymást); kúp, amelynek a tengelyén síkon vagy szilárdtesten kívül más van; tórusz vagy forgatott szilárdtest olyan síkkal, amely se nem merőleges a tengelyére, se nem megy át rajta, vagy a tengelyén kívül eső szilárdtesttel; kihúzott szilárdtest bármivel, ami nem sík, és nem a kihúzás irányában kihúzott lap. Ezeket a parancs elutasítja, és a szilárdtesteket változatlanul hagyja; ugyanígy azt a vágást is, amely érintőlegesen találkozik egy éllel, a majdnem, de nem pontosan egy felületen fekvő lapokat, és a vágás és egy él közötti nagyon vékony szeletet. A téglatest lapja mentén fekvő henger a helyes térfogattal egyesül, de eggyel kevesebb éllel és lappal, mint az AutoCAD-ben. Szilárdtest-történet nem készül (SOLIDHIST, SHOWHISTORY).

## Questions

### Mi az AutoCAD EGYESÍT parancs angolul?

UNION. A magyar AutoCAD-ben írja be az `EGYESÍT` nevet vagy az `EG` rövidítést, és nyomja meg az Enter billentyűt vagy a szóközt; az `EGY` is működik, az angol változat `UNI` rövidítése viszont a magyarban nem. Az `_UNION` az AutoCAD bármely nyelvi változatában működik.

### Miért nem működik az EGYESÍT parancs?

Két szilárdtestre vagy két, azonos síkban fekvő lemezre van szüksége: kevesebbel ezt írja ki: <Message id="booleanNeedsTwo" />, és semmit sem változtat. A vonalak, ívek és vonalláncok még zártan sem lemezek: előbb készítsen belőlük lemezt a <Command id="REGION" /> paranccsal. Az EGYESÍT parancs előtt kijelölt objektumokat elveti, ahogy az AutoCAD 2027 is: a kérdésénél jelölje ki őket. Ha azt írja ki, hogy egy logikai művelet nem sikerült, a szilárdtestek olyan módon találkoznak, amelyet a MellowCAD még nem tud kiszámítani, és változatlanok maradnak.

### Hogyan lehet visszavonni az egyesítést?

A <Command id="U" /> paranccsal vagy a Ctrl+Z billentyűkombinációval közvetlenül utána: az egész parancs egy lépésben visszavonódik, az objektumok olyanok lesznek, amilyenek voltak. Később már nincs mit szétszedni, mert az egyesített szilárdtest nem őrzi meg a részeit. Az ellentétes művelet a <Command id="SUBTRACT" /> parancs, amely hozzáadás helyett kivonja a szilárdtesteket.

### Hogyan lehet lemezeket egyesíteni az EGYESÍT paranccsal?

Minden zárt alakzatból készítsen lemezt a <Command id="REGION" /> paranccsal, majd egyesítse őket az EGYESÍT paranccsal: az egyes síkok lemezei egyetlen lemezzé válnak, a közös oldalaik összeolvadnak. Az üreget körülzáró alakzatok lyukat hagynak, a különálló lemezek pedig egyetlen, külön darabokból álló lemezzé válnak. A síkjában egyedül álló lemez változatlan marad.
