---
title: "Commande HACHURES (HATCH) dans AutoCAD"
description: "Hachures dans AutoCAD en français avec HACHURES (HATCH, alias H), invite par invite : point interne ou objets, motif, échelle, angle, îlots. Essayez-le."
figure: "Un rectangle avec un cercle dedans, hachuré en ANSI31 depuis un point intérieur : le cercle reste libre, un îlot."
sourceHash: "d3ed16b85a19"
---

HACHURES (HATCH) remplit une zone fermée d'un motif de lignes, ou d'un remplissage plein. Cliquez un point dans la zone : la commande trouve le contour dans les objets qui l'entourent, et laisse libre ce qui se trouve à l'intérieur comme un îlot (un cercle dans un rectangle, un texte) ; ou sélectionnez les objets qui la délimitent. Cliquez dans autant de zones que vous voulez : Entrée, ou Echap, en fait un seul objet de hachures, sur le calque courant, derrière son contour. La commande entière est une seule étape, qu'Annuler défait.

Dans AutoCAD, HACHURES règle son motif dans l'onglet contextuel Création de hachures ou dans une boîte de dialogue, que MellowCAD n'a pas : ici, elle demande sur la ligne de commande ce que demande <Command id="-HATCH" />, le motif sous <Keyword id="Properties" />. Les deux ne diffèrent que par Echap, qui sous <Command id="-HATCH" /> abandonne les zones. Chaque objet de hachures commence avec le motif, l'échelle et l'angle donnés au précédent : ANGLE, à l'échelle 1 et à l'angle 0, dans un nouveau dessin.

## Options

### Properties

Demande le nom du motif, en majuscules ou en minuscules, en proposant le motif courant : <Keyword id="Solid" /> remplit la zone, et <Keyword id="?" /> liste les motifs avec leur description, puis revient au point. Pour un motif, elle demande ensuite l'échelle (un nombre supérieur à 0, ou deux points mesurés) et l'angle, tapé ou donné par deux points. Les hachures suivantes gardent les trois.

<Session name="hatchPatterns" caption="SOLID et onze motifs d'acadiso.pat, chacun hachuré dans un carré de 30 de côté à l'échelle 1, AR-CONC et AR-SAND à 0.08 et 0.1." />

### Select objects

Au lieu d'un point interne, sélectionnez les objets qui délimitent la zone ; Entrée revient au point. Un objet qui ne ferme aucune zone est écarté ; quand aucun n'en délimite une, Entrée dit <Message id="unableToHatchBoundary" /> et ne crée rien. Une région donne son contour, et ses trous comme îlots.

### Undo

Absente de la liste de l'invite, mais acceptée : elle annule les zones du dernier point cliqué et redemande, en laissant les objets sélectionnés. Elle dit <Message id="noBoundaryToUndo" /> quand il ne reste aucun point à annuler.

## Missing

Les ellipses et les splines comme contours : une zone qu'elles ferment n'est pas trouvée, et une région avec une telle arête est écartée. La tolérance d'espaces (HPGAPTOL) : une zone doit être exactement fermée. Les hachures associatives, les styles d'îlots Normal et Ignorer, les gradients, les motifs définis par l'utilisateur et le reste des motifs d'acadiso.pat. Les autres options de <Command id="-HATCH" /> : dessiner un contour, supprimer des contours, options avancées, ordre de tracé, origine, annotatif, couleur, calque et transparence. EDITHACH (HATCHEDIT) et l'onglet contextuel Editeur de hachures, qu'un double-clic ouvre dans AutoCAD. MIRRHATCH 1 : des hachures symétriques gardent toujours l'angle de leur motif. Les menus des poignées des hachures.

## Questions

### Comment s'appelle la commande HATCH en français ?

HACHURES, avec l'alias `H`, puis Entrée ou la barre d'espace. Sans onglet Création de hachures, elle pose ses questions sur la ligne de commande, comme `-H` (<Command id="-HATCH" />). Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_HATCH`.

### Pourquoi les hachures ne fonctionnent pas dans AutoCAD ?

Le plus souvent parce que la zone n'est pas fermée : HACHURES dit <Message id="hatchNoBoundary" />, et le moindre espace suffit, car rien ne le franchit. Fermez le contour et cliquez de nouveau. Une zone fermée par une ellipse ou une spline n'est pas encore trouvée, et les objets d'un calque désactivé ne sont pas vus.

### Quels motifs de hachures existent, et peut-on en télécharger d'autres ?

Une sélection d'acadiso.pat, le fichier de motifs métrique d'AutoCAD : SOLID, ANGLE, ANSI31 à ANSI38, AR-CONC, AR-SAND, BRICK, CROSS, DASH, DOTS, EARTH, HONEY, LINE, NET, NET3, SQUARE, STEEL et ZIGZAG. <Keyword id="?" /> sous <Keyword id="Properties" /> les liste. Un fichier de motifs à vous ou téléchargé ne peut pas encore être chargé.

### Comment changer l'échelle des hachures ?

Avant de cliquer, sous <Keyword id="Properties" /> : l'échelle vient après le nom du motif. Une fois les hachures créées, sélectionnez-les et retapez Echelle dans la palette Propriétés, ou donnez-leur le motif, l'échelle et l'angle d'autres hachures avec <Command id="MATCHPROP" />. Une échelle si petite que le motif demanderait trop de lignes dit <Message id="hatchTooDense" /> et ne crée pas de hachures.

### Comment connaître l'aire des hachures ?

Sélectionnez-les et lisez Aire sous Géométrie dans la palette Propriétés, îlots exclus ; avec plusieurs objets de hachures sélectionnés, Aire cumulée les additionne. Ou lancez <Command id="AREA" />, choisissez <Keyword command="AREA" id="Object" /> et sélectionnez les hachures.
