---
title: "Commande MESURER (MEASURE) dans AutoCAD"
description: "Comment fonctionne MESURER (MEASURE, alias ME) d'AutoCAD en français : des points ou des blocs à une longueur donnée le long d'un objet. Essayez-le."
figure: "Une polyligne de 190 mesurée tous les 15 depuis l'extrémité sélectionnée : douze points, le dernier à 10 de l'autre extrémité."
sourceHash: "3975c3873eff"
---

MESURER (MEASURE) marque un objet à une longueur donnée. Sélectionnez une ligne, un arc, un cercle, une ellipse, un arc elliptique, une polyligne, une polyligne 3D ou une spline, puis donnez la longueur, tapée ou par deux points : MESURER place un objet point à chaque longueur le long de l'objet, tant qu'il en tient un, et se termine. Elle ne mesure pas une distance pour vous, et ne coupe pas l'objet. Elle part de l'extrémité la plus proche de l'endroit où vous l'avez sélectionné : sélectionnez-le donc près de l'extrémité d'où mesurer ; le reste tombe à l'autre extrémité, et quand la longueur tient un nombre entier de fois, l'autre extrémité reçoit aussi un point. Un cercle commence à son point de 0° et tourne dans le sens inverse des aiguilles d'une montre, où qu'on le sélectionne ; une polyligne fermée commence à son premier sommet.

Les points sont dessinés selon le style de point du dessin, un point minuscule par défaut : choisissez d'abord une figure visible avec <Command id="PTYPE" /> ou PDMODE. Les points sont sur l'objet, sur le calque courant avec la couleur, le type de ligne et l'épaisseur de ligne courants ; le tout est une étape que <Command id="U" /> annule, et les points forment le jeu de sélection Précédent. Une longueur plus grande que l'objet reçoit <Message id="objectNotThatLong" />, et une si courte qu'elle ferait plus de 32767 points <Message id="objectTooLong" /> ; aucune des deux ne crée rien. Tout autre objet reçoit <Message id="cannotMeasureObject" />. La liste déroulante Points des outils de Dessin lance aussi MESURER.

## Options

### Block

Au lieu de points, des références d'un bloc déjà présent dans le dessin : donnez son nom, puis s'il faut aligner chacune avec l'objet, <Keyword id="Yes" /> (par défaut) ou <Keyword id="No" />, puis la longueur. Alignée, chaque référence tourne avec l'objet à sa place, le long d'une ligne ou tangente à un arc, quelle que soit l'extrémité d'où part la mesure ; non alignée, chacune garde l'axe X du SCU. Un nom sans bloc derrière est refusé, et redemandé.

## Missing

Le sens d'une polyligne fermée sélectionnée au-delà de sa moitié : ici, elle est mesurée à rebours depuis son premier sommet, comme AutoCAD mesure une ellipse ou une spline fermées, mais ce qu'AutoCAD fait d'une polyligne n'a pas été vérifié. Les points d'un cercle commencent toujours sur l'axe X du SCU, là où AutoCAD les commence à l'angle d'accrochage, SNAPANG, que MellowCAD n'a pas.

## Questions

### Comment s'appelle la commande MEASURE en français ?

MESURER, avec l'alias `ME`, comme en anglais, puis Entrée ou la barre d'espace. Le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_MEASURE`.

### MESURER sert-elle à mesurer une distance ?

Non : elle place des points à une longueur que vous donnez. Pour mesurer la distance entre deux points, utilisez <Command id="DIST" /> ; pour la longueur d'un objet, <Command id="LIST" /> ou <Command id="AREA" />.

### De quelle extrémité part MESURER ?

De l'extrémité la plus proche du point où vous avez sélectionné l'objet. Sélectionnez-le près de l'extrémité d'où mesurer la première longueur.

### Pourquoi je ne vois pas les points créés par MESURER ?

Ils sont dessinés comme des points minuscules, le style de point par défaut. Ouvrez <Command id="PTYPE" /> et choisissez une croix ou un cercle, ou donnez la valeur `3` à PDMODE : tous les points changent d'un coup.

### Quelle différence entre MESURER et DIVISER ?

<Command id="DIVIDE" /> partage un objet en un nombre de parties égales ; MESURER avance le long de l'objet d'une longueur donnée et laisse le reste à l'autre extrémité.
