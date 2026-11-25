---
title: "Commande COTSTYLE (DIMSTYLE) dans AutoCAD"
description: "Styles de cote dans AutoCAD en français : COTSTYLE (DIMSTYLE, alias CST), ISO-25, Nouveau, Définir courant, texte, flèches, échelle et unités. Essayez-le."
figure: "Des cotes dessinées en ISO-25, le style courant : des flèches, le texte au-dessus de la ligne et une virgule comme séparateur décimal."
sourceHash: "7bcae870d3ae"
---

COTSTYLE (DIMSTYLE en anglais) gère les styles de cote du dessin : des ensembles nommés de paramètres, taille de la flèche, hauteur du texte, échelle générale, unités et le reste, que chaque cote reprend de son style. Un nouveau dessin commence avec ISO-25 comme style courant, le style métrique avec lequel AutoCAD commence. COTSTYLE ouvre le Gestionnaire des styles de cote, comme dans AutoCAD ; `'COTSTYLE`, tapé avec une apostrophe à l'intérieur d'une commande, s'ouvre sans terminer celle-ci.

Le gestionnaire indique le style courant et liste les styles, tous ou seulement ceux en cours d'utilisation. Définir courant rend courant le style sélectionné. Nouveau... demande un nom, en proposant `Copie de` suivi du style de départ, puis ouvre les paramètres du nouveau style ; celui-ci est courant une fois le gestionnaire fermé. Modifier... ouvre les paramètres du style sélectionné sur les onglets du gestionnaire : Lignes (espacement des lignes de base, extension au-delà des lignes de cote, décalage de l'origine), Symboles et flèches (taille de la flèche, marques de centre), Texte (hauteur du texte, décalage de la ligne de cote), Ajuster (l'échelle générale, et le tracé ou non d'une ligne de cote entre les lignes d'attache) et Unités principales (précision, séparateur décimal, zéros de fin, précision angulaire). OK les applique, et toutes les cotes de ce style sont aussitôt redessinées. Un clic droit sur un style le renomme ou le supprime ; un nom déjà utilisé est refusé, et ISO-25, le style courant et un style utilisé ne peuvent pas être supprimés. Tout ce qui est fait dans le gestionnaire est une seule étape que U annule.

## Missing

L'aperçu, la Description, Remplacer et Comparer du gestionnaire ; pas de sous-styles pour un type de cote, ni d'Unités alternatives ou de Tolérances, et seulement les paramètres listés ci-dessus. Une variable de cote tapée à la ligne de commande, comme DIMSCALE, ne crée pas de remplacement du style courant. Un nouveau dessin n'a qu'ISO-25, sans les styles Standard et Annotatif qu'un nouveau dessin métrique contient aussi dans AutoCAD.

## Questions

### Comment s'appelle la commande DIMSTYLE en français ?

COTSTYLE, raccourci `CST`, puis Entrée ou la barre d'espace ; `CSTY` et `DDIM` aussi ; dans AutoCAD en français, `D` n'est pas un raccourci de COTSTYLE. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_DIMSTYLE`. <Command id="-DIMSTYLE" /> fonctionne plutôt à la ligne de commande : elle enregistre les paramètres courants sous un nouveau style, ou rend un style courant par son nom.

### Comment changer la taille du texte des cotes dans AutoCAD ?

Sélectionnez le style dans le gestionnaire, appuyez sur Modifier... et changez Hauteur du texte, sur l'onglet Texte, ou Utiliser l'échelle générale de, sur l'onglet Ajuster, qui multiplie toutes les tailles du style, flèches et décalages avec le texte. Toutes les cotes de ce style sont aussitôt redessinées. Pour ne changer que certaines cotes, donnez-leur un style à elles.

### Comment appliquer un style de cote à des cotes existantes ?

Sélectionnez les cotes et choisissez le style dans la ligne Style de cote de la palette Propriétés, ou faites un clic droit dessus et choisissez-le sous Style de cote : une seule étape d'annulation dans les deux cas. Les nouvelles cotes prennent le style courant, que Définir courant change dans le gestionnaire.

### Comment changer le séparateur décimal des cotes ?

ISO-25 écrit une virgule, comme `82,5`. Sur l'onglet Unités principales, réglez Séparateur décimal sur un point ou une espace ; Précision et Supprimer les zéros de fin s'y trouvent aussi. La ligne de commande indique toujours la mesure avec un point, comme celle d'AutoCAD.

### Comment créer un nouveau style de cote ?

Appuyez sur Nouveau..., nommez-le et choisissez le style de départ, puis Continuer : ses paramètres s'ouvrent, et OK le crée. Il est courant une fois le gestionnaire fermé, et toutes les cotes dessinées ensuite le prennent.
