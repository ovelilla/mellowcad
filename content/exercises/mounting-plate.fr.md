---
title: "Exercice AutoCAD 3D : une plaque de fixation"
metaTitle: "Exercice AutoCAD 3D débutant : une plaque"
description: "Modélisez une plaque de fixation dans AutoCAD 3D : régions, soustraction des trous et une seule extrusion, pas à pas. Pratiquez la 3D gratuitement en ligne."
figure: "Le contour de la plaque, de 100 sur 60 avec quatre trous, coté."
model: "La plaque en solide, de 10 d'épaisseur, vue du sud-est, lignes cachées supprimées."
sourceHash: "87b8f906b0fd"
---

Modélisez une plaque de fixation de 10 d'épaisseur, en millimètres : son contour de 100 sur 60 aux coins de rayon 8, et quatre trous de 10 dont les centres sont à 15 des bords. Elle commence à plat. Le contour et les cercles deviennent des régions, les trous sont soustraits tant que la plaque est encore plate, et une seule extrusion en fait un solide avec ses trous.

## Steps

### Dessinez le profil [#profile]

Sur le calque Contour, <Command id="RECTANG" /> avec un <Keyword command="RECTANG" id="Fillet" /> de `8`, de `0,0` à `100,60`. Puis un cercle en `15,15` d'un <Keyword command="CIRCLE" id="Diameter" /> de `10`, et copiez-le avec <Command id="COPY" /> depuis son centre vers `70,0`, `70,30` et `0,30`.

### Créez des régions [#region]

<Command id="REGION" /> transforme des objets fermés en régions : désignez le contour et les quatre cercles, puis Entrée. Cinq boucles, cinq régions.

### Soustrayez les trous [#subtract]

<Command id="SUBTRACT" /> : désignez la région de la plaque et appuyez sur Entrée, puis les régions des quatre cercles et Entrée. Il reste une seule région, percée de quatre trous.

### Faites tourner la vue [#view]

<Command id="-VIEW" /> et <Keyword command="VIEW" id="SEiso" /> la montrent depuis le sud-est et d'en haut ; <Command id="VSCURRENT" /> et <Keyword command="VSCURRENT" id="Hidden" /> cachent ce que les faces dissimulent. Le ViewCube fait aussi tourner la vue d'un clic.

### Extrudez-la [#extrude]

<Command id="EXTRUDE" /> : désignez la région, appuyez sur Entrée et tapez la hauteur, `10`. La plaque est un solide, trous compris. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> la cadre, et une échelle de 0.8x laisse de la marge autour.
