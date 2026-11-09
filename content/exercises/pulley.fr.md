---
title: "Exercice AutoCAD 3D : une poulie"
metaTitle: "Exercice AutoCAD 3D : poulie par révolution"
description: "Modélisez une poulie dans AutoCAD 3D : demi-coupe en polyligne fermée, tournée autour de l'axe Y en un solide, pas à pas. Pratiquez la 3D gratuitement en ligne."
figure: "La demi-coupe de la poulie à côté de son axe, ses distances à l'axe cotées."
model: "La poulie en solide, vue du sud-est dans le style visuel Conceptuel."
sourceHash: "f9c2a81b39fe"
---

Modélisez cette poulie en faisant tourner sa demi-coupe autour de son axe, en millimètres : un alésage de 20, un moyeu de 30 de long et 40 de diamètre, un voile de 10 d'épaisseur et une jante de 24 de large, de 90 à 110 de diamètre, centrée sur le moyeu. La coupe est dessinée en distances à l'axe, qui monte le long de l'axe Y, si bien que chaque diamètre est dessiné par sa moitié.

## Steps

### Dessinez la demi-coupe [#profile]

Sur le calque Contour, une seule <Command id="PLINE" /> fermée depuis `10,0`, chaque point suivant comme un pas depuis le précédent : `10,0`, `0,10`, `25,0`, `0,-7`, `10,0`, `0,24`, `-10,0`, `0,-7`, `-25,0`, `0,10` et `-10,0`, puis <Keyword command="PLINE" id="Close" />.

### Faites tourner la vue [#view]

<Command id="-VIEW" /> et <Keyword command="VIEW" id="SEiso" /> la montrent depuis le sud-est et d'en haut ; <Command id="VSCURRENT" /> et <Keyword command="VSCURRENT" id="Conceptual" /> ombrent les faces, ce qui montre le mieux une pièce tournée.

### Créez le solide de révolution [#revolve]

<Command id="REVOLVE" /> : désignez la coupe et appuyez sur Entrée, puis <Keyword command="REVOLVE" id="Y" /> : l'axe Y est celui de la poulie. Entrée accepte l'angle par défaut, un tour complet. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> la cadre, et une échelle de 0.8x laisse de la marge autour.
