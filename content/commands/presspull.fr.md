---
title: "Commande APPTIRER (PRESSPULL) dans AutoCAD"
description: "Appuyer/Tirer avec APPTIRER (PRESSPULL) d'AutoCAD en français : un objet fermé, une zone délimitée ou la face d'un solide, invite par invite. Essayez-le."
figure: "La zone entre un rectangle et un cercle enfoncée de 8 : une plaque percée d'un trou, vue du sud-est dans le style visuel Masqué."
sourceHash: "b806d59060e1"
---

APPTIRER (PRESSPULL) extrude ce que vous cliquez : un objet fermé, une zone que des objets ferment autour du clic, ou une face plane d'un solide 3D. Cliquez, puis tapez la hauteur ou déplacez le curseur et cliquez : une hauteur positive tire, une négative appuie. Un objet fermé ou une zone devient un nouveau solide, celui que créerait <Command id="EXTRUDE" />, et les objets restent ; les îlots d'une zone y font des trous, comme dans la figure. Une face ajoute son prisme à son solide ou l'en retire : le dessus d'une boîte, tiré, la rend plus haute. L'invite revient pour le clic suivant jusqu'à Entrée, et toute l'exécution est une seule étape, qu'Annuler défait.

Maintenez Ctrl enfoncée et la face qu'un clic prendrait s'éclaire ; Ctrl+clic décale plutôt cette face, ses voisines prolongées jusqu'à la rejoindre, si bien qu'un côté incliné garde sa pente. Comme dans AutoCAD, APPTIRER fonctionne par clics : à un nombre ou un point tapé à sa première invite, elle répond <Message id="presspullClick" />, et l'invite est reposée.

## Options

### Multiple

À l'invite de la hauteur, ou à celle de la distance de décalage : continuez à cliquer pour en ajouter (des objets fermés et des zones, ou des faces d'un même solide), puis appuyez sur Entrée, et une seule hauteur sert pour tous. Une face cliquée après un objet ou une zone est écartée.

## Missing

Une face courbe, qu'AutoCAD décale aussi : ici, le clic ne trouve aucune face. Un décalage dont les faces voisines sont des cônes, des sphères ou des tores, ou à la fois des plans et des faces courbes, ou qui pousserait une face au travers de la face opposée : le solide reste tel quel. Les zones que GRAVER (IMPRINT) et IMPLIEDFACE créent sur une face, et Ctrl+Maj+E. Un objet ouvert, qu'AutoCAD extrude en surface : il n'y a pas encore de surfaces. Pendant le glissement, l'aperçu montre le prisme de la face ou le nouveau solide, pas le solide tel qu'il sera, et une face ne s'éclaire qu'avec Ctrl. Une zone délimitée hors du plan du SCU n'a pas été testée.

## Questions

### Quelle est la différence entre APPTIRER et EXTRUSION ?

<Command id="EXTRUDE" /> prend des objets fermés que vous sélectionnez, les efface comme le veut DELOBJ, et propose une direction, un angle d'extrusion et une expression. APPTIRER prend des clics (un objet fermé, la zone à l'intérieur de plusieurs objets, ou une face d'un solide, qu'elle ajoute à ce solide ou en retire) et garde les objets. À partir d'un objet, les deux créent le même solide.

### Comment extruder une face d'un solide ?

Lancez APPTIRER, cliquez sur la face et donnez la distance : une distance positive la tire et le solide grandit, une négative l'enfonce. Maintenez Ctrl en cliquant pour décaler plutôt la face. Seulement des faces planes, pour l'instant.

### Pourquoi APPTIRER ne fonctionne pas ?

Elle attend un clic sur quelque chose de fermé. À un nombre ou un point tapé à sa première invite, à un clic sur un objet ouvert ou sur une face courbe, APPTIRER répond <Message id="presspullClick" /> et redemande. Cliquez sur un objet fermé, à l'intérieur d'une zone que des objets ferment en plan, ou sur une face plane d'un solide.

### Y a-t-il un raccourci pour APPTIRER ?

Elle n'a pas d'alias : tapez APPTIRER, ou `_PRESSPULL` dans toutes les langues d'AutoCAD. Ctrl+Maj+E, la touche d'AutoCAD pour elle, n'existe pas encore ici.
