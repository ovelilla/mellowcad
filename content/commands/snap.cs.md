---
title: "Režim kroku v AutoCADu: příkaz KROK (SNAP)"
description: "Krok v AutoCADu: příkaz KROK (SNAP) a F9 drží kurzor v bodech se zadanou roztečí; Různý nastaví X a Y zvlášť, je i polární krok. Vyzkoušejte zdarma."
figure: "KROK 10 se zapnutým rastrem, pak ÚSEČKA určovaná mimo body: každý bod padne do mřížky bodů a kurzor s ním."
sourceHash: "a1089484f2f1"
---

Režim kroku drží kurzor na mřížce bodů: každé určení bodu padne do nejbližšího z nich, takže při rozteči 10 dá kliknutí v 13,7 bod 10,10. Mřížka bodů patří aktuálnímu systému USS a vede od jeho počátku podél jeho os. F9 režim kroku zapíná a vypíná a vypíše `<Krok ano>` nebo `<Krok ne>`; totéž dělá jeho tlačítko na stavovém řádku. Zaokrouhlují se jen určené body: zapsaná souřadnice se převezme tak, jak byla zapsána, a uchopení objektu má před mřížkou bodů přednost. Rastr (F7) kreslí vlastní mřížku bodů a ukazuje ji bez ohledu na to, zda je krok zapnutý.

Příkaz KROK (SNAP) nastaví rozteč: zapište ji nebo zadejte dva body v této vzdálenosti a režim kroku se zapne s touto roztečí v X i Y. Enter ho zapne beze změny. Rozteč 0 nebo menší se odmítne zprávou <Message id="positiveNonzero" />. Zadaný s apostrofem, `'KROK`, funguje uvnitř jiného příkazu. Režim kroku a jeho rozteč se ukládají do výkresu a příkaz <Command id="U" /> nastavení příkazem KROK vrátí.

Nabídka Krok na stavovém řádku umožní místo toho zvolit polární krok: podél dráhy polárního trasování se kurzor posouvá o POLARDIST, nebo, dokud je POLARDIST 0, o rozteč kroku v X.

## Options

### ON

Zapne režim kroku s aktuální roztečí, jako Enter.

### OFF

Vypne režim kroku; rozteč zůstane zachována.

### Aspect

Zeptá se na vodorovnou rozteč, pak na svislou, a zapne režim kroku: mřížka bodů je pak obdélníková, ne čtvercová. Výchozí možností výzvy je pak <Keyword id="Aspect" />, takže Enter se na ně zeptá znovu.

## Missing

Možnosti Styl (izometrický krok) a tYp (rastr nebo polární) ve výzvě: typ volí nabídka na stavovém řádku. Možnost Původní, skrytá možnost Otoč (SNAPANG) a SNAPBASE. Záporná hodnota POLARDIST, ze které polární krok AutoCADu bere absolutní hodnotu: −10 posouvá o 10.

## Questions

### Jak se jmenuje příkaz KROK anglicky?

SNAP. F9 zapíná a vypíná režim kroku. Rozteč nastavíte tak, že zadáte `KROK` a stisknete Enter nebo mezerník; zkratka `SN` z anglické verze v české nefunguje a KROK v české verzi zkratku nemá. `_SNAP` funguje v AutoCADu v každém jazyce.

### Jaký je rozdíl mezi krokem a uchopením objektu?

Režim kroku zaokrouhluje kurzor na mřížku bodů v prostoru. Uchopení objektů (F3) ho přitahuje k bodům na objektech: koncovým bodům, polovinám, středům. Fungují společně, a když bod najdou oba, vyhraje uchopení objektu.

### Proč se kurzor v AutoCADu pohybuje skoky?

Režim kroku je zapnutý: stiskněte F9 nebo tlačítko kroku na stavovém řádku a vypněte ho. Chcete-li jemnější kroky, nastavte příkazem KROK menší rozteč.

### Jak nastavit různou rozteč kroku v X a Y?

Spusťte příkaz KROK, zvolte <Keyword id="Aspect" /> a zadejte vodorovnou rozteč, pak svislou.

### Existuje izometrický krok?

Zatím ne: možnost Styl příkazu KROK, která natočí mřížku bodů pro izometrické kreslení, není k dispozici.
