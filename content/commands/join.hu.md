---
title: "AutoCAD EGYBEFŰZ (JOIN) parancs"
metaTitle: "Vonalak vonallánccá fűzése: EGYBEFŰZ (JOIN)"
description: "Az AutoCAD EGYBEFŰZ (JOIN) parancsa: csatlakozó vonalak és ívek vonallánccá, egy egyenesbe eső vonalak eggyé, ívek körré, görbék spline-ná. Próbálja ki ingyen."
figure: "Három vonal egyetlen vonallánccá fűzve, amelyet a PÁRH parancs egyetlen kiválasztással teljes egészében követ."
sourceHash: "c4f26ede4174"
---

Az EGYBEFŰZ (JOIN) parancs több objektumból egyet készít. Jelölje ki őket, tetszőleges számban, és nyomja meg az Enter billentyűt: a végükkel egymáshoz csatlakozó vonalakból és ívekből egyetlen vonallánc lesz, amely a köztük lévő vonallánchoz fűződik, ha van ilyen; az egy egyenesbe eső vonalakból egyetlen vonal, bármekkora résen át; egy kör íveiből egyetlen ív, és ha bezárulnak, az EGYBEFŰZ megkérdezi, körré alakítsa-e, alapértelmezés szerint <Keyword id="Yes" />, vagy a <Keyword id="No" /> válasszal ív maradjon. Egy ellipszis elliptikus íveiből egyetlen ív lesz, és a csatlakozó görbék közötti spline vagy elliptikus ív spline-t eredményez. Ezután kiírja, mit hozott létre, és hány objektumot hagyott ki. A vonallánc csak a végeinél fűzhető, a zárt vonallánc pedig semmit sem fűz magához. Az egybefűzés egyetlen lépés, amely a Vissza paranccsal visszavonható.

## Options

### cLose

Ha egyedül kiválasztott elliptikus ív a forrás: teljes ellipszissé zárja.

## Missing

Az AutoCAD saját lépése arra az esetre, ha egyetlen, egyedül kiválasztott vonal, ív vagy vonallánc a forrás (`Válassza ki a forrással egyesíteni kívánt vonalakat:`): itt semmit sem fűz hozzá. Az egyedül kiválasztott zárt objektum, amelynél az AutoCAD újra kérdez. A csavarvonalak, a ferde síkban vagy fejjel lefelé fekvő objektumok, és a nem egy síkban fekvő vonalak, amelyeket az AutoCAD 3D vonallánccá fűz vagy vonallánccá lapít.

## Questions

### Mi az AutoCAD EGYBEFŰZ parancs angolul?

JOIN. A magyar AutoCAD-ben nincs rövidítése: írja be a teljes nevét, majd nyomja meg az Enter vagy a Szóköz billentyűt. A `_JOIN` az AutoCAD bármely nyelvi változatában működik; az angol `J` a magyar változatban nem működik.

### Hogyan lehet vonalakat vonallánccá fűzni az AutoCAD-ben?

Indítsa el az EGYBEFŰZ parancsot, jelölje ki a vonalakat, akár ablakkal, és nyomja meg az Enter billentyűt: a végükkel egymáshoz csatlakozók egyetlen vonallánccá válnak.

### Miért nem működik az EGYBEFŰZ parancs?

Az objektumoknak pontosan kell találkozniuk, végükkel egymáshoz, egy síkban: rés vagy keresztezés esetén kimaradnak, és az EGYBEFŰZ kiírja, hányat hagyott ki. Résen át csak az egy egyenesbe eső vonalak, az egy kör ívei és az egy ellipszis ívei fűzhetők össze. A zárt vonallánc semmit sem fűz magához.

### Hogyan lehet íveket körré fűzni?

Jelölje ki egy kör azon íveit, amelyek a teljes kört lefedik, és nyomja meg az Enter billentyűt: az EGYBEFŰZ megkérdezi, körré alakítsa-e őket, és az alapértelmezett <Keyword id="Yes" /> válasz ezt meg is teszi.
