---
title: "Vložení bloku v AutoCADu: příkaz VLOŽ (INSERT)"
metaTitle: "Vložení bloku v AutoCADu: příkaz VLOŽ (INSERT)"
description: "Jak v AutoCADu vložit blok příkazem VLOŽ (INSERT, zkratka VL): paleta Bloky, nebo -VLOŽ na příkazovém řádku, s měřítkem, natočením a atributy."
figure: "Židle převedená na blok, pak dvakrát vložená ke stolu: otočená o 180 po zadání bodu, pak o 90 možností Otoč před ním."
sourceHash: "ea41fdd8000f"
---

Příkaz VLOŽ (INSERT) umístí blok definovaný ve výkresu jako referenci: další jeho kopii, s vlastním bodem, měřítkem a natočením, kreslenou z jediné definice, kterou vytvořil příkaz <Command id="BLOCK" />. Stejně jako příkaz VLOŽ v AutoCADu 2027 otevře paletu Bloky, která ukazuje bloky výkresu; klikněte na jeden a příkazový řádek se zeptá na jeho bod vložení, s blokem taženým pod kurzorem; měřítko a natočení se berou z Možností palety, kde lze nastavit, aby se příkaz ptal i na ně. Paleta zůstane otevřená, takže vkládání bloku za blokem je jedno kliknutí na každý.

Příkaz <Command id="-INSERT" /> se na všechno ptá na příkazovém řádku: na název bloku (Enter přijme nabídnutý: naposledy vložený blok, jinak naposledy definovaný), bod vložení, pak měřítko X, měřítko Y (Enter přijme měřítko X) a úhel natočení. Záporné měřítko blok zrcadlí a nestejná měřítka ho roztáhnou: kružnice v něm se nakreslí jako elipsa. Blok s atributy se pak zeptá na každou hodnotu její výzvou a nabídne výchozí hodnotu. Objekty bloku v hladině 0 přeberou hladinu reference, ostatní si ponechají svou. Každé vložení je jeden krok, který lze vrátit zpět.

## Options

### ?

U názvu bloku: vypíše seznam bloků ve výkresu, jako příkaz <Command id="BLOCK" />, a skončí.

### Scale

U bodu vložení: zeptá se na jedno měřítko pro obě osy a pak znovu na bod, s blokem taženým v této velikosti. Po zadání bodu se na měřítka X a Y už neptá.

### Rotate

U bodu vložení: zeptá se na úhel, zadaný nebo mezi dvěma body, a pak znovu na bod, s blokem taženým už natočeným. Po zadání bodu se na natočení už neptá.

## Missing

Vložení jiného souboru výkresu: vložit lze jen bloky definované ve výkresu a název, který výkres neobsahuje, se odmítne. U bodu vložení možnosti Refbod, X, Y, Z, Rozložit a Opakovat; u měřítka X možnosti Obdélník a XYZ a bod vybraný jako protější roh. Při nestejných měřítkách X a Y se text nebo atribut nakreslí ve velikosti X místo roztažení a oblouk křivky zůstane obloukem; záporné X nenapíše text pozpátku. ATTDIA 1, dialog Upravit atributy při vkládání, a ATTREQ 0. Vlastnosti Poznámky, Jednotka bloku a Faktor jednotky v paletě Vlastnosti. DleBlok: objekt uvnitř bloku nemůže převzít vlastní barvu, typ čáry ani tloušťku čáry reference, jako v AutoCADu objekt nakreslený jako DleBlok.

## Questions

### Jak se jmenuje příkaz VLOŽ anglicky a jakou má zkratku?

INSERT. V české verzi AutoCADu je jeho zkratka `VL`: zadejte ji a stiskněte Enter nebo mezerník a otevře se paleta Bloky, stejně jako v AutoCADu 2027. `-VL` je příkaz <Command id="-INSERT" />, který se ptá na příkazovém řádku. Anglická zkratka `I` v české verzi nefunguje; `_INSERT` funguje v AutoCADu v každém jazyce.

### Jak vložit blok z příkazového řádku?

Zadejte `-VL` a název bloku, pak vyberte bod vložení a odpovězte na otázky na měřítko a natočení; Enter ponechá každou výchozí hodnotu. <Keyword id="?" /> u názvu vypíše seznam existujících bloků.

### Jak vložit blok v jiném měřítku?

Po bodu vložení zadejte měřítko X a u měřítka Y stiskněte Enter, aby byla stejná; nebo před bodem zvolte <Keyword id="Scale" /> a zadejte jedno měřítko pro obě osy. Záporné měřítko blok zrcadlí. V paletě Bloky jej zadejte do polí X a Y v Možnostech, nebo zaškrtněte Měřítko, aby se na něj příkaz ptal po bodu.

### Jak v AutoCADu vložit blok z jiného výkresu?

Ne z jeho souboru: příkaz VLOŽ umístí jen bloky definované ve výkresu. Zkopírujte místo toho jeho referenci (Ctrl+C), otevřete výkres, do kterého ji chcete, a vložte ji (Ctrl+V): její blok přijde s ní, pokud už ten výkres nemá blok téhož názvu, jehož definice se zachová.
