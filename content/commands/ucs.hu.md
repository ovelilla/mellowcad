---
title: "AutoCAD FKR (UCS) parancs: felhasználói koordináta-rendszer"
metaTitle: "AutoCAD FKR (UCS): koordináta-rendszer"
description: "Így mozgatja és forgatja az AutoCAD FKR (UCS) parancsa a felhasználói koordináta-rendszert: origó és 3 pont, Objektum, Nézet, X, Y, Z, ZTeng, Neve, Világ."
figure: "Téglatest délkeletről nézve: az FKR parancs a tetejére helyezi az origót, és az utána a 30,20 pontba rajzolt kör a felső lapon fekszik, nem a talajon."
sourceHash: "217908def9dc"
---

Az FKR (UCS) parancs a felhasználói koordináta-rendszert állítja be: egy origót és X, Y tengelyt a tér bármely pontján, így az XY síkja meg is dőlhet. A begépelt koordinátákat ebben értelmezi a program, és amit rajzol, az az XY síkjában fekszik: ha az origót egy téglatest tetejére helyezi, a `30,20` középpontú kör a tetején lesz. Először kiírja az aktuális FKR nevét – `*VILÁG*`, `*NÉVTELEN*` vagy azt a nevet, amelyen elmentették –, majd az új origót vagy egy opciót kér; ott az Enter visszatér a Világhoz. A megadott pont lesz az origó, a Z koordinátájával együtt, a Z nélküli pont pedig az aktuális szintmagasságon fekszik. Ezután egy pontot kér a pozitív X tengelyen és egy pontot az XY síkon, az aktuális FKR-ben értelmezve: bármelyiknél az Enter változatlanul hagyja a tengelyeket. Egy pont eltolja az FKR-t, három bármilyen irányba elfordítja.

A parancsok ezután az FKR XY síkjában dolgoznak: a <Command id="LINE" /> és a <Command id="CIRCLE" /> rá rajzol, a <Command id="BOX" /> és a <Command id="EXTRUDE" /> pedig belőle emelkedik a Z tengelye mentén. Minden objektum megtartja a saját síkját, amikor az FKR megváltozik, és az <Command id="PLAN" /> parancs egyenesen felülről néz az aktuális FKR-re. Az FKR a rajzzal együtt mentődik, és minden futtatás egyetlen visszavonási lépés. A MellowCAD 3D-je csak szilárdtestekből áll, és egyelőre részleges.

## Options

### Face

Az FKR-t egy szilárdtest lapjához igazítja: a kurzor alatti lap kiemelődik, az FKR ikon pedig megmutatja, hová kerülne az FKR, és egy kattintás ezt veszi át: az origó a kijelölt pontra kerül, a Z tengely a szilárdtestből kifelé mutat. Az X tengely a lapnak azon éle mentén fut, amely a legközelebb van ahhoz a helyhez, ahol a kurzor a lapra érkezett, vagy vízszintesen, ha az az él függőlegesen áll. Ezután a <Keyword id="Next" /> a nézési irányban mögötte lévő következő lapra lép (élen az él másik lapjára), az <Keyword id="Xflip" /> és az <Keyword id="Yflip" /> fél fordulattal elforgatja az FKR-t az X, illetve az Y tengelye körül, az Enter pedig elfogadja. Ha egy pont alatt nincs szilárdtest lapja, ez jelenik meg: <Message id="noSolidSurfaceOrMesh" />.

### NAmed

A név szerint mentett FKR-ek. A <Keyword id="Save" /> az aktuálisat menti, és <Keyword id="Yes" /> vagy <Keyword id="No" /> választ kér, mielőtt egy már mentett nevet felülírna; a <Keyword id="Restore" /> egy mentettet tesz aktuálissá, a neve kis- és nagybetűtől függetlenül gépelhető be; a <Keyword id="Delete" /> neveket fogad el, vesszővel elválasztva és helyettesítő karakterekkel; a <Keyword id="?" /> kilistázza őket, mindegyiket az origójával és a tengelyeivel. A név tartalmazhat szóközt, de nem tartalmazhatja a `<>/\":;|,=*?` karaktereket és a fordított aposztrófot: <Message id="invalidUcsName" />.

### OBject

Az FKR-t a kijelölt objektumhoz igazítja: vonalhoz, körhöz, ívhez, ellipszishez, vonallánchoz, spline-hoz, szöveghez, bekezdéses szöveghez, attribútumdefinícióhoz vagy blokkreferenciához. Az origó és az X tengely oda kerül, ahová az AutoCAD az adott fajtánál teszi, a Z pedig az objektum saját normálisa, így az FKR az objektum síkjában fekszik. A zárolt fólián lévő objektum is kijelölhető. A sraffozásra ez a válasz: <Message id="ucsNoCoordinateSystem" />, és az FKR parancs befejeződik, az FKR pedig olyan marad, amilyen volt.

### Previous

Visszatér az előző FKR-hez, egy munkamenetben legfeljebb tízet visszalépve, a mentetteket és az ortografikusakat is beleértve. Ha már nincs előző: <Message id="noPreviousUcs" />.

### View

Az XY síkot merőlegesre fordítja a nézési irányra, az X tengelyt a képernyő vízszintese mentén, az origót megtartva: az utána írt szöveg 3D nézetben is laposan, a képernyővel párhuzamosan olvasható.

### World

Vissza a világ koordináta-rendszerhez, amely soha nem mozdul. Ez az első prompt alapértéke, ezért ott az Enter ezt választja, és a szintmagasságot is visszaállítja 0-ra.

### X

Az FKR-t az X tengelye körül forgatja: alapértelmezés szerint 90 fokkal, vagy begépelt szöggel, vagy a szöget megadó ponttal. A pozitív szög a jobbkéz-szabály szerint forgat, így a 90 a régi X tengelyen függőlegesre állítja az XY síkot.

### Y

Az FKR-t az Y tengelye körül forgatja, ahogy az <Keyword id="X" /> az X körül.

### Z

Az FKR-t a Z tengelye körül forgatja, ahogy az <Keyword id="X" /> az X körül: a 30 felülről nézve 30 fokkal az óramutató járásával ellentétesen fordítja el az X és az Y tengelyt.

### ZAxis

Új origót kér – az Enter megtartja az aktuálisat –, majd egy pontot a pozitív Z tengelyen: az XY sík erre merőlegesen áll, az X tengelye vízszintes marad a világ XY síkjához képest. Ha a két pont egybeesik, ez jelenik meg: <Message id="pointsAreCoincident" />. Az <Keyword id="Object" /> opciója vonalat, ívet, nyitott vonalláncot vagy spline-t fogad el: az origó a kijelöléshez legközelebbi végponton lesz, a Z tengely pedig az objektum mentén, attól elfelé mutat.

## Missing

A <Keyword id="Face" /> felületeken és hálókon, amelyek a MellowCAD-ben nincsenek, valamint az Ablak és a Felfűz mód szilárdtesten. Az alKalmaz és a MEtszet opció, amelyek az első promptnál megjelennek, de itt el vannak utasítva, mivel csak egy nézetablak van, és nincsenek metszetobjektumok. Az FKR párbeszédpanel (FKRKEZ), az ikon fogói és a helyi menüje, valamint az, hogy az ikon az elhelyezés közben mutassa az új FKR-t. A szálkereszt elfordulása az FKR-rel: a képernyőn függőleges marad, amíg az <Command id="PLAN" /> parancs a nézetet hozzá nem igazítja. Az UCSFOLLOW, az UCSVP és a dinamikus FKR. Az <Keyword id="OBject" /> opció méretre, és a Csoport a kijelölésénél. Az ortografikus FKR által megtartott mélység. A szünet hosszú listánál: `A folytatáshoz nyomja meg az ENTER billentyűt:`.

## Questions

### Hogyan lehet visszaállítani az FKR-t a világ koordináta-rendszerre az AutoCAD-ben?

Indítsa el az FKR parancsot, és nyomja meg az Enter billentyűt: a <Keyword id="World" /> az alapérték. Ha ismét egyenesen felülről szeretne nézni a rajzra, indítsa el az <Command id="PLAN" /> parancsot, és válassza a <Keyword command="PLAN" id="World" /> opciót.

### Hogyan lehet elforgatni az FKR-t?

Indítsa el az FKR parancsot, válassza a <Keyword id="Z" /> opciót, és gépelje be a szöget: a `30` az óramutató járásával ellentétesen 30 fokkal fordítja el az X és az Y tengelyt. Az <Keyword id="X" /> és az <Keyword id="Y" /> felbillenti az XY síkot, alapértelmezés szerint 90 fokkal.

### Mi a különbség az FKR és a VKR között?

A világ koordináta-rendszer (VKR) soha nem mozdul; a felhasználói koordináta-rendszer (FKR) az, amelyet mozgat és forgat. Kezdetben a kettő ugyanaz, és az FKR parancs azt írja ki, hogy az aktuális neve `*VILÁG*`. A begépelt koordinátákat a program az FKR-ben értelmezi, és amit rajzol, az az XY síkjában fekszik.

### Hogyan lehet egy 3D szilárdtest lapjára rajzolni?

Helyezze rá az FKR-t. FKR, <Keyword id="Face" />, majd kattintson a lapra, és nyomja meg az Enter billentyűt: az FKR a lapra kerül, a Z tengely a szilárdtestből kifelé mutat. A téglatest tetejénél az origó áthelyezése is elég: FKR, majd a tető egyik sarka, végül Enter, ahogy a mintában. Ezután rajzoljon: amit rajzol, az a lapon fekszik.
