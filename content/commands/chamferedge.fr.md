---
title: "Commande ARETECHANFREIN (CHAMFEREDGE) dans AutoCAD"
metaTitle: "ARETECHANFREIN (CHAMFEREDGE) dans AutoCAD"
description: "Chanfreiner les arêtes d'un solide 3D dans AutoCAD en français : ARETECHANFREIN (CHAMFEREDGE), arêtes d'une face, Boucle, Distance. Essayez-le gratuitement."
figure: "Une boîte vue du sud-est : ARETECHANFREIN, avec les deux distances à 6, biseaute les deux arêtes supérieures de son coin avant, qui se rejoignent en une ligne."
sourceHash: "43b1908ad4b3"
---

ARETECHANFREIN (CHAMFEREDGE en anglais) biseaute les arêtes d'un solide 3D. Elle indique les deux distances courantes, puis demande une arête et, après la première, d'autres arêtes de la même face, jusqu'à Entrée : un clic prend l'arête sous le curseur, un point tapé l'arête qui passe par lui. Une arête qui ne partage aucune face avec les premières affiche <Message id="edgesOneFace" />, une arête d'un autre solide <Message id="chamferMultipleBodies" />. À mesure que les arêtes sont prises, le solide est dessiné tel qu'il sera. Entrée vous demande ensuite d'appuyer de nouveau sur Entrée pour accepter, ou de changer les distances pour ce chanfrein ; c'est cette Entrée qui le crée.

La première distance se mesure le long de la face que partagent les arêtes ; pour une arête seule, le long de la face que prend AutoCAD : la face avant, pour l'arête supérieure avant d'une boîte, et la face supérieure, pour le bord d'un cylindre. Une arête droite entre deux faces planes devient une bande plane, l'arête ronde d'un trou ou d'un bord une bande conique, et les chanfreins qui se rencontrent à un coin sont joints par une ligne. Les distances sont proposées de nouveau la fois suivante. Le solide garde son calque et ses propriétés, mais perd ce qui l'a créé : une boîte n'est plus une boîte. Toute la commande forme une seule étape d'annulation. La 3D de MellowCAD se limite aux solides, et reste partielle.

## Options

### Loop

Prend toutes les arêtes autour d'une face : désignez une arête, puis choisissez <Keyword id="Accept" /> pour la boucle affichée, ou <Keyword id="Next" /> pour la boucle de l'autre face à laquelle appartient l'arête. <Keyword id="Edge" /> revient aux arêtes une par une.

### Distance

Demande la première distance, puis la deuxième, chacune tapée ou donnée par la distance entre deux points ; 0 ou moins affiche <Message id="distanceTooSmall" />. <Keyword id="Expression" /> en prend une sous forme de formule. À l'invite d'acceptation, elle demande la distance de la surface de base et celle de l'autre surface, pour ce chanfrein seulement.

## Missing

Un coin où se rencontrent trois arêtes chanfreinées. Une arête droite à côté d'une face courbe, une arête ronde hors de l'axe de son cylindre, et toute arête d'une sphère, d'un tore, d'une extrusion ou d'un solide de révolution : ici, elles échouent avec une erreur de modélisation. Les deux poignées en flèche qu'AutoCAD affiche à l'invite d'acceptation, une par distance. <Command id="CHAMFER" /> désignant l'arête d'un solide, ce qu'AutoCAD permet aussi. Le chanfrein dessiné en maillage pendant la désignation, et les surfaces.

## Questions

### Comment chanfreiner une arête d'un solide 3D dans AutoCAD ?

Lancez ARETECHANFREIN, choisissez <Keyword id="Distance" /> et donnez les deux distances, désignez les arêtes d'une face, puis appuyez deux fois sur Entrée : une fois pour terminer la désignation, une fois pour accepter. Les `6` et `6` de la session biseautent deux arêtes supérieures d'une boîte.

### Pourquoi ARETECHANFREIN dit que les arêtes doivent appartenir à une face ?

Les arêtes d'un même chanfrein partagent une face : la première distance se mesure le long de celle-ci. Chanfreinez les arêtes d'une autre face lors d'une deuxième exécution.

### Pourquoi CHANFREIN ne fonctionne pas sur un solide 3D ?

La commande <Command id="CHAMFER" /> d'AutoCAD biseaute aussi l'arête d'un solide, mais pas encore celle de MellowCAD : utilisez ARETECHANFREIN, et <Command id="FILLETEDGE" /> pour arrondir une arête.

### Comment chanfreiner l'arête d'un trou ?

Désignez son arête ronde, là où elle rencontre la face plane : le chanfrein est une bande conique autour du trou.
