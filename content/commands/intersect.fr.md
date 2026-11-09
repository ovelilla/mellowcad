---
title: "Commande INTERSECT dans AutoCAD"
description: "Comment fonctionne INTERSECT (alias IR) d'AutoCAD en français : des solides 3D, ou des régions d'un plan, réduits à ce qu'ils partagent. Essayez-le en ligne."
figure: "Une boîte et une sphère qui la déborde, intersectées : ce qu'elles partagent est une boule à six faces planes, vue du sud-est."
sourceHash: "c8ea61c0525d"
---

INTERSECT ne garde que ce que deux solides 3D ou plus ont en commun, ou deux régions ou plus dans un même plan, et efface le reste : une boîte et une sphère qui la déborde laissent une boule aux faces planes. Elle demande des objets jusqu'à Entrée, comme <Command id="UNION" />, et ignore ce qui n'est ni un solide ni une région. Comme dans AutoCAD 2027, un jeu sélectionné avant elle est abandonné et redemandé. Les solides et les régions sont calculés à part, les régions plan par plan.

L'objet sélectionné en premier devient le résultat, avec son calque et sa couleur, et les autres sont effacés ; avec une fenêtre, une capture ou en sélectionnant tout, c'est le plus récent d'entre eux. Le résultat est un solide composé, qui n'est plus une boîte ni une sphère, sans historique. Quand les objets n'ont rien en commun, elle dit <Message id="nullSolid" /> ou <Message id="nullRegion" /> et les efface tous, comme AutoCAD. La commande entière est une seule étape d'annulation. La 3D de MellowCAD est encore partielle : les solides existent, les surfaces et les maillages non.

## Missing

Les surfaces, qui n'existent pas ici. Les faces courbes qui se coupent selon une courbe dont MellowCAD n'a pas encore de forme exacte : cylindres, cônes, sphères ou tores dont les axes ne sont ni confondus ni parallèles (deux cylindres peuvent aussi se croiser) ; un cône avec autre chose qu'un plan ou un solide sur son axe ; un tore ou un solide de révolution avec un plan ni perpendiculaire à son axe ni passant par lui, ou avec un solide hors de son axe ; un solide extrudé avec autre chose qu'un plan ou une face extrudée dans sa direction. Ces cas sont refusés avec un message disant qu'une opération booléenne a échoué, et les solides restent tels quels ; de même une coupe qui touche une arête de façon tangente, des faces presque mais pas tout à fait sur une même surface, et une lamelle très fine entre une coupe et une arête. Un cylindre couché le long d'une face d'une boîte s'unit avec le bon volume, mais avec une arête et une face de moins que dans AutoCAD. Aucun historique de solide n'est gardé (SOLIDHIST, SHOWHISTORY), et l'objet que gardent Trajet ou Précédent n'est pas vérifié.

## Questions

### Comment s'appelle la commande INTERSECT en français ?

INTERSECT, comme en anglais, avec l'alias `IR`, puis Entrée ou la barre d'espace ; l'alias anglais `IN` n'existe pas dans AutoCAD en français. `_INTERSECT` fonctionne dans toutes les langues d'AutoCAD.

### Quelle est la différence entre UNION, SOUSTRACTION et INTERSECT ?

Les trois font un seul objet de solides 3D, ou de régions d'un même plan. <Command id="UNION" /> garde tout ce que couvre l'un d'eux, <Command id="SUBTRACT" /> garde le premier jeu moins le second, et INTERSECT ne garde que ce que tous partagent. Chacune est une seule étape d'annulation, et chacune efface les objets qu'elle a consommés.

### Comment faire l'intersection de deux lignes dans AutoCAD ?

Pas avec INTERSECT, qui travaille sur les solides et les régions et ignore les lignes. Pour trouver où deux lignes se croisent, prenez le point avec l'accrochage aux objets Intersection ; pour les faire se rejoindre, utilisez <Command id="FILLET" /> avec un rayon de 0, <Command id="TRIM" /> ou <Command id="EXTEND" />.

### Pourquoi INTERSECT supprime mes objets ?

Parce qu'ils n'ont rien en commun : sans partie partagée, elle dit <Message id="nullSolid" />, ou <Message id="nullRegion" /> pour des régions, et les efface, comme AutoCAD. <Command id="U" /> les rend. Un solide et une région, ou deux régions dans des plans différents, ne sont pas intersectés du tout : elle dit <Message id="booleanNeedsTwo" /> et ne change rien.
