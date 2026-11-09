---
title: "Commande PEDIT dans AutoCAD"
description: "Modifier une polyligne avec PEDIT (alias PE) d'AutoCAD en français : lignes en polyligne, Joindre, Largeur, lissage, Spline, sommets, Multiple. Essayez-le."
figure: "Trois lignes bout à bout : PEDIT transforme la première en polyligne, y joint les deux autres et lui donne une largeur de 2."
sourceHash: "bdc0bf10ac09"
---

PEDIT modifie une polyligne. Sélectionnez-en une à `Sélectionnez la polyligne ou [Multiple]:`, ou sélectionnez-la avant la commande ; un double-clic sur une polyligne lance aussi PEDIT sur elle. Sélectionnez plutôt une ligne, un arc ou une spline, et elle dit <Message id="objectNotPolyline" /> et demande s'il faut le transformer en polyligne, Oui par défaut : la nouvelle polyligne prend sa place et ses propriétés. Elle demande ensuite une option, encore et encore, chacune appliquée aussitôt, jusqu'à ce qu'Entrée la termine. Une polyligne 3D a une liste plus courte, sans largeur, sans lissage et sans génération du type de ligne, et son option spline est <Keyword id="Spline curve" />. Echap garde ce qui a été fait ; toute la modification est une seule étape que <Command id="U" /> annule.

## Options

### Multiple

Modifie plusieurs polylignes à la fois : sélectionnez-les, dites s'il faut convertir les lignes, arcs et splines qui s'y trouvent, puis chaque option s'applique à toutes. Son option Joindre demande une distance approximative et un <Keyword id="Jointype" /> : <Keyword id="Extend" /> ajuste ou prolonge les segments d'extrémité jusqu'à ce qu'ils se rejoignent, <Keyword id="Add" /> comble l'écart par un nouveau segment, <Keyword id="Both" /> prolonge là où c'est possible et ajoute là où ce ne l'est pas.

### Close

Ferme la polyligne par un segment de son dernier sommet au premier, un arc si le dernier segment est un arc. Sur une polyligne fermée, l'option est <Keyword id="Open" />, qui retire ce segment.

### Join

Ajoute les lignes, arcs et polylignes ouvertes qui touchent les extrémités de la polyligne, bout à bout, et dit combien de segments elle a ajoutés. On ne peut rien joindre à une polyligne fermée : <Message id="cannotJoinClosedPolyline" />.

### Width

Une seule largeur pour tous les segments, tapée ou mesurée par deux points ; 0 retire la largeur.

### Edit vertex

Place un X sur le premier sommet et demande quoi faire à cet endroit : <Keyword id="Next" /> et <Keyword id="Previous" /> déplacent le X, <Keyword id="Move" /> déplace le sommet, <Keyword id="Insert" /> en ajoute un après lui, <Keyword id="Break" /> et <Keyword id="Straighten" /> retiennent le sommet, vous amenez le X sur un autre, et <Keyword id="Go" /> coupe la polyligne entre les deux ou fait un seul segment droit de ce qui se trouve entre eux, <Keyword id="Width" /> règle les largeurs de début et de fin du segment suivant, <Keyword id="Tangent" /> donne au sommet une direction pour un lissage ultérieur, et <Keyword id="eXit" /> revient en arrière.

### Fit

Dessine une courbe lisse faite d'arcs qui passe par chaque sommet, tangents là où ils se rejoignent, comme le lissage d'AutoCAD les pose. Les sommets restent, et les modifier remodèle la courbe.

### Spline

Ajuste une B-spline à la polyligne, encadrée par ses sommets plutôt que passant par eux : quadratique ou cubique, selon SPLINETYPE, et aussi fine que le veut SPLINESEGS. Celle d'une polyligne 3D est <Keyword id="Spline curve" />. L'option Objet de <Command id="SPLINE" /> transforme une telle polyligne en vraie spline.

### Decurve

Retire la courbe lissée ou la spline : de nouveau des segments droits entre les sommets.

### Ltype gen

<Keyword id="ON" /> pose le type de ligne en un seul motif sur toute la polyligne, si bien qu'une polyligne en tirets aux segments courts montre encore ses tirets ; <Keyword id="OFF" />, par défaut, recommence le motif à chaque sommet.

### Reverse

Retourne la polyligne : ses sommets dans l'autre sens, et les arcs et les largeurs avec eux.

### Undo

Annule la dernière option de cette exécution, et continue à demander.

## Missing

PEDITACCEPT : sélectionner une ligne, un arc ou une spline demande toujours avant de le convertir. PLINECONVERTMODE : une spline devient une polyligne de segments droits, bien plus nombreux que ceux d'AutoCAD, jamais d'arcs. Une polyligne lissée apparaît dans la palette Propriétés comme une polyligne ordinaire, sans le titre Polyligne 2D d'AutoCAD ni sa ligne Ajustage/Lissage. L'option Multiple avec seulement des polylignes 3D dans le jeu pose l'invite 3D, là où AutoCAD pose l'invite 2D. Il n'y a pas de maillages à modifier.

## Questions

### Quel est le raccourci de la commande PEDIT dans AutoCAD ?

`PE`, puis Entrée ou la barre d'espace. Le nom complet fonctionne aussi, le même dans AutoCAD en français, et `_PEDIT` dans toutes les langues d'AutoCAD. Un double-clic sur une polyligne la lance aussi.

### Comment transformer des lignes en polyligne ?

Lancez PEDIT, sélectionnez l'une des lignes et appuyez sur Entrée pour la transformer en polyligne, puis choisissez <Keyword id="Join" /> et sélectionnez les autres : celles qui se touchent bout à bout deviennent une seule polyligne. <Command id="JOIN" /> fait la même chose en une étape.

### Pourquoi PEDIT ne fonctionne pas sur mon objet ?

PEDIT modifie les polylignes, et propose de convertir les lignes, arcs et splines ; tout le reste, texte, cercle, bloc, est refusé et la question est reposée. Un objet sur un calque verrouillé dit <Message id="objectOnLockedLayer" />. Joindre n'ajoute que des objets dont les extrémités touchent exactement celles de la polyligne : pour des écarts, utilisez <Keyword id="Multiple" /> et une distance approximative.

### Comment changer la largeur d'une polyligne ?

Choisissez <Keyword id="Width" /> et tapez la largeur : chaque segment la prend. Pour un seul segment, utilisez <Keyword id="Edit vertex" />, amenez le X au sommet où il commence et choisissez sa <Keyword id="Width" />.

### Comment courber une polyligne ?

<Keyword id="Fit" /> fait passer des arcs par chaque sommet ; <Keyword id="Spline" /> fait une courbe plus lisse que ses sommets encadrent. <Keyword id="Decurve" /> la redresse.
