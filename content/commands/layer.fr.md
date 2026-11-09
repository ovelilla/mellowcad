---
title: "Commande CALQUE (LAYER) dans AutoCAD"
description: "CALQUE (LAYER, alias PL) d'AutoCAD en français : le Gestionnaire des propriétés des calques, créer, supprimer, désactiver et verrouiller. Essayez-le en ligne."
figure: "Trois calques, chacun rendu courant avant de dessiner dessus : les murs en blanc, une porte en jaune, un axe en rouge avec le type de ligne CENTER."
sourceHash: "0d282504181d"
---

CALQUE (LAYER) ouvre le Gestionnaire des propriétés des calques, où les calques d'un dessin sont créés, nommés et réglés. Comme dans AutoCAD, c'est une palette, pas une boîte de dialogue : elle reste ouverte pendant que vous dessinez, ici comme un onglet du panneau des palettes, jusqu'à ce que <Command id="LAYERCLOSE" /> la ferme, et tapée avec une apostrophe devant à l'intérieur d'une autre commande, elle s'ouvre sans terminer cette commande. Chaque objet est sur un calque, et sa couleur, son type de ligne et son épaisseur de ligne, quand ils sont DuCalque, sont ceux du calque. Les nouveaux objets vont sur le calque courant.

Chaque calque est une ligne, avec les colonnes dans l'ordre d'AutoCAD : Etat, une coche sur le calque courant, puis Nom, Actif, Verrouiller, Couleur, Type de ligne et Epaisseur de ligne, et le nombre d'objets qu'il contient ; les lignes sont triées par nom. Nouveau calque ajoute un calque avec la couleur, le type de ligne et l'épaisseur de ligne du calque sélectionné, son nom prêt à être tapé, et laisse le calque courant tel quel. Définir courant, ou un double-clic sur une ligne, rend un calque courant. Un clic sur le nom du calque sélectionné, ou F2, le renomme, et un nom déjà pris ou avec des caractères qu'AutoCAD interdit est refusé, tout comme renommer le calque 0. Supprimer calque supprime un calque, mais jamais le calque 0, le calque courant ou un calque qui contient des objets : la boîte de dialogue Calque - Non supprimé d'AutoCAD dit lesquels. Chaque modification dans le gestionnaire est une étape que U reprend, les modifications consécutives ensemble.

## Missing

-CALQUE (-LAYER), LAYDEL et les autres outils du groupe de fonctions Calques : Rendre courant, Copier le calque, Calque précédent et le reste, et les icônes Actif, Geler et Verrouiller de sa liste déroulante. Les calques ne peuvent pas être gelés, et le gestionnaire n'a pas les colonnes Geler, Tracer, Transparence, Style de tracé, Gel dans les nouvelles fenêtres ou Description, ni réorganisation des colonnes, ni filtres de calque ou arborescence, ni boîte de dialogue Paramètres de calque. Lancer CALQUE n'est pas une étape d'annulation à part. Un nouveau calque est trié aussitôt, là où AutoCAD le montre sous le calque sélectionné jusqu'à ce qu'il soit renommé, et l'épaisseur de ligne du calque 0 est 0.25 mm, pas Par défaut. LAYLOCKFADECTL ne peut pas être tapée : les objets d'un calque verrouillé sont toujours estompés à moitié.

## Questions

### Comment s'appelle la commande LAYER en français ?

CALQUE, avec les alias `PL`, `LAYER` et `DDLMODES`, puis Entrée ou la barre d'espace ; `PL` ouvre ici les calques, pas une polyligne, et l'alias anglais `LA` n'existe pas dans AutoCAD en français. `_LAYER` fonctionne dans toutes les langues. Elle ouvre le Gestionnaire des propriétés des calques, et <Command id="LAYERCLOSE" /> le ferme.

### Comment changer le calque d'un objet ?

Sélectionnez l'objet, puis choisissez le calque dans la liste déroulante Calques de la barre supérieure : il y passe en une seule étape d'annulation, et le calque courant ne change pas. La ligne Calque de la palette Propriétés fait de même. Sans rien de sélectionné, la liste déroulante rend courant le calque choisi.

### Comment supprimer un calque dans AutoCAD ?

Sélectionnez-le dans le Gestionnaire des propriétés des calques et appuyez sur Supprimer calque. Le calque 0, le calque courant et un calque qui contient des objets, y compris dans une définition de bloc, ne peuvent pas être supprimés : effacez ses objets ou changez-les de calque, et rendez d'abord un autre calque courant.

### Quelle est la différence entre désactiver un calque et le verrouiller ?

Un calque désactivé masque ses objets : on ne peut ni les sélectionner ni s'y accrocher, et ils sortent de la sélection. Les objets d'un calque verrouillé restent visibles, estompés, et acceptent l'accrochage aux objets et la sélection, mais aucune commande ne les modifie : celle qui les reçoit les compte et les écarte. Désactiver le calque courant demande d'abord confirmation, comme dans AutoCAD.

### Comment créer un nouveau calque ?

Appuyez sur Nouveau calque dans le Gestionnaire des propriétés des calques et tapez son nom : le calque prend la couleur, le type de ligne et l'épaisseur de ligne du calque sélectionné, que vous changez ensuite dans sa ligne. Rendez-le courant pour dessiner dessus.
