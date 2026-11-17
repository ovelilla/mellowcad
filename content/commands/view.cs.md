---
title: "Příkaz POHLED (VIEW) v AutoCADu"
description: "Jak v AutoCADu otočit pohled příkazem POHLED (VIEW, -POHLED): šest pravoúhlých pohledů a čtyři izometrické a USS, který nastaví každý pravoúhlý."
figure: "Kvádr se stupněm nakreslený v půdorysu: -POHLED a JZ iso, a je vidět od jihozápadu a shora, ve vizuálním stylu Skrytý."
sourceHash: "261c8657f5f7"
---

Příkaz POHLED (VIEW) nastaví pohled na jeden z deseti předdefinovaných pohledů AutoCADu: šest pravoúhlých, které se dívají přímo na jednu stranu modelu, a čtyři izometrické, které se dívají shora od rohu. Ve výkresu se nic neposune. POHLED spustí <Command id="-VIEW" />, verzi pro příkazový řádek: jeho první výzva vypisuje možnost <Keyword id="Orthographic" />, která se pak zeptá na stranu, a výzva přijme i rovnou název pohledu, tak jak ho zadávají nabídky AutoCADu: <Command id="-VIEW" />, pak <Keyword id="SWiso" />. Každý pohled zobrazí celý výkres a vypíše <Message id="regeneratingModel" />.

Ovládací prvek pohledu v levém horním rohu výkresu vypisuje stejných deset pohledů a spouští <Command id="-VIEW" />, a na tyto pohledy natáčejí i stěny a rohy krychle ViewCube, které USS ponechají beze změny. Každé spuštění příkazu POHLED je jeden krok, který lze vrátit zpět, takže <Command id="U" /> vrátí pohled i s USS, který nastavil. Zadaný s apostrofem uvnitř jiného příkazu odmítne se zprávou <Message id="requiresRegen" />. 3D v MellowCAD jsou jen 3D tělesa, zatím částečně.

## Options

### Orthographic

Zeptá se, na kterou stranu se dívat, ve výchozím nastavení <Keyword id="Top" />, takže Enter dá půdorys: <Keyword id="Top" />, <Keyword id="Bottom" />, <Keyword id="Front" />, <Keyword id="BAck" />, <Keyword id="Left" /> nebo <Keyword id="Right" />. Každý je postavený rovně: <Keyword id="Top" /> ukazuje X doprava a Y nahoru, <Keyword id="Front" /> X doprava a Z nahoru a <Keyword id="Bottom" />, viděný zespodu, X doleva. Každá strana zapsaná v první výzvě funguje i bez této možnosti.

Každý také natočí USS čelem k vám, od os globálního systému bez ohledu na předchozí USS, s počátkem v `0,0,0`, jako to dělá pravoúhlá možnost příkazu <Command id="UCS" />: po pohledu zepředu je rovinou XY přední strana, takže to, co kreslíte, leží na obrazovce rovně, a USS se jmenuje `*PŘEDNÍ*`. Po pohledu shora má osy globálního systému a jmenuje se `*HORNÍ*`.

### SWiso

Jihozápadní izometrie: dívá se shora od rohu vpředu vlevo a vidí přední stranu, levý bok a horní plochu. USS zůstane beze změny. Je to pohled z ukázky.

### SEiso

Jihovýchodní izometrie: dívá se shora od rohu vpředu vpravo a vidí přední stranu, pravý bok a horní plochu. USS zůstane beze změny.

### NEiso

Severovýchodní izometrie: dívá se shora od rohu vzadu vpravo a vidí zadní stranu, pravý bok a horní plochu. USS zůstane beze změny.

### NWiso

Severozápadní izometrie: dívá se shora od rohu vzadu vlevo a vidí zadní stranu, levý bok a horní plochu. USS zůstane beze změny.

## Missing

Pojmenované pohledy: <Keyword id="Orthographic" /> je jediná možnost, kterou první výzva vypisuje, zatímco v AutoCADu jsou na seznamu i `?`, odsTraň, oBnov, ULož, Nastavení a Okno, a název zapsaný na tomto místě se odmítne. Správce zobrazení, který v AutoCADu otevře příkaz POHLED. Když není nic nakreslené, pohled ponechá zvětšení, zatímco AutoCAD zobrazí meze výkresu. UCSORTHO a UCSBASE jako proměnné: pravoúhlý pohled vždy zarovná USS, od os globálního systému. Zarovnaný USS v seznamu <Keyword command="UCS" id="Previous" /> příkazu <Command id="UCS" />.

## Questions

### Jak v AutoCADu získat izometrický pohled?

Zadejte <Command id="-VIEW" />, pak <Keyword id="SWiso" /> pro jihozápadní izometrii; <Keyword id="SEiso" />, <Keyword id="NEiso" /> a <Keyword id="NWiso" /> dají zbylé tři rohy. Nebo zvolte JZ iso v ovládacím prvku pohledu vlevo nahoře, nebo klikněte na horní roh krychle ViewCube. <Command id="VSCURRENT" /> s možností <Keyword command="VSCURRENT" id="Hidden" /> skryje hrany vzadu.

### Jakým příkazem získat pohled shora?

<Command id="-VIEW" />, pak <Keyword id="Top" />, který také nastaví USS na osy globálního systému. <Command id="PLAN" /> místo toho ukáže shora aktuální USS a ponechá ho beze změny.

### Proč se po pohledu zepředu změnil USS?

Pravoúhlý pohled natočí USS čelem k vám, aby to, co kreslíte, leželo na obrazovce. <Command id="UCS" /> a Enter se vrátí ke globálnímu systému; <Command id="U" /> vrátí pohled spolu s jeho USS.

### Je izometrický pohled totéž co izometrický výkres?

Ne. Izometrický pohled se dívá na 3D model od rohu. Izometrický výkres je 2D, kreslený v izometrických rovinách s izometrickým stylem příkazu KROK, který MellowCAD zatím nemá.

### Kde je Správce zobrazení?

POHLED spustí <Command id="-VIEW" /> v příkazovém řádku: Správce zobrazení zde není a pojmenované pohledy (ULož, oBnov) zatím také ne.
