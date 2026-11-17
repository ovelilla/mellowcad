---
title: "Polární pole v AutoCADu: příkaz POLÁRPOLE (ARRAYPOLAR)"
metaTitle: "Polární (kruhové) pole v AutoCADu: POLÁRPOLE"
description: "Jak vytvořit polární (kruhové) pole v AutoCADu příkazem POLÁRPOLE (ARRAYPOLAR): střed, počet položek, úhel mezi nimi nebo vyplnění, otočení položek."
figure: "Otvor na přírubě rozmístěný kolem středu příruby: 8 položek po celém obvodu."
sourceHash: "efed541dea7f"
---

Příkaz POLÁRPOLE (ARRAYPOLAR) kopíruje výběr kolem středového bodu jako jeden objekt pole. Zeptá se na objekty, oznámí typ a to, zda je pole asociativní, zeptá se na středový bod a pole hned ukáže: 6 položek po celém obvodu, každá natočená podle toho, jak obíhá střed. Potom jedna výzva upravuje pole živě, dokud ho Enter nevytvoří, a to možnostmi nebo uzly náhledu, jako v AutoCADu. Vybrané objekty se stanou jeho první položkou.

## Options

### ASsociative

<Keyword id="Yes" />, výchozí, vytvoří jeden objekt pole, který později mění jeho uzly a paleta Vlastnosti; <Keyword id="No" /> vytvoří samostatné kopie vedle vybraných objektů. Odpověď platí po celou relaci, i pro příkazy OBDPOLE a KŘIVPOLE.

### Items

Počet položek, od 1 do 32767; úhel, který vyplňují, se zachová.

### Angle between

Úhel od jedné položky k další. Úhel vyplnění se stane odpovídajícím počtem těchto kroků, se zachovaným směrem, a celým obvodem, jakmile dosáhne 360°.

### Fill angle

Úhel, který položky vyplňují, kladný proti směru hodinových ručiček a záporný ve směru hodinových ručiček; počet položek se zachová. Po celém obvodu jsou položky od sebe vzdáleny o plný úhel dělený jejich počtem; na menším úhlu padne poslední položka na konec úhlu.

### ROTate items

<Keyword id="Yes" />, výchozí, natočí každou položku podle toho, jak obíhá střed; <Keyword id="No" /> ji jen posune, takže každá položka stojí stejně jako první.

### eXit

Vytvoří pole a ukončí příkaz, stejně jako Enter.

## Missing

Základní bod; Osa rotace, pro pole kolem osy v prostoru; Řádky a Úrovně, pro soustředné prstence položek a kopie naskládané podél Z; Výraz, který váže hodnotu na parametry výkresu. Nabídky uzlů pole (protažení poloměru, počet položek, úhel vyplnění…) a Ctrl k přepínání mezi nimi.

## Questions

### Jak vytvořit polární pole v AutoCADu?

Zadejte `POLÁRPOLE`, vyberte objekty, stiskněte Enter a určete středový bod; nebo zadejte `PO`, tedy <Command id="ARRAY" />, a po objektech zvolte <Keyword command="ARRAY" id="POlar" />. Potom zvolte <Keyword id="Items" />, nastavte jejich počet a stisknutím Enter pole vytvořte.

### Jak rozmístit objekty po části kružnice?

Zvolte <Keyword id="Fill angle" /> a zadejte úhel: 180 rozloží položky po polovině kružnice proti směru hodinových ručiček, -180 ve směru hodinových ručiček. Počet položek se zachová, první a poslední stojí na obou koncích úhlu.

### Jak zabránit otáčení položek pole?

Zvolte <Keyword id="ROTate items" /> a odpovězte <Keyword id="No" />: každá položka se posune kolem středu, aniž by se otočila.

### Jak změnit poloměr polárního pole?

Vyberte pole a přetáhněte jeho čtvercový uzel v základním bodě ke středu nebo od něj: vzdálenost od středu je nový poloměr. Nebo znovu zadejte Poloměr v paletě Vlastnosti.
