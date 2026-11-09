---
title: "Commande MIROIR (MIRROR) dans AutoCAD"
description: "Symétrie avec MIROIR (MIRROR, alias MI) d'AutoCAD en français, invite par invite : deux points de la ligne de symétrie, garder ou effacer la source. Essayez-le."
figure: "Un contour fermé réfléchi par rapport à une ligne de symétrie verticale, la source conservée."
sourceHash: "fd4b7540311a"
---

MIROIR (MIRROR) fait la symétrie des objets que vous sélectionnez par rapport à une ligne : sélectionnez-les, donnez le premier puis le second point de la ligne de symétrie, puis dites s'il faut effacer les objets source. Le reflet est une copie et, avec la réponse par défaut, Non, les originaux restent : c'est ainsi qu'on dessine une pièce symétrique par moitiés. Les deux points sont pris dans le plan du SCU, si bien qu'une ligne de symétrie tracée en mode ortho fait une symétrie bien droite, horizontale ou verticale. Comme dans AutoCAD avec MIRRTEXT à 0, sa valeur par défaut, un texte se lit toujours de gauche à droite dans le reflet, et des hachures gardent l'angle de leur motif. L'exécution est une seule étape, qu'Annuler défait.

## Options

### Yes

Efface les objets source : seul le reflet reste, un retournement sur place.

### No

La réponse par défaut : garde les objets source à côté de leur reflet.

## Missing

MIRRTEXT et MIRRHATCH restent à 0 : un texte n'est jamais réfléchi pour se lire à l'envers, et un motif de hachures n'est jamais réfléchi. Un texte dans une référence de bloc symétrisée se remet à l'endroit comme un texte isolé, là où AutoCAD le réfléchit avec le bloc. Une ellipse symétrisée garde sa normale, si bien que ses angles de départ et de fin se lisent autrement que ceux d'AutoCAD pour la même courbe. Pendant que le reflet suit le curseur, il prend la couleur de chaque objet, pas son type de ligne ni son épaisseur de ligne.

## Questions

### Comment s'appelle la commande MIRROR en français ?

MIROIR, avec l'alias `MI`, le même qu'en anglais, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_MIRROR`.

### Comment faire une symétrie sans que le texte soit inversé ?

Vous n'avez rien à faire : comme dans AutoCAD avec MIRRTEXT à 0, un texte symétrisé se lit normalement, placé là où tombe le reflet de son cadre.

### Comment faire une symétrie et supprimer l'original ?

Répondez <Keyword id="Yes" /> quand MIROIR demande s'il faut effacer les objets source.

### Comment faire une symétrie horizontale ou verticale ?

Activez le mode ortho (F8) et donnez les deux points de la ligne de symétrie le long de l'axe voulu : une ligne verticale inverse la gauche et la droite, une ligne horizontale le haut et le bas.
