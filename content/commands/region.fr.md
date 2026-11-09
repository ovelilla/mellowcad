---
title: "Commande REGION dans AutoCAD"
description: "Comment REGION (alias REG) d'AutoCAD convertit des formes fermées en régions : les boucles qu'elle trouve, pourquoi elle n'en crée aucune. Essayez-le."
figure: "Quatre lignes fermées extrémité contre extrémité et un cercle à l'intérieur : REGION, avec une fenêtre autour des deux, crée deux régions et efface les objets."
sourceHash: "69a5423c3d5c"
---

REGION convertit des formes fermées en régions : des zones planes sans épaisseur, chacune délimitée par ses boucles. Sélectionnez les objets et appuyez sur Entrée ; chaque boucle qu'ils forment devient une région. Un objet fermé est une boucle à lui seul : un cercle, une ellipse, une polyligne ou une spline fermée. Les objets ouverts (lignes, arcs, arcs elliptiques, polylignes et splines ouvertes) sont enchaînés extrémité contre extrémité, jamais là où ils se croisent, et une chaîne qui ne se ferme pas est écartée. La ligne de commande compte ensuite les boucles trouvées, celles qui ont été rejetées et pourquoi, et les régions créées ; Entrée sans rien de sélectionné affiche <Message id="regionNoneFound" />.

Les objets qui ont formé une région sont effacés, les autres conservés, et les régions prennent le calque et les propriétés courants, pas ceux des objets. Une boucle à l'intérieur d'une autre forme sa propre région, pas un trou dans celle-ci : <Command id="SUBTRACT" /> soustrait l'une de l'autre. Une région est dessinée par ses arêtes, où l'accrochage aux objets la trouve ; la palette Propriétés montre son aire et son périmètre, que mesurent aussi <Command id="AREA" />, <Command id="LIST" /> et <Command id="MASSPROP" />. <Command id="UNION" />, <Command id="SUBTRACT" /> et <Command id="INTERSECT" /> combinent des régions d'un même plan, <Command id="EXTRUDE" />, <Command id="REVOLVE" /> et <Command id="PRESSPULL" /> les transforment en solides 3D, et <Command id="EXPLODE" /> rend leurs lignes, arcs et cercles. Toute la commande est une seule étape d'annulation.

## Missing

La variable `DELOBJ` d'AutoCAD : ici, les objets qui ont formé une région sont toujours effacés. CONTOUR (BOUNDARY), qui peut créer une région à partir de la zone qui entoure un point, et une région tirée du contour de hachures. La modification d'une région par ses poignées : elles s'affichent, mais en faire glisser une ne change rien. Ses arêtes comme arêtes de coupe ou de limite pour <Command id="TRIM" /> et <Command id="EXTEND" /> en mode Rapide, et <Command id="HATCH" /> d'une région dont une arête est elliptique ou une spline. Les régions combinées avec des surfaces, que MellowCAD n'a pas, et la ligne Matériau de la palette Propriétés.

## Questions

### Comment utiliser la commande REGION dans AutoCAD ?

Lancez REGION (ou `REG`), sélectionnez les formes fermées ou les lignes qui en ferment une extrémité contre extrémité, et appuyez sur Entrée. Dans la figure, une fenêtre autour de quatre lignes et d'un cercle crée deux régions, et la ligne de commande compte deux boucles extraites et deux régions créées.

### Pourquoi REGION ne crée pas de région ?

La forme n'est pas fermée extrémité contre extrémité. Des lignes qui se croisent, ou qui s'arrêtent avant de se rejoindre, ne ferment rien : REGION n'enchaîne les objets ouverts que par leurs extrémités, et un écart d'un cheveu suffit à écarter la chaîne. Une boucle qui se croise elle-même, comme un nœud papillon, est rejetée et comptée parmi les auto-intersections. Joignez les extrémités avec <Command id="FILLET" /> de rayon 0, ou ajustez avec <Command id="TRIM" /> ce qui dépasse, puis réessayez.

### Comment faire une région avec un trou ?

Créez une région du contour et une autre du trou, puis lancez <Command id="SUBTRACT" /> : sélectionnez le contour, Entrée, le trou, Entrée. Le résultat est une seule région, et <Command id="EXTRUDE" /> la transforme en un solide percé de part en part.

### Comment connaître l'aire d'une région ?

Sélectionnez-la et lisez Aire dans la palette Propriétés, ou lancez <Command id="AREA" />, choisissez <Keyword command="AREA" id="Object" /> et sélectionnez-la. <Command id="MASSPROP" /> ajoute le périmètre, le centre de gravité et les moments d'inertie.
