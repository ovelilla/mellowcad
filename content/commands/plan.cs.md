---
title: "Příkaz PŮDORYS (PLAN) v AutoCADu: pohled shora na USS"
metaTitle: "Příkaz PŮDORYS (PLAN) v AutoCADu: pohled shora"
description: "Jak se v AutoCADu vrátit do půdorysného pohledu: příkaz PŮDORYS (PLAN) se dívá kolmo shora na aktuální USS, uložený USS nebo GSS. Vyzkoušejte online."
figure: "Stupňovité těleso viděné od jihozápadu s USS otočeným o 30 stupňů kolem Z: PŮDORYS a Enter se podívají kolmo shora na tento USS, jeho osa X doprava, takže těleso se zobrazí otočené."
sourceHash: "50d157803309"
---

Příkaz PŮDORYS (PLAN) se dívá kolmo shora na rovinu XY souřadnicového systému USS, s osou X směřující doprava: půdorysný pohled, jak jste kreslili. Zeptá se, který USS – aktuální, uložený, nebo globální – a Enter vezme aktuální. Pak zobrazí celý výkres a vypíše <Message id="regeneratingModel" />.

Nic ve výkresu se nepohne a USS zůstane, jak byl: příkaz PŮDORYS jen otočí pohled. Je to jeden krok vrácení, takže <Command id="U" /> vrátí pohled a <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> se vrátí k pohledu předtím. Je to cesta zpět do půdorysu po <Command id="3DORBIT" /> nebo po izometrickém pohledu <Command id="VIEW" />. 3D v MellowCAD jsou jen 3D tělesa, zatím částečně.

## Options

### Current ucs

Půdorys aktuálního USS, výchozí volba. Když <Command id="UCS" /> otočil USS o 30 stupňů kolem Z, výkres se zobrazí otočený o 30 stupňů ve směru hodinových ručiček, aby osa X USS mířila doprava; po USS na šikmé ploše se dívá kolmo na tuto plochu.

### Ucs

Půdorys USS uloženého volbou <Keyword command="UCS" id="NAmed" /> příkazu <Command id="UCS" />, jehož název zadáte. U názvu, který uložený není, vypíše, že takový USS nemůže najít, a zeptá se znovu; <Keyword id="?" /> vypíše uložené, jako příkaz USS, a také se zeptá znovu. Aktuální USS se nezmění.

### World

Půdorys globálního souřadnicového systému: výkres, jak byl na začátku, X doprava a Y nahoru, ať je aktuální USS jakýkoli; ten zůstane, jak byl.

## Missing

Když není nic nakresleno, příkaz PŮDORYS ponechá zoom, jak byl, kdežto AutoCAD zobrazí meze výkresu.

## Questions

### Jak se v AutoCADu vrátit do půdorysného pohledu?

Zadejte `PŮDORYS` a dvakrát stiskněte Enter: druhý Enter vybere <Keyword id="Current ucs" />. Pokud je USS otočený a chcete půdorys globálního systému, zvolte místo toho <Keyword id="World" />.

### Jaký příkaz dá půdorys USS?

PŮDORYS s volbou <Keyword id="Current ucs" />: dívá se shora na aktuální USS, s jeho osou X doprava. Nejprve otočte USS příkazem <Command id="UCS" />, pak spusťte PŮDORYS, dvakrát stiskněte Enter a na otočeném půdorysu kreslíte, jako by byl rovně.

### Proč je můj výkres v půdorysném pohledu otočený?

Pohled je půdorysem otočeného USS. Spusťte příkaz PŮDORYS a zvolte <Keyword id="World" />, abyste výkres opět viděli s globální osou X doprava; <Command id="UCS" /> a Enter vrátí na globální i USS.

### Mění příkaz PŮDORYS USS?

Ne. Jen otočí pohled; USS zůstane, jak byl. USS spolu s pohledem otáčejí ortogonální pohledy příkazu <Command id="VIEW" />.
