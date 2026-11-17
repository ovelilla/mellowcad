---
title: "Příkaz ANULOID (TORUS) v AutoCADu"
description: "Jak v AutoCADu nakreslit 3D anuloid příkazem ANULOID (TORUS, zkratka ANU): střed, poloměr anuloidu, poloměr roury, Průměr, 3B, 2B a Ttr."
figure: "Anuloid o poloměru 30 kolem roury o poloměru 8, viděný od jihovýchodu ve vizuálním stylu Koncepční."
sourceHash: "a19600f3e357"
---

Příkaz ANULOID (TORUS) nakreslí 3D těleso ve tvaru prstence, pneumatiky: zadejte střed, pak poloměr anuloidu, od středu do osy roury, a pak poloměr roury. Prstenec leží v rovině XY systému USS, ve výšce Z středu. Bod určený ve výzvě k zadání poloměru roury se měří od bodu prstence, toho, ve kterém byl zadán poloměr anuloidu. Poloměr anuloidu je společná výchozí hodnota základních těles a poloměr roury má vlastní výchozí hodnotu, kterou převezme Enter. Anuloid vznikne v aktuální hladině a Zpět ho odstraní v jednom kroku.

Záporný poloměr anuloidu se širší rourou dá těleso ve tvaru míče na ragby, se špičatými konci; prstenec užší než roura dá jablko. Ve stylech 2D drátový model a Skrytý se kreslí čarami kolem roury a kolem prstence, v počtu podle `ISOLINES`. <Command id="LIST" /> ukáže jeho polohu, normálu, poloměr anuloidu a poloměr roury a v paletě Vlastnosti lze zapsat oba poloměry. Jeho uzly ho posouvají a nastavují poloměr anuloidu i poloměr roury. Je to 3D těleso pro příkazy <Command id="UNION" />, <Command id="SUBTRACT" /> a zbytek 3D v MellowCAD, který zahrnuje jen 3D tělesa, zatím částečně.

## Options

### 3P

U středu: zeptá se na tři body a prstenec je kružnice, která jimi prochází, v jejich rovině.

### 2P

U středu: zeptá se na dva konce průměru prstence.

### Ttr

U středu: vyberte dvě úsečky, kružnice nebo oblouky s uchopením Tečna a zadejte poloměr: prstenec se dotýká obou, v jejich výšce.

### Diameter

U poloměru anuloidu: zeptá se místo toho na průměr anuloidu. U poloměru roury: zeptá se na průměr roury. Každá z těchto výzev nabídne dvojnásobek své výchozí hodnoty.

### 2Point

U poloměru roury: zeptá se na dva body a poloměr roury je vzdálenost mezi nimi.

## Missing

<Command id="EXPLODE" /> anuloidu, který AutoCAD změní v povrch: MellowCAD nemá povrchy, takže oznámí, že ho nemůže rozložit. Posun, otočení, změna měřítka a zrcadlení z aktivního uzlu a obrys, který v AutoCADu kreslí `DISPSILH`.

## Questions

### Jak se jmenuje příkaz ANULOID anglicky?

TORUS. V české verzi AutoCADu zadejte `ANULOID` nebo zkratku `ANU` a stiskněte Enter nebo mezerník; zkratka `TOR` z anglické verze v české nefunguje. Pak zadejte střed, poloměr anuloidu a poloměr roury: `0,0,0`, `30` a `8` nakreslí anuloid z ukázky. `_TORUS` funguje v AutoCADu v každém jazyce.

### Jaký je rozdíl mezi poloměrem anuloidu a poloměrem roury?

Poloměr anuloidu vede od středu anuloidu do osy roury; poloměr roury je poloměr samotné roury. Anuloid s vnějším průměrem 76 a rourou o tloušťce 16 má poloměr 30 a poloměr roury 8.

### Jak nakreslit anuloid ve tvaru míče na ragby?

Zadejte záporný poloměr a pak poloměr roury větší než jeho absolutní hodnota: `-5` a `8` vytvoří uzavřené těleso se špičatými konci na obou stranách. Poloměr roury, který není větší, příkaz odmítne a zeptá se znovu.

### Proč anuloid vypadá jako dvě kružnice?

Díváte se na něj shora, v půdorysu. Otočte pohled: klikněte na roh krychle ViewCube, použijte <Command id="-VIEW" /> s možností <Keyword command="VIEW" id="SEiso" /> nebo <Command id="3DORBIT" />. <Command id="VSCURRENT" /> s možností <Keyword command="VSCURRENT" id="Conceptual" /> ho vystínuje.
