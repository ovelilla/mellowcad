---
title: "Commande BOITE (BOX) dans AutoCAD"
description: "Dessiner une boîte 3D dans AutoCAD en français : BOITE (BOX), deux coins et une hauteur, Centre, Cube, Longueur et 2Point. Essayez-le gratuitement en ligne."
figure: "Une boîte de 60 sur 40 sur 25, par deux coins et une hauteur, vue du sud-est dans le style visuel Masqué."
sourceHash: "68b09d9eff63"
---

BOITE (BOX en anglais) dessine une boîte, un solide 3D dont les faces suivent les axes du SCU : donnez le premier coin, l'autre coin, puis la hauteur. La hauteur monte selon l'axe Z du SCU, une hauteur négative descend, et un point la donne par sa distance au coin ; un coin donné à une autre Z que le premier fixe la hauteur sans la demander. La dernière hauteur, et les dernières longueur et largeur d'un cube ou de Longueur, sont proposées comme valeurs par défaut qu'Entrée accepte, partagées avec les autres primitives et <Command id="EXTRUDE" />. La boîte est créée sur le calque courant, et Annuler la supprime en une seule étape.

La boîte garde ses dimensions : <Command id="LIST" /> affiche sa position, sa longueur, sa largeur, sa hauteur et sa rotation, et la palette Propriétés permet de taper les quatre premières. Ses poignées la déplacent, l'étirent et, hors de la vue en plan, règlent sa hauteur. C'est un solide 3D pour <Command id="UNION" />, <Command id="SUBTRACT" /> et le reste de la 3D de MellowCAD, qui se limite aux solides et reste partielle.

## Options

### Center

À la première invite : demande le centre, puis un coin, <Keyword id="Cube" /> ou <Keyword id="Length" />. La boîte est centrée sur le point, en hauteur aussi.

### Cube

À l'autre coin : demande une longueur, tapée ou indiquée, et crée un cube dont chaque côté a cette longueur. Une longueur tapée va vers le curseur, une longueur négative à l'opposé.

### Length

À l'autre coin : demande la longueur, puis la largeur. La longueur va vers le curseur, si bien que la boîte peut être inclinée ; la largeur va du côté où se trouve le curseur.

### 2Point

À la hauteur : demande deux points, et la hauteur est la distance qui les sépare.

## Missing

Déplacer, Rotation, Echelle et Miroir depuis une poignée active, qu'AutoCAD fait défiler avec Entrée. Les commandes 3D qui lui sont propres — déplacer, faire pivoter, mettre à l'échelle, refléter et aligner en 3D — avec leurs gizmos, et le déplacement de ses faces, arêtes et sommets un par un. Le SCU dynamique. Les cotes en pointillés qu'AutoCAD dessine pendant que vous donnez le coin, la longueur et la largeur. <Command id="FILLET" /> et <Command id="CHAMFER" /> de ses arêtes, que font <Command id="FILLETEDGE" /> et <Command id="CHAMFEREDGE" />. Enregistrer l'historique et Afficher l'historique, de l'historique du solide, et la ligne Matériau. Les styles visuels qui manquent à <Command id="VSCURRENT" /> au-delà de Filaire 2D, Masqué et Conceptuel.

## Questions

### Comment dessiner une boîte 3D dans AutoCAD ?

Lancez BOITE (BOX en anglais), donnez un coin, puis le coin opposé, puis la hauteur : `0,0`, `60,40` et `25` dessinent la boîte de la session. <Keyword id="Length" /> et une largeur, au lieu du coin opposé, orientent la boîte selon n'importe quel angle.

### Pourquoi ma boîte ressemble à un rectangle ?

Vous la regardez de dessus, en plan. Tournez la vue : un coin du ViewCube, <Command id="-VIEW" /> et <Keyword command="VIEW" id="SEiso" />, ou <Command id="3DORBIT" />. <Command id="VSCURRENT" /> avec <Keyword command="VSCURRENT" id="Hidden" /> masque les arêtes situées derrière.

### Comment dessiner un cube ?

Donnez le premier coin, puis choisissez <Keyword id="Cube" /> et tapez la longueur d'un côté.

### Comment dessiner une boîte à partir de son centre ?

Choisissez <Keyword id="Center" /> et donnez le point central, puis un coin, <Keyword id="Cube" /> ou <Keyword id="Length" /> : la boîte est centrée sur le point, en hauteur aussi.
