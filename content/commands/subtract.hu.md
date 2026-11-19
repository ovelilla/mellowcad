---
title: "AutoCAD KIVON (SUBTRACT) parancs"
description: "Így működik az AutoCAD KIVON (SUBTRACT, KV) parancsa: a megtartandó szilárdtestek vagy lemezek, Enter, majd a kivonandók, furatokkal is. Próbálja ki ingyen."
figure: "Téglatestből a KIVON paranccsal kivont henger, átmenő furat: előbb a téglatest kijelölve, aztán a henger."
sourceHash: "416991f5f4d1"
---

A KIVON (SUBTRACT) parancs 3D szilárdtesteket von ki más szilárdtestekből, vagy lemezeket az ugyanabban a síkban lévő lemezekből: a téglatestből kivont henger átmenő furatot hagy benne, a négyzetből kivont kör pedig lyukas négyzetet. Kétszer kérdez. Először ezt írja ki: <Message id="subtractFrom" />, és a megtartandó objektumokat kéri, amíg meg nem nyomja az Enter billentyűt; aztán ezt: <Message id="subtractWhat" />, és a kivonandó objektumokat kéri, ismét az Enter billentyűig. Ahogy az AutoCAD 2027-ben, az előre kijelölt halmazt elveti, és újra rákérdez.

Az első halmaz szilárdtestei egyetlen szilárdtestté válnak, a második halmaz minden szilárdtestét pedig kivonja belőle, és törli, akár átfedték, akár nem. A lemezeket síkonként kezeli: az első halmaz egy síkban lévő lemezeit egyesíti, a második halmaz ugyanabban a síkban lévő lemezeit kivonja belőlük és törli, az olyan síkban lévő lemezt pedig, amelyben az első halmaznak nincs lemeze, változatlanul hagyja. A szilárdtestként kapott eredmény összetett szilárdtest, már nem téglatest vagy henger, és nincsenek előzményei. Ha semmi sem marad, ezt írja ki: <Message id="nullSolid" /> vagy <Message id="nullRegion" />, és törli őket. Az egész parancs egyetlen visszavonási lépés. A MellowCAD 3D-je egyelőre részleges: szilárdtestek vannak, felületek és hálók még nincsenek.

## Missing

A felületek, amelyek itt nem léteznek. Az olyan ívelt lapok, amelyek olyan görbe mentén találkoznak, amelynek a MellowCAD-ben még nincs pontos alakja: hengerek, kúpok, gömbök vagy tóruszok, amelyeknek a tengelye se nem esik egybe, se nem párhuzamos (két henger keresztezheti is egymást); kúp, amelynek a tengelyén síkon vagy szilárdtesten kívül más van; tórusz vagy forgatott szilárdtest olyan síkkal, amely se nem merőleges a tengelyére, se nem megy át rajta, vagy a tengelyén kívül eső szilárdtesttel; kihúzott szilárdtest bármivel, ami nem sík, és nem a kihúzás irányában kihúzott lap. Ezeket a parancs elutasítja, és a szilárdtesteket változatlanul hagyja; ugyanígy azt a vágást is, amely érintőlegesen találkozik egy éllel, a majdnem, de nem pontosan egy felületen fekvő lapokat, és a vágás és egy él közötti nagyon vékony szeletet. A KIVON parancs után az Előző kijelölés azt írja ki, hogy nincs előző kijelölési halmaz, míg az AutoCAD a törölt objektumok közül egyet sem talál. Szilárdtest-előzmények nem készülnek (SOLIDHIST, SHOWHISTORY).

## Questions

### Mi az AutoCAD KIVON parancs angolul?

SUBTRACT. A magyar AutoCAD-ben a rövidítése `KV`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `SU` a magyar változatban nem működik; a teljes `KIVON` név igen, a `_SUBTRACT` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet egy szilárdtestet kivonni egy másikból?

Rajzolja meg a kivonandó szilárdtestet ott, ahol átfedi a másikat: furathoz például egy hengert a téglatesten át. Indítsa el a KIVON parancsot, jelölje ki a téglatestet, és nyomja meg az Enter billentyűt, majd jelölje ki a hengert, és nyomja meg újra az Enter billentyűt: a téglatestben furat marad, a henger eltűnik. A sorrend számít, mert amit elsőként jelöl ki, az marad meg.

### Miért nem működik a KIVON parancs?

Gyakran a sorrend a hiba: a megtartandó objektum az első halmazba kerül, a kivonandó a másodikba. Ha az első halmazban nincs szilárdtest vagy lemez, vagy a másodikban nincs olyan, amely ne lenne már benne az elsőben, ezt írja ki: <Message id="noSolidsOrRegionsSelected" />, és befejeződik; ha a második halmazból semmit sem lehet kivonni az elsőből, például szilárdtestet lemezből vagy más síkban lévő lemezt, ezt írja ki: <Message id="subtractNeedsTwo" />, és semmit sem változtat. A vonalakból és vonalláncokból előbb lemezt kell készíteni. Ha azt írja ki, hogy egy logikai művelet nem sikerült, a szilárdtestek olyan módon találkoznak, amelyet a MellowCAD még nem tud kiszámítani, és változatlanok maradnak.

### Hogyan lehet területet kivonni az AutoCAD-ben?

Ha egy 2D alakzatot ki szeretne vágni egy másikból, készítsen mindkettőből lemezt a <Command id="REGION" /> paranccsal, és a KIVON paranccsal vonja ki a belsőt a külsőből: a négyzetből, amelyből kört vont ki, egyetlen lyukas lemez lesz. Ha a rajz megváltoztatása nélkül mérne területet, a <Command id="AREA" /> parancs a <Keyword command="AREA" id="Subtract" /> opcióval vonja le a területeket a futó összegéből.

### Lehet-e kivonni az objektum törlése nélkül?

A KIVON parancs törli, amit kivon, ahogy az AutoCAD-ben is. Ha meg szeretné tartani, előbb másolja a helyére: <Command id="COPY" />, az objektum és Enter, 0,0 bázispont, majd ismét Enter, hogy 0,0-val, önmagára másolja. A KIVON parancs így a kettő közül csak az egyiket használja fel.
