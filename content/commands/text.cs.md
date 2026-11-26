---
title: "Příkaz TEXT v AutoCADu: jednořádkový text"
metaTitle: "Jednořádkový text v AutoCADu: příkaz TEXT"
description: "Jak funguje příkaz TEXT (zkratka DT) v AutoCADu: počáteční bod, výška a natočení, zarovnání a styl, jeden objekt na každý řádek. Vyzkoušejte zdarma."
figure: "Dva řádky jednořádkového textu vystředěné v obdélníku, se zarovnáním na střed uprostřed: každý řádek je samostatný objekt."
sourceHash: "7ff166aadef6"
---

Příkaz TEXT píše jednořádkový text. Zadáte počáteční bod, výšku a úhel natočení, pak napíšete řádek a stisknete Enter: řádek se stane samostatným objektem a další začne o řádek níž. Prázdný řádek příkaz ukončí. Kliknutí jinam ještě předtím začne další řádky v tomto bodě a Esc ponechá už zadané řádky a zahodí ten, který se právě píše. Odstavec zalamovaný na šířku, jako jeden objekt, vytvoří příkaz <Command id="MTEXT" />.

První řádek uvádí aktuální styl, výšku a zarovnání. Výška je společná s příkazy <Command id="MTEXT" /> a <Command id="ATTDEF" />, ukládá se do výkresu a další spuštění příkazu TEXT ji nabídne jako výchozí; u stylu s vlastní výškou se výzva k zadání výšky přeskočí. Enter u počátečního bodu pokračuje pod posledním řádkem, který TEXT napsal, aniž by se znovu ptal na výšku a úhel. <Command id="U" /> vrátí celé spuštění.

## Options

### Justify

Zeptá se, jak se text umístí vůči svému bodu: <Keyword id="Left" /> (výchozí), <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" />, nebo jeden z devíti bodů, nahoře, uprostřed a dole, vlevo, na středu a vpravo, jak je výzva vypisuje. Výzva k zadání počátečního bodu se pak ptá na bod, který zarovnání určuje: u <Keyword id="MC" /> na prostřední bod. Jako v AutoCADu se těchto devět bodů přijme i v první výzvě, i když tam nejsou vypsané, takže když tam zapíšete písmena <Keyword id="MC" />, příkaz se hned zeptá na prostřední bod. Zarovnání se uloží do výkresu pro další spuštění příkazu TEXT.

### Style

Zeptá se na název stylu textu, který se má stát aktuálním; Enter ponechá stávající. <Keyword id="?" /> vypíše styly výkresu; název, který výkres nemá, se odmítne a příkaz se zeptá znovu. Styly se vytvářejí v dialogu Styl textu, který otevře příkaz <Command id="STYLE" />.

## Missing

Zarovnání Zarovnat a Přizpůsobit. <Keyword id="?" /> možnosti <Keyword id="Style" /> vypíše všechny styly najednou, aniž by se ptal, které, a bez zastavení po každé stránce. Text se píše do pole dynamického zadání, ne s textovým kurzorem ve výkresu, a jeho znění nelze přepsat v paletě Vlastnosti, ve které chybějí i řádky Poznámky, Faktor šířky, Úhel sklonu, Vzhůru nohama a Pozpátku. Kliknutí uvnitř rámečku textu ho vybere i mimo písmena, zatímco AutoCAD nevybere nic.

## Questions

### Jak se jmenuje příkaz TEXT česky?

Také TEXT: česká verze AutoCADu jeho název nepřekládá. Zadejte `DT` a stiskněte Enter nebo mezerník; fungují i `DTEXT` a `TEXT` a `_TEXT` v AutoCADu v každém jazyce. `T` není zkratka příkazu TEXT: spouští <Command id="MTEXT" />, víceřádkový text, v české verzi stejně jako v anglické.

### Jak v AutoCADu zarovnat text?

Zvolte <Keyword id="Justify" /> v první výzvě nebo tam zapište písmena zarovnání a pak zadejte bod, který zarovnání určuje: <Keyword id="MC" /> umístí střed každého řádku do jeho bodu, jako popisek doprostřed obdélníku. Chcete-li, aby text vedl podél šikmé čáry, zadejte její úhel ve výzvě k zadání úhlu natočení.

### Jaký je rozdíl mezi příkazy TEXT a MTEXT?

Příkaz TEXT vytvoří jeden objekt na každý řádek, každý se posouvá, upravuje a zarovnává samostatně a nikdy se nezalamuje. Příkaz <Command id="MTEXT" /> vytvoří jeden objekt z odstavců zalamovaných na šířku rámečku, zarovnaný jako celek. Oba sdílejí výšku textu a styly textu.

### Jak v AutoCADu upravit text?

Poklepejte na něj: příkaz <Command id="TEXTEDIT" /> ho otevře k přepsání a pak se ptá na další text k úpravě, dokud nestisknete Esc. Výška a natočení textu jsou řádky palety Vlastnosti a jeho uzly ho posouvají.
