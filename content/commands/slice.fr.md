---
title: "Commande SECTION (SLICE) dans AutoCAD"
description: "Comment SECTION (SLICE, alias SE) d'AutoCAD coupe des solides 3D par un plan : deux points, 3points, un objet ou le SCU, puis le côté à garder. Essayez-le."
figure: "Un cylindre coupé par son axe avec deux points, la moitié du côté désigné gardée : vu du sud-est."
sourceHash: "07b1512fb042"
---

SECTION (SLICE) coupe des solides 3D par un plan et garde la partie située d'un côté, ou les deux parties sous forme de deux solides. Elle demande les solides à couper, jusqu'à Entrée : comme dans AutoCAD 2027, un jeu sélectionné avant la commande est abandonné et redemandé, et ce qui n'est pas un solide est ignoré. Puis le plan : par défaut, vous indiquez deux points, et il se dresse à la verticale en passant par eux, perpendiculaire au plan XY du SCU ; les options le donnent autrement. Enfin, un point du côté à garder, ou Entrée pour garder les deux.

Tous les solides du jeu sont coupés par le même plan. Un solide que le plan manque, ou ne fait que toucher sur une face, le long d'une arête ou en un sommet, reste tel qu'il était, et SECTION le dit. Un solide coupé n'est plus une boîte ni un cylindre, et n'a pas d'historique. Toute la commande est une seule étape d'annulation. La 3D de MellowCAD reste partielle : les solides existent, pas les surfaces ni les maillages.

## Options

### Object

Prend le plan d'un objet que vous sélectionnez : un cercle, une ellipse, un arc, une polyligne 2D ou une spline plane, un cercle incliné aussi. Une ligne, ou le solide lui-même, n'a pas de plan propre : la commande dit <Message id="unableToExtractPlane" /> et redemande. Entrée termine la commande.

### Surface

Demande une surface le long de laquelle couper. MellowCAD n'a pas encore de surfaces : une sélection dit donc <Message id="noSurfacesSelected" />, et Entrée termine la commande.

### Zaxis

Demande un point sur le plan, puis un point sur son axe Z, la droite qui lui est perpendiculaire. Les deux ne peuvent pas être le même point.

### View

Le plan parallèle à l'écran, passant par un point que vous indiquez ; Entrée prend 0,0,0.

### XY

Le plan XY du SCU, passant par un point que vous indiquez : un point situé en hauteur y donne une coupe horizontale. Entrée prend l'origine du SCU.

### YZ

Le plan YZ du SCU, passant par un point que vous indiquez ; Entrée prend l'origine du SCU.

### ZX

Le plan ZX du SCU, passant par un point que vous indiquez ; Entrée prend l'origine du SCU.

### 3points

Trois points sur le plan, qui peut alors s'incliner dans n'importe quelle direction. C'est l'option par défaut de la première invite : Entrée la choisit donc. Le deuxième point doit différer du premier, et le troisième ne doit pas se trouver sur la droite qui passe par eux.

### Both

À l'invite du côté, dont c'est l'option par défaut, qu'Entrée choisit donc : les deux parties sont gardées. Le solide en garde une, et l'autre devient un nouveau solide avec les mêmes calque, couleur, type de ligne et épaisseur de ligne, pas les courants. Un point garde au contraire le côté où il se trouve et supprime l'autre ; un point sur le plan est refusé.

## Missing

Les surfaces, comme plan de coupe et comme objets à couper, et les maillages. Une polyligne 3D plane comme objet du plan, qu'AutoCAD accepte. Un tore ou un solide de révolution coupé ni perpendiculairement à son axe ni le long de celui-ci, et les autres coupes pour lesquelles MellowCAD n'a pas encore de forme exacte, qui disent qu'une opération booléenne a échoué.

## Questions

### Comment s'appelle la commande SLICE en français ?

SECTION, avec l'alias `SE` : tapez-le, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_SLICE`. Ne la confondez pas avec <Command id="SECTION" />, dont le nom anglais est SECTION.

### Comment utiliser SECTION dans AutoCAD 3D ?

Sélectionnez le solide et appuyez sur Entrée. Désignez deux points par lesquels passe la coupe : le plan se dresse à la verticale en passant par eux. Désignez ensuite un point du côté à garder, ou appuyez sur Entrée pour garder les deux moitiés et écartez-en une avec <Command id="MOVE" />. Pour une coupe inclinée, choisissez <Keyword id="3points" /> et indiquez trois points du plan.

### SECTION peut-elle couper des lignes ou des objets 2D ?

Non : SECTION coupe des solides 3D et ignore les lignes, les régions et les blocs ; un jeu qui ne contient qu'eux termine la commande. Pour couper des objets 2D, utilisez <Command id="TRIM" /> ou <Command id="BREAK" />. Dans AutoCAD, SECTION coupe aussi les surfaces et les maillages, que MellowCAD n'a pas encore.

### Pourquoi SECTION dit que la section ne coupe pas le solide ?

Parce que le plan le manque, ou ne fait que le toucher sur une face, le long d'une arête ou en un sommet : ce solide reste entier. Vérifiez comment le plan a été donné. Avec deux points, il se dresse à la verticale : deux points sur la face supérieure d'un solide le coupent donc verticalement, pas à l'horizontale ; pour une coupe horizontale, choisissez <Keyword id="XY" /> et indiquez un point à la hauteur de la coupe.
