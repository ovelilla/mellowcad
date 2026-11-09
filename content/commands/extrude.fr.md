---
title: "Commande EXTRUSION (EXTRUDE) dans AutoCAD"
description: "Comment EXTRUSION (EXTRUDE, alias ES) d'AutoCAD en français fait d'un profil 2D fermé un solide 3D, invite par invite : hauteur, Direction, angle d'extrusion."
figure: "Une polyligne fermée en L extrudée de 20 en un solide, puis vue du sud-est dans le style visuel Masqué."
sourceHash: "53bfe3dd1e9c"
---

EXTRUSION (EXTRUDE) transforme des profils 2D fermés en solides 3D, chacun tiré tout droit hors de son plan sur la hauteur que vous donnez. Sélectionnez les profils (cercles, ellipses, polylignes ou splines fermées, régions) et appuyez sur Entrée, puis tapez la hauteur ou montrez-la d'un point ; la dernière hauteur devient la valeur par défaut de la fois suivante. Chaque profil devient un solide à part, sur le calque courant, et il est effacé, comme le veut DELOBJ par défaut. La commande entière est une seule étape, qu'Annuler reprend.

La 3D de MellowCAD se limite aux solides, et reste partielle : un profil ouvert, dont AutoCAD fait une surface, reçoit <Message id="sweepRefusedType" /> et sort de la sélection.

## Options

### MOde

Demande <Keyword id="SOlid" /> ou <Keyword id="SUrface" />. <Keyword id="SOlid" /> est l'option par défaut, et la seule qui existe : comme il n'y a pas encore de surfaces, <Keyword id="SUrface" /> est refusé.

### Direction

Au lieu d'une hauteur, deux points donnent la direction et la longueur : les profils sont extrudés le long de cette ligne, inclinés si elle l'est. Une direction couchée dans le plan du profil reçoit <Message id="directionParallel" />, et la commande se termine.

### Path

Proposé, comme dans AutoCAD, mais pas encore disponible : le choisir est refusé, et la hauteur est redemandée.

### Taper

Demande un angle entre −90 et 90 degrés, puis de nouveau la hauteur : un angle positif rétrécit le solide à mesure qu'il monte, un angle négatif l'élargit. Un cercle qui se referme avant la hauteur finit en pointe, en cône ; un profil qui ne supporte pas l'angle ne produit rien.

### Expression

La hauteur sous forme d'expression : `2*3` vaut 6. Seulement l'arithmétique, pour l'instant.

## Missing

L'option <Keyword id="Path" />, le balayage le long d'un chemin. Le mode <Keyword id="SUrface" /> et les profils ouverts, dont AutoCAD fait des surfaces : il n'y a pas encore de surfaces. Les faces des solides et les zones qu'un clic trouve à l'intérieur d'objets, que prend <Command id="PRESSPULL" />. Un angle d'extrusion sur une ellipse, une spline, ou un arc qui rejoint le segment suivant en angle vif. Les paramètres et fonctions de l'option <Keyword id="Expression" />. <Command id="EXPLODE" /> d'un solide extrudé à côtés courbes, qu'AutoCAD transforme en surfaces et en régions. Ses poignées, et sa hauteur et son angle d'extrusion modifiés dans la palette Propriétés.

## Questions

### Comment s'appelle la commande EXTRUDE en français ?

EXTRUSION, avec l'alias `ES`, puis Entrée ou la barre d'espace ; l'alias anglais `EXT` n'existe pas dans AutoCAD en français. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_EXTRUDE`.

### Comment extruder un dessin 2D en 3D ?

Dessinez le contour comme un seul objet fermé (une polyligne fermée, un cercle ou une région), lancez EXTRUSION, sélectionnez-le, appuyez sur Entrée et tapez la hauteur. Vu de dessus, un solide ressemble à son contour : tournez la vue avec le ViewCube, ou avec <Command id="-VIEW" /> et <Keyword command="VIEW" id="SEiso" />, pour le voir en 3D.

### Pourquoi l'extrusion ne crée pas de solide ?

Le profil est ouvert, ou se coupe lui-même. Une ligne, un arc ou une polyligne ouverte donne une surface dans AutoCAD, et MellowCAD n'en a pas encore : EXTRUSION dit <Message id="sweepRefusedType" /> et les retire de la sélection ; un profil qui se coupe lui-même reçoit <Message id="sweepSelfIntersecting" />, et sort aussi. Joignez les morceaux avec <Command id="JOIN" />, faites-en une région avec <Command id="REGION" />, ou cliquez à l'intérieur avec <Command id="PRESSPULL" />.

### Comment extruder une forme avec un trou ?

Faites-en une seule région : <Command id="REGION" /> sur le contour et le trou, puis <Command id="SUBTRACT" /> pour ôter la région du trou de celle du contour. Extrudez cette région, et le trou traverse le solide. Ou lancez <Command id="PRESSPULL" /> et cliquez entre le contour et le trou.

### Comment extruder le long d'un chemin ?

Pas encore : <Keyword id="Path" /> est proposé, mais refusé, et BALAYAGE (SWEEP) n'existe pas. <Keyword id="Direction" /> extrude le long de la droite qui joint deux points.
