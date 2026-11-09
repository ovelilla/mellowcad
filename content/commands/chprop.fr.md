---
title: "Commande CHPROP dans AutoCAD"
description: "Modifier les propriétés à la ligne de commande dans AutoCAD en français : CHPROP, couleur, calque, type de ligne, épaisseur de ligne, hauteur. Essayez-le."
figure: "CHPROP sur une ligne qui traverse le trou d'une plaque : couleur 1 et type de ligne Center, un axe, sur le calque où elle se trouvait."
sourceHash: "da2b2e65e05e"
---

CHPROP modifie les propriétés des objets que vous sélectionnez, à la ligne de commande : les lignes Général de la palette Propriétés, demandées sous forme d'invites. Sélectionnez les objets, ou sélectionnez-les avant la commande, puis choisissez une propriété à modifier ; elle en redemande une après chacune, jusqu'à ce qu'Entrée la termine. L'invite de chaque propriété propose par défaut la valeur du jeu, <Message id="varies" /> là où les objets diffèrent, et Entrée à cette invite laisse à chaque objet la sienne. Ce que vous réglez est appliqué à la fin de la commande, si bien qu'Echap laisse chaque objet tel qu'il était. Les objets d'un calque verrouillé sont comptés et laissés de côté, chacun affichant <Message id="objectOnLockedLayer" />. Toute l'exécution est une seule étape que <Command id="U" /> annule.

## Options

### Color

Un numéro de couleur de 1 à 255, un nom comme `rouge`, `DUCALQUE`, ou <Keyword id="Truecolor" /> et son `Rouge,Vert,Bleu`, tels que <Command id="COLOR" /> les accepte ; ce que COULEUR refuse est refusé ici aussi, et la question revient.

### LAyer

Le nom d'un calque, quelle que soit la casse. Un nom qui ne peut pas être celui d'un calque affiche <Message id="invalidLayerName" />, un nom absent du dessin est signalé comme introuvable ; dans les deux cas, la question revient. CHPROP ne crée pas de calques.

### LType

Le nom d'un type de ligne, quelle que soit la casse, ou `DuCalque`. Ici, tous les types de ligne sont chargés ; un autre nom est signalé comme introuvable et ramène à l'invite des propriétés.

### LWeight

Une épaisseur de ligne en millimètres, arrondie à l'épaisseur standard la plus proche comme l'arrondit <Command id="LWEIGHT" />, ou `DuCalque` ; `?` les liste.

### Thickness

Une distance, tapée ou mesurée par deux points, négative ou nulle aussi. Elle est appliquée aux lignes, aux cercles, aux arcs et aux polylignes du jeu, selon la normale propre à chacun ; pour chaque autre type, elle indique en terminant qu'elle ne peut pas en changer la hauteur.

## Missing

EChltl, TRansparence, Matériau et Annotatif, que les objets n'ont pas ici, si bien que l'invite ne les liste pas. DuBloc pour la couleur, le type de ligne et l'épaisseur de ligne, et Par défaut pour l'épaisseur de ligne. Une couleur vraie égale à une couleur d'index se relit comme celle-ci : `255,0,0` est proposé comme `1 (rouge)`. Les carnets de couleurs. La hauteur (l'épaisseur) d'un texte et d'une définition d'attribut, laissée telle quelle. CHANGER (CHANGE), dont l'option Propriétés pose la même question avec Elév.

## Questions

### Existe-t-il un raccourci pour CHPROP dans AutoCAD ?

Elle n'a pas de raccourci : tapez `CHPROP`, le même nom en français qu'en anglais, ou `_CHPROP` dans toutes les langues d'AutoCAD. Entrée à l'invite Commande la répète.

### Quelle est la différence entre CHPROP et PROPRIETES ?

Elles modifient les mêmes propriétés. <Command id="PROPERTIES" /> les affiche dans une palette, avec aussi la géométrie de chaque objet ; CHPROP les demande à la ligne de commande, ce qui garde vos mains sur le clavier.

### Comment changer la couleur d'objets à la ligne de commande ?

Tapez `CHPROP`, sélectionnez les objets, appuyez sur Entrée, choisissez <Keyword id="Color" /> et tapez la couleur, par exemple `1` pour le rouge. Appuyez de nouveau sur Entrée pour terminer.

### Comment déplacer plusieurs objets sur un autre calque ?

Lancez CHPROP, sélectionnez-les, choisissez <Keyword id="LAyer" /> et tapez le nom du calque. Le calque doit exister : créez-le d'abord dans <Command id="LAYER" />.
