---
title: "Commande COUPE (SECTION) dans AutoCAD"
description: "Comment COUPE (SECTION, alias COU) d'AutoCAD crée la région où un plan coupe des solides 3D : 3points, Objet, axeZ, Vue, XY, YZ ou ZX. Essayez-le gratuitement."
figure: "Une pièce percée d'un trou, coupée par le plan ZX passant par le centre du trou : COUPE crée le profil, déplacé vers l'avant, deux rectangles séparés par le vide du trou."
sourceHash: "f1c01b76c810"
---

COUPE (SECTION) crée une coupe transversale de solides 3D : une région là où un plan coupe chacun d'eux, et les solides restent tels qu'ils étaient. Elle demande les solides, jusqu'à Entrée : comme dans AutoCAD 2027, un jeu sélectionné avant la commande est abandonné et redemandé, ce qui n'est pas un solide est ignoré, et un jeu qui n'en contient aucun affiche <Message id="noSolidsSelected" />. Puis le plan : par défaut, vous en indiquez trois points, et les options le donnent autrement, comme dans <Command id="SLICE" />.

Chaque solide que le plan coupe reçoit sa région, posée dans le plan : une pièce percée d'un trou donne le contour avec le vide du trou, un cylindre coupé le long de son axe un rectangle. Un plan sur l'une des faces d'un solide donne cette face. Un solide que le plan manque affiche <Message id="sectionMissedOne" />. Les régions prennent le calque et les propriétés courants, pas ceux du solide ; <Command id="MOVE" /> en sort une pour la voir, <Command id="AREA" /> et <Command id="MASSPROP" /> la mesurent, et <Command id="EXTRUDE" /> la transforme en solide. Toute la commande est une seule étape d'annulation. La 3D de MellowCAD ne connaît que les solides et reste partielle.

## Options

### Object

Prend le plan d'un objet que vous sélectionnez : un cercle, une ellipse, un arc, une spline 2D ou une polyligne 2D.

### Zaxis

Demande un point sur le plan, puis un point sur son axe Z, la droite qui lui est perpendiculaire.

### View

Le plan parallèle à l'écran, passant par un point que vous indiquez.

### XY

Le plan XY du SCU, passant par un point que vous indiquez : un point situé en hauteur y donne une coupe horizontale. Entrée prend l'origine du SCU.

### YZ

Le plan YZ du SCU, passant par un point que vous indiquez ; Entrée prend l'origine du SCU.

### ZX

Le plan ZX du SCU, passant par un point que vous indiquez ; Entrée prend l'origine du SCU. La coupe de la figure est ce plan passant par le centre du trou.

### 3points

Trois points sur le plan, qui peut alors s'incliner dans n'importe quelle direction. C'est l'option par défaut de la première invite : un point indiqué là est donc le premier des trois.

## Missing

Les surfaces et les maillages, que MellowCAD n'a pas. Une polyligne 3D plane comme objet du plan, qu'AutoCAD accepte. Les coupes pour lesquelles MellowCAD n'a pas encore de forme exacte, comme dans <Command id="SLICE" />, qui disent qu'une opération booléenne a échoué. PLANDECOUPE (SECTIONPLANE) et la coupe 3D, que le ruban d'AutoCAD propose à la place de COUPE : ici, COUPE se tape.

## Questions

### Comment faire une coupe d'un solide 3D dans AutoCAD ?

Lancez COUPE, sélectionnez le solide et appuyez sur Entrée, puis indiquez le plan : <Keyword id="ZX" /> et un point au milieu le coupent d'avant en arrière, <Keyword id="XY" /> et un point en hauteur le coupent à l'horizontale. La région se trouve à l'intérieur du solide : sortez-la avec <Command id="MOVE" /> pour la voir.

### Quelle est la différence entre COUPE et SECTION ?

<Command id="SLICE" /> coupe le solide en deux et garde une partie ou les deux. COUPE laisse le solide entier et dessine une région là où le plan le coupe. Attention aux noms : dans AutoCAD en français, SECTION est SLICE, et COUPE est SECTION.

### Quel est le raccourci de la commande COUPE ?

`COU`, puis Entrée ou la barre d'espace. Avec un trait de soulignement, le nom anglais fonctionne aussi : `_SECTION` ; sans lui, `SECTION` est le nom français de SLICE.

### Pourquoi COUPE dit que le plan de coupe ne passe pas par le solide ?

Le plan le manque : vérifiez comment vous l'avez donné. <Keyword id="XY" />, <Keyword id="YZ" /> et <Keyword id="ZX" /> sont les plans du SCU, donc un point à la mauvaise hauteur ou du mauvais côté place le plan en dehors du solide.
