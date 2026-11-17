---
title: "Příkaz USS (UCS) v AutoCADu: uživatelský souřadnicový systém"
metaTitle: "Příkaz USS (UCS) v AutoCADu"
description: "Jak příkaz USS (UCS) v AutoCADu posouvá a otáčí uživatelský souřadnicový systém: počátek a 3 body, Objekt, Pohled, X, Y, Z, ZOsa, Pojmenovaný, Globální."
figure: "Kvádr viděný od jihovýchodu: USS přesune počátek na jeho horní plochu a kružnice nakreslená potom v 30,20 leží na horní ploše, ne na zemi."
sourceHash: "8ac3b844fe16"
---

Příkaz USS (UCS) nastaví uživatelský souřadnicový systém: počátek a osy X a Y kdekoli v prostoru, takže jeho rovina XY může být skloněná. Zapsané souřadnice se v něm čtou a to, co kreslíte, leží v jeho rovině XY: po přesunu počátku na horní plochu kvádru leží kružnice se středem v `30,20` na horní ploše. Nejprve uvede název aktuálního USS – `*GLOBÁLNÍ*`, `*BEZ NÁZVU*` nebo název, pod kterým byl uložen – a pak se zeptá na nový počátek nebo možnost; Enter na tomto místě se vrátí ke globálnímu systému. Bod je počátkem, se svou souřadnicí Z, a bod bez Z leží v aktuální výšce. Pak se zeptá na bod na kladné ose X a bod v rovině XY, čtené v aktuálním USS: Enter u kteréhokoli z nich ponechá osy beze změny. Jeden bod USS posune, tři ho natočí libovolně.

Příkazy pak pracují v rovině XY systému USS: <Command id="LINE" /> a <Command id="CIRCLE" /> kreslí na ni a <Command id="BOX" /> a <Command id="EXTRUDE" /> z ní vytvářejí tělesa podél její osy Z. Každý objekt si při změně USS ponechá vlastní rovinu a <Command id="PLAN" /> ukáže aktuální USS přímo shora. USS se ukládá do výkresu a každé spuštění je jeden krok, který lze vrátit zpět. 3D v MellowCADu jsou jen tělesa, a zatím částečně.

## Options

### Face

Vypsaná tak, jak ji vypisuje AutoCAD 2027, k zarovnání USS s plochou tělesa. MellowCAD se na plochu zeptá, ale zatím se k ní nezarovná: žádný výběr ji nenajde.

### NAmed

Uložené systémy USS, podle názvu. <Keyword id="Save" /> uloží aktuální a před nahrazením už uloženého názvu se zeptá <Keyword id="Yes" /> nebo <Keyword id="No" />; <Keyword id="Restore" /> nastaví uložený jako aktuální, jeho název lze zapsat malými i velkými písmeny; <Keyword id="Delete" /> přijme názvy, s čárkami a zástupnými znaky; <Keyword id="?" /> je vypíše, každý s jeho počátkem a osami. Název smí obsahovat mezery, ale ne `<>/\":;|,=*?` ani obrácený apostrof: <Message id="invalidUcsName" />.

### OBject

Zarovná USS s objektem, který vyberete: úsečkou, kružnicí, obloukem, elipsou, křivkou, spline, textem, víceřádkovým textem, definicí atributu nebo referencí bloku. Počátek a osa X se umístí tam, kam je pro daný druh objektu umístí AutoCAD, a osa Z je vlastní normála objektu, takže USS leží v rovině objektu. Vybrat lze i objekt v zamknuté hladině. U šraf příkaz vypíše <Message id="ucsNoCoordinateSystem" /> a skončí, aniž by USS změnil.

### Previous

Vrátí se k předchozímu USS, až deset zpět v jedné relaci, včetně pojmenovaných a ortogonálních. Když už žádný nezbývá: <Message id="noPreviousUcs" />.

### View

Natočí rovinu XY kolmo ke směru pohledu, s osou X podél vodorovného okraje obrazovky, a počátek ponechá: text nakreslený potom leží ve 3D pohledu rovně na obrazovce.

### World

Návrat ke globálnímu souřadnicovému systému, který se nikdy nehýbe. Je to výchozí možnost první výzvy, takže ji zvolí Enter, a vrátí i výšku na 0.

### X

Otočí USS kolem jeho osy X: ve výchozím nastavení o 90 stupňů, o zapsaný úhel nebo o úhel určený bodem. Kladný úhel otáčí podle pravidla pravé ruky, takže 90 postaví rovinu XY svisle na původní ose X.

### Y

Otočí USS kolem jeho osy Y, stejně jako <Keyword id="X" /> kolem X.

### Z

Otočí USS kolem jeho osy Z, stejně jako <Keyword id="X" /> kolem X: 30 otočí X a Y o 30 stupňů proti směru hodinových ručiček, při pohledu shora.

### ZAxis

Zeptá se na nový počátek (Enter ponechá aktuální) a pak na bod na kladné ose Z: rovina XY se postaví kolmo k ní a její osa X zůstane vodorovná vzhledem k rovině XY globálního systému. Dva body, které splývají, vedou ke zprávě <Message id="pointsAreCoincident" />. Její možnost <Keyword id="Object" /> přijme úsečku, oblouk, otevřenou křivku nebo spline: počátek v konci nejbližším místu výběru a osa Z podél objektu, směřující od tohoto konce.

## Missing

<Keyword id="Face" />, která zarovná USS s plochou tělesa: zeptá se na ni, ale zatím žádnou nenajde. Použít a Řez, vypsané v první výzvě a zde odmítnuté, protože je jen jeden výřez a neexistují objekty řezu. Dialog USS (SPRUSS), uzly ikony a její místní nabídka a ikona, která ukazuje nový USS při jeho umisťování. Nitkový kříž, který se otáčí spolu s USS: zůstává na obrazovce rovně, dokud <Command id="PLAN" /> nevyrovná pohled s USS. UCSFOLLOW, UCSVP a dynamický USS. <Keyword id="OBject" /> u kóty a Skupina při výběru. Hloubka, kterou ortogonální USS zachovává. Pauza `Pokračujte stisknutím klávesy ENTER:` v dlouhém výpisu.

## Questions

### Jak v AutoCADu vrátit USS na globální systém?

Spusťte příkaz USS a stiskněte Enter: <Keyword id="World" /> je výchozí možnost. Chcete-li se na výkres znovu dívat přímo shora, spusťte <Command id="PLAN" /> a zvolte <Keyword command="PLAN" id="World" />.

### Jak v AutoCADu otočit USS?

Spusťte příkaz USS, zvolte <Keyword id="Z" /> a zapište úhel: `30` otočí X a Y o 30 stupňů proti směru hodinových ručiček. <Keyword id="X" /> a <Keyword id="Y" /> rovinu XY nakloní, ve výchozím nastavení o 90 stupňů.

### Jaký je rozdíl mezi USS a GSS?

Globální souřadnicový systém (GSS) se nikdy nehýbe; uživatelský souřadnicový systém (USS) je ten, který posouváte a otáčíte. Na začátku jsou stejné a příkaz USS uvede, že aktuální je `*GLOBÁLNÍ*`. Zapsané souřadnice se čtou v USS a to, co kreslíte, leží v jeho rovině XY.

### Jak kreslit na plochu 3D tělesa?

Přesuňte na ni USS. Na horní ploše kvádru stačí samotný počátek: USS, pak roh horní plochy, pak Enter, jako v ukázce. Na boku zadejte tři body: počátek v rohu, bod podél hrany pro X a ještě jeden na ploše pro Y. Pak kreslete: co nakreslíte, leží na ploše.
