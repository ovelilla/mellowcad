---
title: "Commande RESEAURECT (ARRAYRECT) dans AutoCAD"
description: "Réseau rectangulaire dans AutoCAD en français : RESEAURECT (ARRAYRECT), colonnes, lignes et niveaux, leur espacement, associatif ou non. Essayez-le."
figure: "Un carré et son cercle en 5 colonnes et 3 lignes, espacées de 16 et de 14 : le nombre donné, puis l'espacement."
sourceHash: "c8c8d747d0c9"
---

RESEAURECT (ARRAYRECT en anglais) copie une sélection en colonnes et en lignes, et en niveaux si vous le voulez, en un seul objet réseau. Elle demande les objets, indique le type et si le réseau est associatif, et l'affiche aussitôt : 4 colonnes selon l'axe X du SCU et 3 lignes selon son axe Y, espacées d'une fois et demie la taille de la sélection. Ensuite, une seule invite le modifie en direct jusqu'à ce qu'Entrée le crée, par ses options ou par les poignées de l'aperçu, comme dans AutoCAD : cliquez sur l'une de ses flèches, puis cliquez là où elle doit aller ou tapez un nombre, pour régler un nombre ou un espacement. Echap à cette invite crée aussi le réseau. Les objets sélectionnés deviennent son premier élément.

## Options

### ASsociative

<Keyword id="Yes" />, la valeur par défaut, crée un seul objet réseau : ses poignées et la palette Propriétés le modifient ensuite, et <Command id="EXPLODE" /> le décompose en ses éléments. <Keyword id="No" /> crée des copies indépendantes à côté des objets sélectionnés. La réponse est conservée pour la session, par RESEAUPOLAIRE et TRAJECTOIRERESEAU aussi.

### COUnt

Le nombre de colonnes, puis de lignes, de 1 à 32767 chacun.

### Spacing

La distance entre les colonnes, puis entre les lignes, négative vers la gauche ou vers le bas. Ou <Keyword id="Unit cell" /> : les deux coins d'un rectangle dont les côtés sont les deux distances.

### COLumns

Le nombre de colonnes et la distance qui les sépare.

### Rows

Le nombre de lignes, la distance qui les sépare, et une élévation dont chaque ligne monte par rapport à la précédente.

### Levels

Des copies empilées selon l'axe Z du SCU : le nombre de niveaux, puis la distance qui les sépare, ou avec <Keyword id="Total" /> la distance du premier niveau au dernier.

### eXit

Crée le réseau et termine la commande, comme Entrée.

## Missing

Le point de base ; Total pour les distances entre les colonnes et entre les lignes (Niveaux l'a) ; Expression, qui lie une valeur aux paramètres du dessin. MODIFIERRESEAU (ARRAYEDIT) et FERMERRESEAU (ARRAYCLOSE), qui modifient la source d'un réseau ou remplacent ses éléments. Les menus des poignées du réseau (Nombre de colonnes, Espacement total des colonnes, Angle d'axe…) et Ctrl pour les parcourir, si bien qu'un espacement total ou un angle d'axe ne peut pas être réglé depuis une poignée ; une poignée n'écrit pas non plus ses lignes à la ligne de commande. Les coordonnées X et Y du point de base, dans la palette, ne peuvent pas être retapées.

## Questions

### Comment créer un réseau rectangulaire ?

Tapez `RESEAURECT`, qui n'a pas de raccourci, ou `RE` pour <Command id="ARRAY" /> et Entrée à sa question, puisque le réseau rectangulaire est son type par défaut. Sélectionnez les objets et appuyez sur Entrée : le réseau est dessiné aussitôt, prêt à être modifié.

### Comment régler la distance entre les lignes et les colonnes ?

Choisissez <Keyword id="Spacing" /> et tapez la distance entre les colonnes, puis entre les lignes ; une distance négative va vers la gauche ou vers le bas. Avec <Keyword id="Unit cell" />, deux coins donnent les deux à la fois. Ou faites glisser les flèches de la deuxième colonne et de la deuxième ligne.

### Comment faire des copies indépendantes ?

Choisissez <Keyword id="ASsociative" /> et répondez <Keyword id="No" /> avant d'appuyer sur Entrée : chaque copie est un objet à part entière. Un réseau associatif peut être décomposé en ses éléments plus tard avec <Command id="EXPLODE" />.

### Comment faire un réseau 3D ?

Choisissez <Keyword id="Levels" /> : les lignes et les colonnes sont copiées vers le haut selon l'axe Z du SCU, autant de niveaux que vous l'indiquez, à la distance que vous donnez. <Keyword id="Rows" /> demande aussi une élévation, qui élève chaque ligne par rapport à la précédente.
