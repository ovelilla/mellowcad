---
title: "Příkaz SPLINE v AutoCADu"
description: "Jak funguje příkaz SPLINE (zkratka SPL) v AutoCADu: křivka body vyhlazení nebo řídicími vrcholy, uzly, stupeň, tečny a Uzavři. Vyzkoušejte zdarma."
figure: "Spline s pěti body vyhlazení a pod ní spline s pěti řídicími vrcholy rozmístěnými stejně: první jimi prochází, druhá je k nim přitahována."
sourceHash: "1056b5067125"
---

Příkaz SPLINE nakreslí hladkou křivku jedním ze dvou způsobů: procházející body, které zadáte (<Keyword id="Fit" />, výchozí), nebo přitahovanou k řídicím vrcholům, které umístíte (<Keyword id="CV" />). Na začátku vypíše svá nastavení, `Způsob=Vyhlazení   Úhly=Tětiva`, a pak se zeptá na první bod; Enter na tomto místě se odmítne, jako v AutoCADu. Každý další bod spline ohne, její náhled sleduje kurzor a Enter ji ukončí. Body lze určit myší nebo uchopením, nebo je zapsat, zapsaná délka se odměří ve směru kurzoru a bod si zachová svou souřadnici Z, takže spline může stoupat v prostoru. Esc spline zahodí; celá spline je jeden krok, který vrátí <Command id="U" />. Tlačítka Interpolace spline a Řídicí vrcholy křivky spline na pásu karet spouštějí příkaz SPLINE s už zvoleným způsobem.

## Options

### Method

<Keyword id="Fit" /> nebo <Keyword id="CV" />. Spline s body vyhlazení prochází každým zadaným bodem; spline s řídicími vrcholy prochází jen prvním a posledním vrcholem a ostatní ji k sobě přitahují, takže je hladší a vede dál od nich. Způsob, stejně jako uzly a stupeň, zůstane zachován do konce relace.

### Knots

Jak spline s body vyhlazení rozloží své body podél křivky: <Keyword id="Chord" /> (výchozí, podle vzdálenosti mezi nimi), <Keyword id="Square root" /> z této vzdálenosti nebo <Keyword id="Uniform" />, všechny rozestupy stejné. Stejnými body proloží každá z těchto možností trochu jinou křivku.

### Degree

Stupeň spline s řídicími vrcholy, od 1 (přímé úsečky mezi vrcholy) do 10; 3, výchozí hodnota, je kubická křivka. Když je vrcholů méně, než stupeň vyžaduje, spline dostane nejvyšší možný.

### Object

Změní 2D nebo 3D křivku vyhlazenou možností <Keyword command="PEDIT" id="Spline" /> příkazu <Command id="PEDIT" /> ve spline s řídicími vrcholy se stejným průběhem a křivku vymaže, v jednom kroku. Všechno ostatní se odmítne zprávou <Message id="onlySplineFittedPolylines" />.

### start Tangency

Nabízí se po prvním bodě: směr, ve kterém z něj spline vychází, určený myší nebo zapsaný od tohoto bodu.

### end Tangency

Směr, ve kterém spline přichází do posledního bodu; pak spline skončí.

### Undo

Vrátí poslední bod, až k prvnímu.

### Close

Od třetího bodu: spojí konec se začátkem v jednu hladkou smyčku, bez rohu, a ukončí příkaz.

## Missing

Tolerance vyhlazení: spline s body vyhlazení vždy prochází přesně svými body a možnost toLerance se nenabízí. Během kreslení spline zatím není objektem, ke kterému lze uchopovat nebo trasovat, jako v AutoCADu. <Keyword id="Object" /> vždy vymaže křivku (DELOBJ). Hotová spline nemá ZOBRAZŘV (CVSHOW) ani SKRYJŘV (CVHIDE) ani nabídky uzlů pro přidání a odebrání bodu, paleta Vlastnosti upravuje její body, ale ne způsob, stupeň, uzly, váhy ani uzavření, a uchopení Geometrický střed, Kolmo a Tečna ji nenajdou. Příkaz ŠRAFY nenajde spline jako hranici a příkaz PROLNI (BLEND) zatím neexistuje.

## Questions

### Jak se jmenuje příkaz SPLINE česky?

Také SPLINE: česká verze AutoCADu jeho název nepřekládá. Zadejte `SPLINE` nebo zkratku `SPL` a stiskněte Enter nebo mezerník; zkratka `SPL` je stejná jako v anglické verzi. `_SPLINE` funguje v AutoCADu v každém jazyce.

### Jaký je rozdíl mezi spline s body vyhlazení a s řídicími vrcholy?

Spline s body vyhlazení prochází body, na které kliknete, což se hodí pro křivku, která se jich musí dotknout. Spline s řídicími vrcholy tvarují její řídicí vrcholy, ke kterým se jen přibližuje, což se hodí pro plynulý, hladký tvar. Způsob zvolíte možností <Keyword id="Method" /> v první výzvě.

### Jak v AutoCADu převést spline na křivku?

Spusťte příkaz <Command id="PEDIT" /> a vyberte spline: příkaz vypíše <Message id="objectNotPolyline" /> a nabídne převod, pak se zeptá na přesnost od 0 do 99, výchozí 10. Křivka sleduje spline krátkými přímými segmenty, a to ve větším počtu než v AutoCADu.

### Jak převést křivku na spline?

Vyhlaďte křivku možností <Keyword command="PEDIT" id="Spline" /> příkazu <Command id="PEDIT" />, pak spusťte příkaz SPLINE a zvolte <Keyword id="Object" />: z křivky se stane spline se stejným průběhem.

### Lze v AutoCADu rozložit spline?

Ne: <Command id="EXPLODE" /> spline odmítne, stejně jako AutoCAD. Chcete-li ji rozdělit na části, nejprve ji příkazem <Command id="PEDIT" /> převeďte na křivku a tu pak rozložte na úsečky.
