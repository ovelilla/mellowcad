---
title: "Uchopení objektu v AutoCADu: příkaz -UCHOP (-OSNAP)"
metaTitle: "Uchopení objektu v AutoCADu: -UCHOP a F3"
description: "Uchopení objektů v AutoCADu: -UCHOP (-OSNAP) nastaví průběžné režimy, F3 je zapne a vypne a KON, POL nebo Shift + pravé tlačítko vynutí jeden. Zdarma online."
figure: "-UCHOP nastaví průběžné režimy Polovina a Střed; ÚSEČKA pak vede z poloviny hrany do středu kružnice a horní hrana ukazuje značku Polovina."
sourceHash: "627cd26c12df"
---

Uchopení objektu umístí vybraný bod přesně do bodu objektu: do koncového bodu, do poloviny, do středu. Je-li uchopení objektu zapnuté, kurzor u takového bodu ukáže jeho zelenou značku a v místní nápovědě jeho název; kliknutí pak padne do tohoto bodu, ne tam, kde je kurzor. Průběžné režimy uchopení platí při každé výzvě k zadání bodu: zpočátku Koncový bod, Střed, Průsečík a Protažení, jako v AutoCADu. F3 zapíná a vypíná uchopení objektu a vypíše `<Uchop ano>` nebo `<Uchop ne>`; totéž dělá tlačítko Uchopení objektů na stavovém řádku, jehož nabídka má pro každý režim zaškrtávací políčko. Je-li pod kurzorem několik bodů uchopení, vyhraje nejbližší a klávesa Tab prochází ostatní. Režim Orto, polární trasování ani krok uchopený bod nikdy neposunou.

Příkaz -UCHOP (-OSNAP) nastaví průběžné režimy na příkazovém řádku. Vypíše režimy, které právě platí, a pak požádá o seznam režimů: každý velkými písmeny svého názvu, oddělené čárkami, jako `KON,POL,STŘ`, nebo `_END,_MID` v AutoCADu v jakémkoli jazyce. Seznam nahradí průběžnou sadu a zapne uchopení objektu; <Keyword id="NONe" />, <Keyword id="OFF" /> nebo samotný Enter ji vyprázdní. Na režim, který nezná, odpoví <Message id="invalidOsnapModes" /> a zeptá se znovu. Zadaný s apostrofem, `'-UCHOP`, funguje uvnitř jiného příkazu. Průběžné režimy platí do opětovného načtení stránky, pak jsou to znovu čtyři režimy AutoCADu: jako v AutoCADu je výkres neukládá.

Pro jediný bod je můžete potlačit: na výzvu k zadání bodu zadejte velká písmena režimu, `POL` nebo `_MID`, nebo podržte Shift, klikněte pravým tlačítkem a vyberte režim z nabídky. Hledá se pak jen tento režim, ať platí cokoli, a jen pro tento bod; nenajde-li nic, bod odmítne a výzva se opakuje. Zadaný velkými písmeny vypne <Keyword id="NONe" /> uchopení pro jeden bod. Tatáž nabídka nabízí <Command id="FROM" />: základní bod, pak odsazení od něj, takže `@10,0` je 10 vpravo od něj.

## Options

### ENDpoint

Nejbližší konec úsečky, oblouku, segmentu křivky, eliptického oblouku nebo křivky spline: rohy obdélníku, vrcholy polygonu. Značka je čtverec.

### MIDpoint

Polovina délky úsečky, oblouku, segmentu křivky, eliptického oblouku nebo křivky spline. Trojúhelník.

### CENter

Střed kružnice, oblouku nebo obloukového segmentu křivky. Přejeďte kurzorem přes samotnou křivku: ve středu není co uchopit. Kružnice.

### NODe

Bodový objekt, jaké vytvářejí <Command id="POINT" />, <Command id="DIVIDE" /> a <Command id="MEASURE" />, ať mu <Command id="PTYPE" /> dá jakýkoli tvar. Zpočátku nepatří mezi průběžné režimy. Kružnice s křížkem.

### QUAdrant

Body kružnice nebo oblouku na 0°, 90°, 180° a 270°, podél os X a Y souřadného systému USS, a konce os elipsy. Kosočtverec.

### INTersection

Místo, kde se protínají dva objekty nebo kde dráha polárního trasování protíná objekt. Křížek.

### EXTension

Za koncem úsečky, oblouku nebo přímého segmentu křivky: přejeďte kurzorem přes konec a pak se vzdalujte podél přímky objektu. Od konce se ukáže čárkovaná dráha a zadaná vzdálenost se odměří podél ní. Plus.

### INSertion

Bod, ve kterém je vložen text, definice atributu nebo reference bloku.

### PERpendicular

Pata kolmice z posledního bodu na úsečku, i za jejími konci, na kružnici, oblouk nebo segment křivky. U prvního bodu příkazu <Command id="LINE" /> čeká na další bod: úsečka vychází z objektu kolmo k němu. Pravý úhel.

### TANgent

Bod kružnice nebo oblouku, kde se jí dotýká přímka z posledního bodu. U prvního bodu příkazu <Command id="LINE" /> čeká na další bod: úsečka vychází z křivky tečně k ní. Kružnice s čárkou.

### NEArest

Bod objektu nejbližší kurzoru. Přesýpací hodiny.

### APParent

Zdánlivý průsečík: místo, kde se dva objekty protínají v pohledu, ačkoli leží v různých výškách; kde se skutečně setkávají, je to jejich průsečík.

### PARallel

Podržte kurzor chvíli nad úsečkou a pak se pohybujte od posledního bodu v jejím směru: další bod drží dráha rovnoběžná s úsečkou.

### NONe

Žádné průběžné režimy: uchopení objektu nic nenajde, dokud znovu nenastavíte režim.

### OFF

Totéž co <Keyword id="NONe" />: průběžná sada se vyprázdní.

## Missing

Dialog Nastavení kreslení, který v AutoCADu otevírají UCHOP a UC: tady jsou to neznámé příkazy a režimy nastavuje nabídka stavového řádku. Geometrický střed, jako režim i v nabídkách. Uzel na definičních bodech kóty a na počátku jejího textu: tady najde jen bodové objekty. Polovina mezi 2 body, dočasný bod trasování a klávesy držené pro jednorázové uchopení (Shift + A, Shift + Q…). Průsečík, Kolmo a Tečna na elipsách, Kolmo a Tečna na křivkách spline a Protažení od konce obloukového segmentu křivky nebo se vzdáleností a úhlem v místní nápovědě. Kolmo nebo Tečna, které čekají na druhý bod na začátku jiného příkazu než <Command id="LINE" /> a <Command id="CIRCLE" />. Nastavení terče a značky, KURZOR a AUTOSNAP.

## Questions

### Co dělá příkaz UCHOP (OSNAP) v AutoCADu?

V AutoCADu příkaz UCHOP (`UC`; anglicky OSNAP, `OS`) otevře dialog Nastavení kreslení na kartě Uchopení objektu, kde se volí průběžné režimy. MellowCAD takový dialog nemá: zadejte `-UCHOP` nebo `-UC` a seznam režimů, nebo je zaškrtněte v nabídce tlačítka Uchopení objektů na stavovém řádku.

### Jak zapnout uchopení objektu v AutoCADu?

F3 zapíná a vypíná uchopení objektu, jako v AutoCADu; totéž dělá tlačítko Uchopení objektů na stavovém řádku. Shift + pravé tlačítko myši na výzvu k zadání bodu otevře nabídku jednorázových uchopení.

### Proč v AutoCADu nefunguje uchopení objektu?

Mohla ho vypnout klávesa F3: ukáže to jeho tlačítko na stavovém řádku. Nebo režim nepatří mezi průběžné: nastavte ho příkazem `-UCHOP` nebo v nabídce tlačítka. Kurzor se musí k bodu přiblížit zhruba na 10 pixelů a u středu být nad samotnou kružnicí nebo obloukem. Uchopení funguje jen tehdy, když příkaz žádá o bod.

### Jak uchopit bod jen jednou?

Na výzvu k zadání bodu zadejte velká písmena režimu, například `KON` nebo `TAN`, nebo ho vyberte z nabídky Shift + pravé tlačítko. Platí jen pro tento bod, ať tento režim patří mezi průběžné, nebo ne.

### Zůstává nastavení uchopení objektu uložené?

Do opětovného načtení stránky; pak jsou to znovu Koncový bod, Střed, Průsečík a Protažení. AutoCAD je ve výkresu také neukládá.
