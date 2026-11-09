---
title: "Commande ARETERACCORD (FILLETEDGE) dans AutoCAD"
description: "Comment ARETERACCORD (FILLETEDGE) d'AutoCAD en français arrondit les arêtes d'un solide 3D : Chaîne, Boucle, Rayon et la poignée en flèche. Essayez-le en ligne."
figure: "Une boîte vue du sud-est : ARETERACCORD avec un rayon de 8 arrondit ses deux arêtes verticales de droite."
sourceHash: "403a055efb24"
---

ARETERACCORD (FILLETEDGE) arrondit les arêtes d'un solide 3D. Elle indique le rayon courant, puis demande des arêtes, jusqu'à Entrée : un clic prend l'arête sous le curseur, mise en surbrillance à son passage, et un point tapé prend l'arête qui passe par lui. À mesure que les arêtes sont prises, le solide se dessine tel qu'il sera, les raccords en place. Entrée compte les arêtes et vous demande d'appuyer de nouveau sur Entrée pour accepter, ou de changer le rayon ; ce second appui sur Entrée crée les raccords. Les arêtes d'un seul solide : celle d'un autre dit <Message id="filletMultipleBodies" />, une arête prise deux fois <Message id="edgeAlreadyPicked" />.

Une arête droite entre deux faces planes devient un quart de cylindre, et l'arête ronde d'un trou ou d'un bord un quart de tore ; des raccords qui se rencontrent à un coin sont joints, trois d'entre eux par un morceau de sphère. Le rayon est enregistré dans le dessin et reproposé la fois suivante. Le solide garde son calque et ses propriétés, mais perd ce qui l'a créé : une boîte n'est plus une boîte. La commande entière est une seule étape d'annulation. La 3D de MellowCAD se limite aux solides, et reste partielle.

## Options

### Chain

Prend l'arête que vous sélectionnez et chaque arête qui lui est tangente, l'une après l'autre : les huit qui font le tour du dessus d'une pièce dont les arêtes verticales sont déjà arrondies. S'il n'y en a aucune de tangente, elle dit <Message id="noTangentChainEdges" /> et prend celle qui est sélectionnée. <Keyword id="Edge" /> revient aux arêtes une par une.

### Loop

Prend toutes les arêtes autour d'une face : sélectionnez une arête, puis choisissez <Keyword id="Accept" /> pour la boucle affichée, ou <Keyword id="Next" /> pour celle de l'autre face à laquelle appartient l'arête.

### Radius

Demande le rayon, tapé ou donné par la distance entre deux points ; 0 ou moins dit <Message id="radiusTooSmall" />. <Keyword id="Expression" /> le prend comme une formule. À l'invite d'acceptation, elle change le rayon des raccords affichés. La poignée en flèche au milieu du premier raccord le règle en la faisant glisser : cliquez dessus, déplacez, cliquez ; <Keyword id="eXit" /> ou Echap le laisse tel qu'il était.

## Missing

Des raccords de deux rayons qui se rencontrent, et un raccord qui se termine sur une face courbe. Un raccord plus large qu'une face voisine, qu'AutoCAD fait rouler par-dessus l'arête suivante : ici, il échoue sur une erreur de modélisation. Une arête droite à côté d'une face courbe, une arête ronde hors de l'axe de son cylindre, et toute arête d'une sphère, d'un tore, d'une extrusion ou d'un solide de révolution, qui échouent de la même façon. Certains coins où des raccords se rencontrent sur des arêtes de pentes différentes. La poignée en flèche sur toute arête autre que la première, et la ligne qui va d'elle au curseur. <Command id="FILLET" /> sélectionnant l'arête d'un solide, ce qu'AutoCAD permet aussi. Le raccord dessiné en maillage pendant la sélection, et les surfaces.

## Questions

### Comment raccorder une arête d'un solide 3D dans AutoCAD ?

Lancez ARETERACCORD, choisissez <Keyword id="Radius" /> et tapez-le, sélectionnez les arêtes, puis appuyez deux fois sur Entrée : une fois pour finir la sélection, une fois pour accepter. Le `8` de la figure arrondit deux arêtes d'une boîte.

### Comment raccorder toutes les arêtes d'une face ?

Choisissez <Keyword id="Loop" /> et sélectionnez une arête de la face, puis <Keyword id="Accept" />, ou <Keyword id="Next" /> si la boucle affichée est celle de l'autre face. Pour des arêtes qui se prolongent déjà l'une dans l'autre, autour du dessus d'une pièce arrondie, <Keyword id="Chain" /> les prend toutes.

### Pourquoi RACCORD ne fonctionne pas sur un solide 3D ?

Le <Command id="FILLET" /> d'AutoCAD arrondit aussi l'arête d'un solide, mais pas encore celui de MellowCAD : utilisez ARETERACCORD, et <Command id="CHAMFEREDGE" /> pour un chanfrein.

### Comment changer le rayon du raccord ?

Choisissez <Keyword id="Radius" /> avant de sélectionner ou à l'invite d'acceptation, ou faites glisser la poignée en flèche au milieu du premier raccord. Le dernier rayon est reproposé la fois suivante.
