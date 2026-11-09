---
title: "Commande RESEAUPOLAIRE (ARRAYPOLAR) dans AutoCAD"
description: "Réseau polaire dans AutoCAD en français : RESEAUPOLAIRE (ARRAYPOLAR), invite par invite : le centre, les éléments, l'angle entre eux ou à remplir. Essayez-le."
figure: "Un trou d'une bride mis en réseau autour du centre de la bride : 8 éléments sur un tour complet."
sourceHash: "efed541dea7f"
---

RESEAUPOLAIRE (ARRAYPOLAR en anglais) copie une sélection autour d'un point central, en un seul objet réseau. Elle demande les objets, indique le type et si le réseau est associatif, demande le point central et affiche aussitôt le réseau : 6 éléments sur un tour complet, chacun tourné à mesure qu'il fait le tour. Ensuite, une seule invite le modifie en direct jusqu'à ce qu'Entrée le crée, par ses options ou par les poignées de l'aperçu, comme dans AutoCAD. Les objets sélectionnés deviennent son premier élément.

## Options

### ASsociative

<Keyword id="Yes" />, la valeur par défaut, crée un seul objet réseau, que ses poignées et la palette Propriétés modifient ensuite ; <Keyword id="No" /> crée des copies indépendantes à côté des objets sélectionnés. La réponse est conservée pour la session, par RESEAURECT et TRAJECTOIRERESEAU aussi.

### Items

Le nombre d'éléments, de 1 à 32767 ; l'angle qu'ils remplissent est conservé.

### Angle between

L'angle d'un élément au suivant. L'angle rempli devient ce nombre de pas, dans le même sens, et un tour complet dès qu'ils atteignent 360°.

### Fill angle

L'angle que remplissent les éléments, positif dans le sens inverse des aiguilles d'une montre et négatif dans le sens des aiguilles ; le nombre d'éléments est conservé. Sur un tour complet, les éléments sont espacés d'un tour divisé par leur nombre ; sur moins, le dernier tombe à la fin de l'angle.

### ROTate items

<Keyword id="Yes" />, la valeur par défaut, fait tourner chaque élément à mesure qu'il fait le tour du centre ; <Keyword id="No" /> le déplace seulement, si bien que chaque élément garde l'orientation du premier.

### eXit

Crée le réseau et termine la commande, comme Entrée.

## Missing

Le point de base ; l'axe de rotation, pour un réseau autour d'un axe dans l'espace ; les rangées et les niveaux, pour des anneaux d'éléments et des copies empilées selon Z ; Expression, qui lie une valeur aux paramètres du dessin. Les menus des poignées du réseau (Rayon de l'étirement, Nombre d'éléments, Angle de remplissage…) et Ctrl pour les parcourir.

## Questions

### Comment faire un réseau polaire ?

Tapez `RESEAUPOLAIRE`, sélectionnez les objets, appuyez sur Entrée et désignez le point central ; ou tapez `RE` pour <Command id="ARRAY" /> et choisissez <Keyword command="ARRAY" id="POlar" /> après les objets. Choisissez ensuite <Keyword id="Items" /> pour régler leur nombre, et appuyez sur Entrée pour le créer.

### Comment faire un réseau sur une partie de cercle ?

Choisissez <Keyword id="Fill angle" /> et tapez l'angle : 180 répartit les éléments sur un demi-cercle dans le sens inverse des aiguilles d'une montre, -180 dans le sens des aiguilles. Le nombre d'éléments est conservé, le premier et le dernier à chaque extrémité de l'angle.

### Comment empêcher les éléments de tourner ?

Choisissez <Keyword id="ROTate items" /> et répondez <Keyword id="No" /> : chaque élément est déplacé autour du centre sans tourner.

### Comment changer le rayon d'un réseau polaire ?

Sélectionnez le réseau et faites glisser sa poignée carrée du point de base vers le centre ou à l'opposé : la distance au centre est le nouveau rayon. Ou retapez Rayon dans la palette Propriétés.
