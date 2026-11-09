---
title: "Commande REVOLUTION (REVOLVE) dans AutoCAD"
description: "Comment REVOLUTION (REVOLVE, alias REV) d'AutoCAD crée un solide de révolution à partir d'un profil 2D, invite par invite : l'axe, Objet, X, Y, Z. Essayez-le."
figure: "Un profil à collerettes tourné d'un tour complet autour de l'axe Y : une bobine, vue du sud-est dans le style visuel Masqué."
sourceHash: "dc0576311912"
---

REVOLUTION (REVOLVE) fait tourner des profils 2D fermés autour d'un axe et en fait des solides 3D : un rectangle dont une arête est sur l'axe donne un cylindre, un cercle à côté de l'axe un anneau. Sélectionnez les profils (cercles, ellipses, polylignes ou splines fermées, régions) et appuyez sur Entrée ; indiquez l'axe par deux points ou par l'une de ses options, puis l'angle, Entrée donnant un tour complet. Chaque profil devient un solide sur le calque courant et est effacé, comme le veut DELOBJ par défaut. Toute la commande est une seule étape, qu'Annuler défait.

L'axe se trouve dans le plan du profil, tout le profil d'un même côté, sinon la commande se termine par <Message id="revolveOneSide" /> avant de demander un angle. L'angle tourne selon la règle de la main droite autour de l'axe, orienté de son premier point vers le second ; un angle négatif tourne dans l'autre sens. La 3D de MellowCAD ne connaît que les solides et reste partielle : les profils ouverts, dont AutoCAD fait des surfaces, sont refusés.

## Options

### MOde

Demande <Keyword id="SOlid" /> ou <Keyword id="SUrface" />, comme <Command id="EXTRUDE" /> : faute d'objets surfaces pour l'instant, seul <Keyword id="SOlid" />, la valeur par défaut, est accepté.

### Object

L'option par défaut de l'invite de l'axe, qu'Entrée choisit donc : sélectionnez une ligne, une polyligne, un arc ou une spline, et l'axe va en ligne droite entre ses deux extrémités, à partir de l'extrémité la plus proche du point désigné. Un objet fermé n'a pas d'extrémités : <Message id="revolveClosedAxis" />, et la commande se termine.

### X

L'axe X du SCU, passant par son origine.

### Y

L'axe Y du SCU, passant par son origine : un profil dessiné à sa droite, comme dans la figure, devient une pièce couchée le long de Y.

### Z

L'axe Z du SCU, passant par son origine. Un profil dans le plan XY du SCU lui est perpendiculaire, donc REVOLUTION répond <Message id="revolvePerpendicular" /> et se termine : Z sert à un profil dressé à la verticale.

### STart

À l'invite de l'angle : l'angle de départ, toujours 0 par défaut. Le profil y est d'abord tourné, puis l'angle est demandé de nouveau.

### Reverse

Inverse l'axe, si bien que l'angle tourne dans l'autre sens, et redemande l'angle.

### EXpression

L'angle sous la forme d'une expression arithmétique, comme dans <Command id="EXTRUDE" />.

## Missing

Un axe hors du plan du profil, autour duquel AutoCAD fait tourner le profil pour créer des surfaces : ici REVOLUTION dit <Message id="revolveUnable" /> et se termine. Un arc elliptique ou une arête de solide comme axe <Keyword id="Object" />. Le mode <Keyword id="SUrface" /> et les profils ouverts, faute d'objets surfaces pour l'instant. L'aperçu qui tourne avec le curseur : pendant que vous indiquez l'angle, c'est le tour complet qui est affiché. <Command id="EXPLODE" /> d'un solide de révolution, qu'AutoCAD transforme en surfaces et en régions. Ses poignées, et son angle modifié dans la palette Propriétés.

## Questions

### Comment s'appelle la commande REVOLVE en français ?

REVOLUTION, avec l'alias `REV` : tapez-le, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_REVOLVE`.

### Comment faire un solide de révolution ?

Dessinez la moitié de la section en un seul objet fermé à côté de la ligne d'axe : une polyligne fermée ou une région. Lancez REVOLUTION, sélectionnez le profil et appuyez sur Entrée ; appuyez de nouveau sur Entrée pour <Keyword id="Object" /> et sélectionnez la ligne d'axe, ou indiquez ses deux extrémités ; puis Entrée pour un tour complet.

### Pourquoi REVOLUTION ne fonctionne pas ?

Le plus souvent, l'axe traverse le profil : REVOLUTION dit <Message id="revolveOneSide" /> et se termine. Placez l'axe au bord du profil ou au-delà ; une arête posée sur l'axe est permise. Un axe perpendiculaire au plan du profil reçoit <Message id="revolvePerpendicular" />, et un profil ouvert est refusé, car MellowCAD n'a pas encore de surfaces.

### Comment faire une révolution de moins de 360 degrés ?

Tapez l'angle, 90 ou 270, à l'invite de l'angle. <Keyword id="STart" /> commence le tour plus loin, et <Keyword id="Reverse" /> le fait tourner dans l'autre sens.
