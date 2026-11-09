---
title: "Commande PROLONGER (EXTEND) dans AutoCAD"
description: "Comment fonctionne PROLONGER (EXTEND, alias PR) d'AutoCAD en français, invite par invite : modes Rapide et Standard, arêtes de limite, trajet, Maj pour ajuster."
figure: "Deux lignes prolongées jusqu'à la ligne qui barre leur chemin : chacune sélectionnée une fois près de l'extrémité qui s'allonge, en mode Rapide."
sourceHash: "b2c0044f8e87"
---

PROLONGER (EXTEND) allonge un objet jusqu'à ce qu'il en rencontre un autre : vous le sélectionnez près de l'extrémité qui doit s'allonger, et cette extrémité avance jusqu'à l'arête la plus proche sur son chemin. Elle prolonge les lignes, arcs, arcs elliptiques, polylignes ouvertes (le long de leur dernier segment, droit ou en suivant son arc), polylignes 3D et splines ouvertes. Elle démarre en mode Rapide, comme celle d'AutoCAD : tout objet sert de limite. Maintenir Maj en sélectionnant ajuste à la place, comme le fait <Command id="TRIM" />. Chaque sélection est une étape qu'Annuler défait ; Entrée termine la commande.

## Options

### Boundary

Choisit les objets qui servent de limite : sélectionnez-les, ou appuyez sur Entrée pour les prendre tous. Dès lors, seuls ceux-là servent de limite, quel que soit le mode, jusqu'à la fin de la commande.

### Fence

Demande les points d'une ligne, autant que vous voulez jusqu'à Entrée : chaque objet qu'elle croise est prolongé par l'extrémité la plus proche de l'endroit où le trajet le croise, en une seule étape. Le mode Standard la propose ; le mode Rapide l'accepte aussi.

### Crossing

Demande les deux coins d'une fenêtre : chaque objet que son contour croise est prolongé, en une seule étape.

### mOde

Bascule entre <Keyword id="Quick" /> et <Keyword id="Standard" />. En mode Standard, PROLONGER demande d'abord les arêtes de limite (Entrée les prend toutes) et propose Trajet et Arête. Le mode est commun à PROLONGER et à AJUSTER, et dure toute la session.

### Edge

Mode Standard uniquement. Avec <Keyword id="Extend" />, un objet s'arrête aussi là où une limite se trouverait si elle se prolongeait (une ligne dans les deux sens, un arc sur tout son cercle) : une ligne peut ainsi s'allonger jusqu'à une autre qui n'atteint pas son chemin ; <Keyword id="No extend" /> est l'option par défaut.

### Undo

Proposée dès que l'invite a reçu une réponse (une sélection, un trajet, une fenêtre) : annule le dernier prolongement et, s'il n'y a plus rien à annuler, le dit.

## Missing

Projection : l'option de projection d'AutoCAD (Aucune, Scu, Vue) n'est pas proposée, et tout est calculé en projection sur le plan XY du SCU, ce qui est l'option par défaut d'AutoCAD, Scu. Un trajet ne peut pas encore être tracé en faisant glisser le curseur, seulement cliqué point par point. Le mode et le choix d'Arête durent la session, là où AutoCAD les garde d'une session à l'autre. Un objet incliné par rapport au SCU, sauf une spline, ne sert pas de limite et n'est pas prolongé, et une polyligne lissée par l'option <Keyword command="PEDIT" id="Fit" /> de <Command id="PEDIT" /> est refusée, là où AutoCAD allonge son dernier arc.

## Questions

### Comment s'appelle la commande EXTEND en français ?

PROLONGER, avec les alias `PR` et `PROLONGE`, puis Entrée ou la barre d'espace ; l'alias anglais `EX` ne marche pas, car dans AutoCAD en français il lance EXPORTER. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_EXTEND`.

### Pourquoi la commande prolonger ne fonctionne pas ?

Le plus souvent parce que rien ne croise le chemin que suivrait l'extrémité sélectionnée. Une ligne dit <Message id="noEdgeInThatDirection" /> quand son autre extrémité atteindrait une arête, et une ligne ou un arc <Message id="pathDoesNotIntersectBoundingEdge" /> sinon ; une polyligne ou une spline dit <Message id="objectDoesNotIntersectEdge" />. Sélectionnez plus près de l'autre extrémité ou, en mode Standard, choisissez <Keyword id="Edge" /> puis <Keyword id="Extend" />, pour qu'une limite trop courte compte comme si elle se prolongeait. Un cercle, une polyligne fermée, une ellipse entière, un texte ou des hachures ne peuvent pas être prolongés du tout : <Message id="cannotExtendObject" />

### Comment prolonger plusieurs lignes à la fois ?

Cliquez dans un endroit vide, puis un second point : chaque objet que ce trajet croise s'allonge par son extrémité la plus proche, en une seule étape. Ou choisissez <Keyword id="Crossing" /> et tracez une fenêtre sur les extrémités à prolonger.

### Comment ajuster avec PROLONGER ?

Maintenez Maj en sélectionnant : le morceau est ajusté jusqu'aux intersections les plus proches, comme le ferait <Command id="TRIM" />, et un objet que rien ne croise est supprimé. La sélection suivante sans Maj prolonge de nouveau.
