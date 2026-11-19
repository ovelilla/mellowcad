---
title: "Odkazová čára v AutoCADu: příkaz ODKAZ (LEADER)"
description: "Jak nakreslit odkaz s textem v AutoCADu příkazem ODKAZ (LEADER, zkratka ODK): šipka, kotvička, možnosti formátu a rozdíl oproti příkazu MODKAZ (MLEADER)."
figure: "Otvor a jeho popis: ODKAZ od obvodu kružnice, dva body, pak dva řádky textu; poslední segment stoupá, takže ho s textem spojí kotvička."
sourceHash: "3e9e26bfe826"
---

Příkaz ODKAZ (LEADER) nakreslí čáru od šipky k poznámce. Určete počáteční bod, kde bude šipka, a pak tolik dalších bodů, kolik chcete; od druhého bodu nabízí výzva <Keyword id="Annotation" />, kterou vybere i Enter, <Keyword id="Format" /> a <Keyword id="Undo" />. Enter u prvních dvou bodů příkaz ukončí a nic nenakreslí. Potom zadávejte poznámku po řádcích, po každém Enter, a Enter na prázdném řádku ji dokončí: odkaz a jeho text, víceřádkový text, vzniknou společně jako jeden krok, v aktuální hladině, s aktuální barvou, typem čáry a tloušťkou čáry.

Výšku textu, jeho mezeru od čáry a jeho umístění určuje aktuální kótovací styl: za koncem odkazu, nebo před ním, když odkaz přichází zprava, a nad poslední čarou, která pokračuje pod textem. Když poslední segment stoupá o víc než 15° od vodorovné, přidá příkaz ODKAZ kotvičku: krátkou vodorovnou čáru dlouhou jako šipka, která končí v určeném bodě. Šipka je plná uzavřená a kreslí se, jen když je první segment aspoň dvakrát delší než ona.

Odkaz sleduje svůj text: posuňte, otočte nebo změňte měřítko textu a konec odkazu se posune s ním, kotvička se vypočítá znovu; vymažte text a odkaz zůstane, bez kotvičky. Odkaz a text zkopírované společně zůstanou dvojicí. Uzly odkazu jsou v jeho bodech; paleta Vlastnosti ukazuje jeho typ, velikost šipky, odsazení a polohu textu a jeho měřítko.

## Options

### Annotation

Ptá se na text, po řádcích. Enter na prvním řádku se místo toho zeptá na jiný druh poznámky: <Keyword id="Mtext" /> (výchozí) otevře textový editor na konci odkazu, kde Enter zalomí řádek a Ctrl+Enter nebo kliknutí mimo editor ho ukončí; <Keyword id="Copy" /> umístí na konec kopii vybraného víceřádkového textu, jednořádkového textu nebo reference bloku a cokoli jiného odmítne zprávou <Message id="leaderCopyRefused" />; <Keyword id="None" /> nakreslí jen samotný odkaz.

### Format

Nastaví, jak se odkaz kreslí, a vrátí se k bodům: <Keyword id="Spline" /> z něj udělá hladký spline procházející body, <Keyword id="STraight" /> opět přímé segmenty, <Keyword id="Arrow" /> vrátí šipku a <Keyword id="None" /> ji vynechá. Enter ponechá formát beze změny.

### Undo

Vrátí poslední bod a zeptá se na něj znovu. U druhého bodu není co vracet a oznámí to <Message id="invalidInputCapital" />.

## Missing

Poznámky Tolerance a Blok: MellowCAD nemá objekt geometrické tolerance a blok se z příkazu ODKAZ nevkládá, takže výzva možností nabízí jen <Keyword id="Copy" />, <Keyword id="None" /> a <Keyword id="Mtext" />. Jiné šipky než plná uzavřená a vlastní barva a tloušťka čáry odkazu z kótovacího stylu. RODKAZ (QLEADER) a MODKAZ (MLEADER), rychlý odkaz a multiodkaz, tu zatím nejsou: multiodkazy ze souboru DXF se otevřou a znovu uloží, ale žádný příkaz multiodkaz nevytvoří ani neupraví jeho odkazové čáry.

## Questions

### Jak se jmenuje příkaz ODKAZ anglicky?

LEADER. V českém AutoCADu je jeho zkratka `ODK`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `LEAD` v české verzi nefunguje; celý název `ODKAZ` funguje také a `_LEADER` v AutoCADu v jakémkoli jazyce.

### Jaký je rozdíl mezi příkazy ODKAZ a MODKAZ (MLEADER)?

ODKAZ je starší příkaz: odkazová čára a samostatný text, který čára sleduje. MODKAZ, který AutoCAD dnes doporučuje, vytvoří jeden objekt multiodkazu s vlastními styly a několika odkazovými čarami k jedné poznámce. MellowCAD má příkaz ODKAZ; otevírá a ukládá odkazy i multiodkazy souboru DXF, ale nemá příkaz MODKAZ, kterým by se multiodkaz vytvořil nebo upravil.

### Jak vytvořit odkaz s textem?

Spusťte příkaz ODKAZ, určete bod, na který má šipka ukazovat, pak místo pro text, stiskněte Enter a zadejte text po řádcích. Enter na prázdném řádku ho dokončí. Enter na prvním řádku místo toho nabídne jiné poznámky, mezi nimi textový editor.

### Jak změnit velikost šipky odkazu?

Vyberte odkaz a změňte Velikost šipky v paletě Vlastnosti, což platí jen pro tento odkaz; nebo změňte velikost šipky v kótovacím stylu, kterou sledují všechny odkazy s tímto stylem. Délka kotvičky se také řídí velikostí šipky.

### Proč odkaz nemá šipku?

Buď ji vynechala možnost <Keyword id="None" /> v možnosti <Keyword id="Format" />, nebo je první segment kratší než dvojnásobek velikosti šipky, kdy šipku nekreslí ani AutoCAD. Určete druhý bod dál od prvního nebo nastavte menší velikost šipky.
