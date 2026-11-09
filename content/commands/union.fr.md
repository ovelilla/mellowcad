---
title: "Commande UNION dans AutoCAD"
description: "Comment fonctionne UNION (UNI) d'AutoCAD : solides 3D ou régions d'un même plan réunis en un seul objet, ce qu'elle ignore et pourquoi elle en demande deux."
figure: "Deux boîtes qui se chevauchent, réunies en un seul solide par UNION : vues du sud-est, lignes cachées supprimées."
sourceHash: "be43813a7dee"
---

UNION réunit deux solides 3D ou plus en un seul solide, ou deux régions ou plus situées dans un même plan en une seule région : leur partie commune ne compte qu'une fois, et les arêtes intérieures disparaissent. La commande demande des objets, autant que vous voulez, et Entrée les combine. Comme dans AutoCAD 2027, un jeu sélectionné avant la commande est abandonné et redemandé, et ce qui n'est ni un solide ni une région est ignoré. Les solides et les régions sont combinés séparément : tous les solides en un seul, les régions plan par plan.

L'objet sélectionné en premier devient le résultat, avec son calque et sa couleur, et les autres sont effacés ; avec une fenêtre, une capture ou TOUT, c'est le plus récent d'entre eux. Le résultat est un solide composé : ce n'est plus une boîte ni un cylindre, il n'a pas d'historique (<Command id="LIST" /> affiche Historique = Aucune), et, sélectionné, il montre une seule poignée, qui le déplace en entier. Des solides qui ne se touchent pas deviennent un seul objet en deux morceaux. Toute la commande est une seule étape d'annulation. La 3D de MellowCAD reste partielle : les solides existent, pas les surfaces ni les maillages.

## Missing

Les surfaces, qui n'existent pas ici. Les faces courbes qui se coupent selon une courbe dont MellowCAD n'a pas encore de forme exacte : des cylindres, cônes, sphères ou tores dont les axes ne sont ni confondus ni parallèles (deux cylindres peuvent aussi se croiser) ; un cône avec autre chose qu'un plan ou un solide sur son axe ; un tore ou un solide de révolution avec un plan ni perpendiculaire à son axe ni passant par lui, ou avec un solide hors de son axe ; un solide extrudé avec autre chose qu'un plan ou une face extrudée dans sa direction. Ces cas sont refusés, et les solides restent tels qu'ils étaient ; de même pour une coupe qui touche une arête de façon tangente, des faces presque mais pas tout à fait sur une même surface, et une lamelle très fine entre une coupe et une arête. Un cylindre couché le long d'une face d'une boîte se réunit en un volume correct, mais avec une arête et une face de moins que dans AutoCAD. Aucun historique de solide n'est gardé (SOLIDHIST, SHOWHISTORY).

## Questions

### Quel est le raccourci de la commande UNION ?

`UNI`, puis Entrée ou la barre d'espace. Le nom complet, le même en français, fonctionne aussi, et `_UNION` quelle que soit la langue d'AutoCAD.

### Pourquoi UNION ne fonctionne pas ?

Elle a besoin de deux solides, ou de deux régions du même plan : avec moins, elle dit <Message id="booleanNeedsTwo" /> et ne change rien. Les lignes, les arcs et les polylignes ne sont pas des régions, même fermés : faites-en d'abord des régions avec <Command id="REGION" />. Les objets sélectionnés avant UNION sont abandonnés, comme dans AutoCAD 2027 : sélectionnez-les à son invite. Quand elle dit qu'une opération booléenne a échoué, les solides se rencontrent d'une façon que MellowCAD ne sait pas encore calculer, et restent tels qu'ils étaient.

### Comment annuler une UNION ?

<Command id="U" />, ou Ctrl+Z, juste après : toute la commande est défaite en une étape, les objets tels qu'ils étaient. Plus tard, il n'y a rien à séparer, car le solide combiné ne garde aucune trace de ses parties. L'opération inverse est <Command id="SUBTRACT" />, qui enlève des solides au lieu d'en ajouter.

### Comment réunir des régions avec UNION ?

Faites de chaque forme fermée une région avec <Command id="REGION" />, puis appliquez UNION : les régions de chaque plan deviennent une seule région, leurs côtés communs fusionnés. Des formes qui se referment autour d'un vide laissent un trou, et des régions séparées deviennent une seule région en plusieurs morceaux. Une région seule dans son plan reste telle quelle.
