---
title: "Příkaz VYTÁHNI (EXTRUDE) v AutoCADu"
description: "Jak v AutoCADu vytáhnout 2D profil do 3D tělesa příkazem VYTÁHNI (EXTRUDE, zkratka VYT): výška, směr, úhel zešikmení. Vyzkoušejte zdarma online."
figure: "Uzavřená křivka ve tvaru písmene L vytažená o 20 do tělesa, pak viděná od jihovýchodu ve vizuálním stylu Skrytý."
sourceHash: "53bfe3dd1e9c"
---

Příkaz VYTÁHNI (EXTRUDE) mění uzavřené 2D profily v 3D tělesa, každý vytažený kolmo ze své roviny do zadané výšky. Vyberte profily – kružnice, elipsy, uzavřené křivky nebo spline, oblasti – a stiskněte Enter, pak zadejte výšku nebo ji ukažte bodem; poslední výška je výchozí při dalším spuštění. Každý profil se stane samostatným tělesem v aktuální hladině a vymaže se, jak ve výchozím nastavení určuje DELOBJ. Celý příkaz je jeden krok, který lze vrátit zpět.

3D v MellowCADu jsou jen tělesa, a zatím částečně: otevřený profil, ze kterého AutoCAD vytvoří povrch, dostane <Message id="sweepRefusedType" /> a odebere se z výběru.

## Options

### MOde

Zeptá se na <Keyword id="SOlid" /> nebo <Keyword id="SUrface" />. <Keyword id="SOlid" /> je výchozí a jediný, který existuje: bez povrchových objektů se <Keyword id="SUrface" /> odmítne.

### Direction

Místo výšky určí směr a délku dva body: profily se vytáhnou podél této přímky, šikmo, pokud je šikmá. Směr ležící v rovině profilu dostane <Message id="directionParallel" /> a příkaz skončí.

### Path

V seznamu je, jako v AutoCADu, ale nefunguje: její volba se odmítne a otázka na výšku se zopakuje.

### Taper

Zeptá se na úhel mezi −90 a 90 stupni a pak znovu na výšku: kladný úhel těleso s výškou zužuje, záporný ho rozšiřuje. Kružnice, která se uzavře dřív, než dosáhne výšky, skončí v bodě, jako kužel; profil, který zešikmení nesnese, nic nevytvoří.

### Expression

Výška jako výraz: `2*3` je 6. Zatím jen aritmetika.

## Missing

Trajektorie, tažení po trajektorii. Režim povrchu a otevřené profily, ze kterých AutoCAD vytváří povrchy: povrchové objekty zatím nejsou. Plochy těles a oblasti, které kliknutí najde uvnitř objektů, jež přijímá příkaz <Command id="PRESSPULL" />. Zešikmení na elipse, spline nebo oblouku, který na další segment navazuje v rohu. Parametry a funkce možnosti Výraz. Příkaz <Command id="EXPLODE" /> vytaženého tělesa se zakřivenými boky, které AutoCAD rozloží na povrchy a oblasti. Jeho uzly a výška a úhel zešikmení upravované v paletě Vlastnosti.

## Questions

### Jak se jmenuje příkaz VYTÁHNI anglicky a jakou má zkratku?

EXTRUDE. V české verzi AutoCADu je jeho zkratka `VYT`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `EXT` spouští v české verzi jiný příkaz; `_EXTRUDE` funguje v AutoCADu v každém jazyce.

### Jak z 2D výkresu udělat 3D?

Nakreslete obrys jako jeden uzavřený objekt – uzavřenou křivku, kružnici nebo oblast –, spusťte příkaz VYTÁHNI, vyberte ho, stiskněte Enter a zadejte výšku. Shora vypadá těleso jako jeho obrys: otočte pohled kostkou ViewCube nebo příkazem <Command id="-VIEW" /> a možností <Keyword command="VIEW" id="SEiso" />, abyste ho viděli ve 3D.

### Proč příkaz VYTÁHNI nevytvoří těleso?

Profil je otevřený nebo protíná sám sebe. Úsečka, oblouk nebo otevřená křivka vytvoří v AutoCADu povrch a MellowCAD povrchy zatím nemá: příkaz VYTÁHNI vypíše <Message id="sweepRefusedType" /> a odebere je z výběru; profil, který protíná sám sebe, dostane <Message id="sweepSelfIntersecting" /> a také se odebere. Spojte kusy příkazem <Command id="JOIN" />, vytvořte z nich oblast příkazem <Command id="REGION" /> nebo do nich klikněte příkazem <Command id="PRESSPULL" />.

### Jak vytáhnout tvar s otvorem?

Udělejte z něj jednu oblast: příkaz <Command id="REGION" /> na obrys a otvor, pak příkazem <Command id="SUBTRACT" /> odečtěte oblast otvoru od oblasti obrysu. Vytáhněte tuto oblast a otvor projde tělesem. Nebo spusťte příkaz <Command id="PRESSPULL" /> a klikněte mezi obrys a otvor.

### Jak vytáhnout po trajektorii?

Zatím nelze: <Keyword id="Path" /> je v seznamu, ale odmítne se, a příkaz TAŽENÍ zatím není. <Keyword id="Direction" /> vytáhne podél přímky mezi dvěma body.
