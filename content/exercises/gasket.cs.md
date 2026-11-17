---
title: "Cvičení v AutoCADu: těsnění"
metaTitle: "Cvičení v AutoCADu pro začátečníky: těsnění"
description: "Nakreslete těsnění v AutoCADu: deska se zaoblenými rohy, středový otvor, čtyři otvory zkopírované z jednoho, osy a kóty. Krok za krokem, zdarma online."
figure: "Těsnění 120 × 80 s kótami."
sourceHash: "dc5c0e2b45b8"
---

Nakreslete toto těsnění v milimetrech: deska 120 × 80 s rohy zaoblenými poloměrem 10, uprostřed středový otvor o průměru 40 a čtyři otvory o průměru 10, jejichž středy leží 12 od okrajů, k tomu osy středového otvoru a kóty. Vše se zadává z klávesnice: první bod příkazu leží tam, kam ho zadáte, a každý další se měří od předchozího. Obrys, osy a kóty jsou každé ve vlastní hladině.

## Steps

### Nakreslete obrys [#outline]

Nastavte hladinu Obrys jako aktuální v seznamu hladin. Příkaz <Command id="RECTANG" /> nakreslí desku najednou: zvolte možnost <Keyword command="RECTANG" id="Fillet" /> a zadejte poloměr, `10`, potom první roh, `0,0`, a druhý roh, `120,80`, měřený od prvního.

### Nakreslete středový otvor [#bore]

Příkaz <Command id="CIRCLE" /> ve středu desky, `60,40`: zvolte možnost <Keyword command="CIRCLE" id="Diameter" /> a zadejte `40`.

### Zkopírujte otvory [#holes]

Nakreslete jeden otvor, kružnici v bodě `12,12` s možností <Keyword command="CIRCLE" id="Diameter" /> `10`, a potom ji zkopírujte příkazem <Command id="COPY" />: vyberte kružnici, stiskněte Enter, jako základní bod zadejte její střed, `12,12`, a potom, kam od něj jde každá kopie: `96,0`, pak `96,56`, pak `0,56`. Enter kopírování ukončí.

### Nakreslete osy [#centreLines]

Nastavte jako aktuální hladinu Osy. Dvě úsečky nakreslené příkazem <Command id="LINE" /> se kříží ve středu otvoru a přesahují jeho okraj o 6: od `60,14` o `0,52` nahoru; od `34,40` o `52,0` vodorovně. Každou z nich ukončí Enter.

### Okótujte výkres [#dimensions]

Nastavte jako aktuální hladinu Kóty. Příkaz <Command id="DIMLINEAR" /> se zeptá na dva body a potom na umístění kótovací čáry: délka od `0,10` k bodu o `120,0` dál, umístěná dole; výška vpravo; rozteč otvorů, 96 a 56. Bod zadaný na jeho výzvy se nedotýká žádného objektu, proto každá z těchto kót vznikne jako neasociativní, což oznámí příkazový řádek. Příkazem <Command id="DIMDIAMETER" /> vyberete kružnici a umístíte kótu jejího průměru: nejprve středového otvoru, potom jednoho z malých otvorů.
