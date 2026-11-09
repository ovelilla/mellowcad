---
title: "Commande TEXTMULT (MTEXT) dans AutoCAD"
description: "Texte multiligne avec TEXTMULT (MTEXT, alias TT) d'AutoCAD en français : deux coins ou Largeur, Hauteur, Justifier, interligne, un seul objet. Essayez-le."
figure: "Une note dans un cadre : la hauteur réglée d'abord, puis le coin opposé, et un paragraphe renvoyé à la ligne à la largeur entre les deux."
sourceHash: "a53001f9674d"
---

TEXTMULT (MTEXT) écrit du texte multiligne : un seul objet qui contient des paragraphes renvoyés à la ligne selon une largeur. Vous cliquez un premier coin puis le coin opposé, et le cadre entre eux fixe la largeur ; vous tapez ensuite dans un éditeur dessiné sur place, où Entrée commence un nouveau paragraphe et Ctrl+Entrée, ou un clic hors du cadre, garde le texte. Echap avec quelque chose de tapé demande s'il faut l'enregistrer, comme la boîte de dialogue des modifications non enregistrées d'AutoCAD. Pour des lignes qui soient chacune un objet à part, utilisez <Command id="TEXT" />.

La première ligne indique le style et la hauteur courants. Chaque option se demande à l'invite du coin opposé et y revient : une même exécution règle ainsi la hauteur, la justification et le reste avant que le cadre soit fermé. Les mots passent à la ligne là où une ligne dépasserait la largeur, et un mot plus long que la largeur la dépasse. La hauteur est partagée avec <Command id="TEXT" /> et gardée dans le dessin ; la justification, la rotation et l'interligne repartent de leurs valeurs par défaut à chaque exécution. <Command id="-MTEXT" /> demande la même chose, puis prend le texte sur la ligne de commande, une ligne à la fois.

## Options

### Height

Règle la hauteur du texte, tapée ou donnée par la distance du premier coin à un point ; elle doit être supérieure à zéro. Elle reste pour l'exécution suivante, et pour <Command id="TEXT" />.

### Justify

Règle auquel des neuf points du cadre le texte est suspendu : en haut à gauche par défaut, ou haut, milieu et bas par gauche, centre et droite, comme les liste l'invite. Le texte est suspendu à ce point du cadre, quel que soit le sens dans lequel le cadre a été tracé.

### Line spacing

Demande le type, au moins (par défaut), qui laisse de la place à une ligne aux lettres plus hautes, ou exactement, puis un facteur écrit avec un x, comme `2x`, ou une distance. L'interligne simple vaut 1x, et le facteur va de 0.25x à 4x.

### Rotation

Fait tourner le cadre et son texte, d'un angle tapé ou montré depuis le premier coin.

### Style

Rend courant un style de texte, par son nom ; <Keyword id="?" /> liste les styles du dessin, et un nom qu'il n'a pas est refusé. Les styles se créent dans la palette qu'ouvre <Command id="STYLE" />.

### Width

Demande la largeur au lieu du coin opposé, tapée ou donnée par la distance à un point, puis ouvre l'éditeur. Une largeur de 0, ou Entrée, laisse les lignes sans retour automatique, chacune aussi longue que tapée.

## Missing

Les colonnes, qu'AutoCAD 2027 propose à l'invite du coin opposé, ne sont pas proposées. La mise en forme à l'intérieur du texte, comme la hauteur, la police ou la couleur d'un mot, les fractions empilées ou le soulignement, n'est ni dessinée ni appliquée, et l'éditeur n'a ni règle, ni tabulations, ni retraits, ni listes, ni onglet contextuel Editeur de texte du ruban, ni curseur de texte sur le dessin. Il n'y a ni masque d'arrière-plan, ni cadre de texte, ni hauteur définie, ni échelle annotative, ni accrochage Noeud sur ses coins, et un clic dans son cadre le sélectionne même hors de ses lettres, là où AutoCAD ne sélectionne rien.

## Questions

### Comment s'appelle la commande MTEXT en français ?

TEXTMULT, avec les alias `TT` et `TX`, puis Entrée ou la barre d'espace ; dans AutoCAD en français, `T` lance <Command id="TEXT" />, le texte sur une ligne, et `MT` n'existe pas. `_MTEXT` fonctionne dans toutes les langues d'AutoCAD. <Command id="-MTEXT" />, `-TX`, demande la même chose et prend le texte sur la ligne de commande.

### Comment aller à la ligne dans un texte multiligne ?

Appuyez sur Entrée : un nouveau paragraphe commence. Dans un paragraphe, les lignes passent à la ligne d'elles-mêmes à la largeur du cadre. Ctrl+Entrée, ou un clic hors du cadre, ferme l'éditeur et garde le texte.

### Comment changer la largeur d'un texte multiligne ?

Sélectionnez-le et faites glisser la poignée sur son côté : le texte se répartit de nouveau à mesure que la largeur change, autour de son point de justification. La ligne Largeur définie de la palette Propriétés le fait par un nombre, et ses lignes d'espacement des lignes changent l'interligne.

### Comment convertir un texte multiligne en texte sur une ligne ?

Décomposez-le avec <Command id="EXPLODE" /> : chacune de ses lignes devient un <Command id="TEXT" />, justifié à gauche là où se trouvait la ligne, comme dans AutoCAD. Pour le retaper à la place, double-cliquez dessus : son éditeur s'ouvre.
