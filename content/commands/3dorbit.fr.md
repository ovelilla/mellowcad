---
title: "Commande ORBITE3D (3DORBIT) dans AutoCAD"
description: "Comment fonctionne l'orbite 3D d'AutoCAD en français (ORBITE3D, 3O) : tourner la vue, en sortir, Maj et la molette, revenir en plan. Essayez-le gratuitement."
figure: "Une boîte vue d'abord en plan : ORBITE3D, un glissement en travers puis vers le bas, puis Entrée, et la boîte est vue d'au-dessus de son coin avant."
sourceHash: "66fc1859c8fd"
---

ORBITE3D (3DORBIT en anglais) fait tourner la vue autour du dessin pendant que vous faites glisser le curseur ; rien ne bouge ni ne change dans le dessin. Un glissement horizontal fait tourner la caméra autour de l'axe Z du SCG, un glissement vers le haut ou vers le bas l'élève ou l'abaisse, autour du milieu du dessin qui se trouve sous le centre de l'écran, en projection parallèle. Elle commence par indiquer comment en sortir : pendant qu'elle s'exécute, vous ne pouvez que faire une orbite, et Entrée ou Echap la termine, que vous ayez fait glisser ou non.

Maintenir Maj et le bouton de la molette enfoncés fait une orbite depuis n'importe où, même à l'intérieur d'une autre commande, et le bouton Orbite 3D de la barre de navigation la lance aussi. Tapée avec une apostrophe devant, `'ORBITE3D`, elle fonctionne à l'intérieur d'une autre commande, qui reprend ensuite. Chaque glissement est une étape pour <Keyword command="ZOOM" id="Previous" /> de <Command id="ZOOM" />, et toute l'exécution est une seule étape d'annulation, si bien que <Command id="U" /> remet la vue en place. Pour voir les solides comme des solides, et non comme des fils, utilisez <Command id="VSCURRENT" /> ; la 3D de MellowCAD se limite aux solides, et reste partielle.

## Missing

Le menu contextuel, avec ses projections, ses styles visuels et les autres modes de navigation. L'orbite autour des seuls objets sélectionnés. La perspective. L'orbite libre et l'orbite continue (3DFORBIT et 3DCORBIT), et le reste de la navigation 3D d'AutoCAD.

## Questions

### Quel est le raccourci de l'orbite 3D dans AutoCAD ?

`3O`, puis Entrée ou la barre d'espace : c'est l'alias d'ORBITE3D dans AutoCAD en français, et `_3DORBIT` fonctionne aussi. Sans rien taper, maintenez Maj et le bouton de la molette enfoncés et faites glisser.

### Comment faire une orbite avec la souris ?

Maintenez Maj enfoncée, appuyez sur la molette et faites glisser : horizontalement pour faire tourner le modèle, verticalement pour le regarder de plus haut ou de plus bas. Relâchez, et vous retrouvez la commande où vous étiez.

### Comment sortir de l'orbite 3D ?

Appuyez sur Entrée ou sur Echap. La vue reste là où vous l'avez laissée.

### Comment revenir à la vue en plan après une orbite ?

Lancez <Command id="PLAN" /> et appuyez sur Entrée, ou <Command id="-VIEW" /> et <Keyword command="VIEW" id="Top" />, ou cliquez sur la face supérieure du ViewCube. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> revient en arrière d'un glissement à la fois.
