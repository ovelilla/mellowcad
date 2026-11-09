---
title: "Commande POLYGONE (POLYGON) dans AutoCAD"
description: "Comment POLYGONE (POLYGON, alias PG) d'AutoCAD en français dessine un polygone régulier : côtés, centre, Inscrit ou Circonscrit, ou un Côté. Essayez-le."
figure: "Deux cercles de rayon 30, un hexagone inscrit dans l'un et circonscrit à l'autre, et un pentagone par son Côté."
sourceHash: "90e1cc9a53c4"
---

POLYGONE (POLYGON) dessine un polygone régulier, tous ses côtés et ses angles égaux, sous forme d'une seule polyligne fermée. Elle demande le nombre de côtés, de 3 à 1024, puis le centre et si le polygone est inscrit dans un cercle ou circonscrit à celui-ci, puis le rayon de ce cercle. Ou il se construit sur l'un de ses côtés, avec <Keyword id="Edge" />. Le nombre de côtés et le choix d'<Keyword id="Inscribed" /> ou de <Keyword id="Circumscribed" /> sont les valeurs par défaut du POLYGONE suivant, dans ce dessin. Un rayon tapé comme un nombre dessine le côté du bas à l'horizontale ; un rayon donné comme un point, cliqué ou tapé, fixe à la fois la taille et l'orientation du polygone. Pendant que vous donnez le rayon, le polygone suit le curseur, avec une ligne ambre en tirets depuis le centre.

## Options

### Edge

Au lieu d'un centre : donnez les deux extrémités d'un côté, et le polygone se construit à partir de lui dans le sens trigonométrique.

### Inscribed

Les sommets sont sur le cercle : le rayon va du centre à un sommet. C'est l'option par défaut.

### Circumscribed

Les côtés touchent le cercle en leur milieu : le rayon va du centre au milieu d'un côté.

## Missing

Une résolution tournée : un rayon tapé comme un nombre dessine toujours le côté du bas à l'horizontale du SCU, là où AutoCAD le tourne de l'angle de résolution, SNAPANG.

## Questions

### Comment s'appelle la commande POLYGON en français ?

POLYGONE, avec l'alias `PG`, puis Entrée ou la barre d'espace ; l'alias anglais `POL` n'existe pas dans AutoCAD en français. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_POLYGON`.

### Comment dessiner un hexagone dans AutoCAD ?

Lancez POLYGONE, tapez `6` pour le nombre de côtés, donnez le centre, choisissez <Keyword id="Inscribed" /> ou <Keyword id="Circumscribed" />, et tapez le rayon. Entre ses côtés parallèles, un hexagone circonscrit mesure deux fois le rayon que vous tapez.

### Quelle est la différence entre inscrit et circonscrit ?

Avec <Keyword id="Inscribed" />, les sommets du polygone touchent le cercle : il tient dedans. Avec <Keyword id="Circumscribed" />, ce sont ses côtés qui touchent le cercle : le cercle tient dans le polygone. À rayon égal, le polygone circonscrit est le plus grand.

### Comment dessiner un polygone avec une longueur de côté donnée ?

Choisissez <Keyword id="Edge" /> et donnez les deux extrémités d'un côté : `0,0`, puis la longueur tapée par rapport à ce point, comme `40,0`. Les autres côtés suivent, dans le sens trigonométrique.
