---
title: "Commande DIVISER (DIVIDE) dans AutoCAD"
description: "Diviser une ligne en parties égales avec DIVISER (DIVIDE, alias DIV) d'AutoCAD en français : des points ou des blocs sur une ligne, un cercle, un arc."
figure: "PDMODE 3 pour que les points apparaissent en croix ; puis une ligne divisée en 5 et un cercle en 6, qui commence à son point de 0°."
sourceHash: "6f3c52078466"
---

DIVISER (DIVIDE) marque un objet en parties égales. Sélectionnez une ligne, un arc, un cercle, une ellipse, un arc elliptique, une polyligne, une polyligne 3D ou une spline, en cliquant dessus ou en tapant un point qui s'y trouve, puis donnez le nombre de segments, de 2 à 32767 : DIVISER place un objet point à chaque division et se termine. Elle ne coupe pas l'objet, qui reste entier. Un objet ouvert divisé en 5 reçoit 4 points, depuis son début ; un objet fermé en reçoit 5, son début compris : un cercle depuis son point de 0°, dans le sens inverse des aiguilles d'une montre, une polyligne fermée depuis son premier sommet. Les points sont sur l'objet, à sa hauteur, sur le calque courant avec la couleur, le type de ligne et l'épaisseur de ligne courants.

Les points sont dessinés selon le style de point du dessin, et celui par défaut est un point minuscule qui se cache sous la ligne : choisissez d'abord une figure visible avec <Command id="PTYPE" /> ou PDMODE. Toute la division est une étape que <Command id="U" /> annule, et ses points forment le jeu de sélection Précédent, prêts à être effacés ou déplacés. Tout autre objet, un texte ou une référence de bloc, reçoit <Message id="cannotDivideObject" />, et la commande se termine. La liste déroulante Points des outils de Dessin lance aussi DIVISER.

## Options

### Block

Au lieu de points, des références d'un bloc déjà présent dans le dessin : donnez son nom, puis s'il faut aligner chacune avec l'objet, <Keyword id="Yes" /> (par défaut) ou <Keyword id="No" />, puis le nombre de segments. Alignée, chaque référence tourne avec l'objet à sa place, le long d'une ligne ou tangente à un arc ; non alignée, chacune garde l'axe X du SCU. Un nom sans bloc derrière est refusé, et redemandé. Les attributs variables du bloc sont laissés de côté, comme dans AutoCAD.

## Missing

Une hélice, que MellowCAD ne sait pas encore dessiner. Les blocs le long d'un objet qui n'est pas dans le plan du SCU sont posés dans le plan du SCU, là où l'aide d'AutoCAD les place dans celui de l'objet. Les points d'un cercle commencent toujours sur l'axe X du SCU, là où AutoCAD les commence à l'angle d'accrochage, SNAPANG, que MellowCAD n'a pas.

## Questions

### Comment s'appelle la commande DIVIDE en français ?

DIVISER, avec l'alias `DIV`, comme en anglais, puis Entrée ou la barre d'espace. Le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_DIVIDE`.

### Pourquoi la commande diviser ne fonctionne pas ?

Elle fonctionne sans doute : les points sont là, dessinés comme des points minuscules sur la ligne. Ouvrez <Command id="PTYPE" /> (`DDPTYPE`) et choisissez une croix ou un cercle, ou tapez PDMODE et `3` : tous les points du dessin changent d'un coup. Pour les accrocher, utilisez l'accrochage Noeud, `NOD`.

### Comment diviser une ligne en 3 dans AutoCAD ?

Lancez DIVISER, sélectionnez la ligne et tapez le nombre de parties, `3` pour trois. Les deux points entre les parties sont ceux où s'accrocher : l'accrochage Noeud les trouve.

### Comment diviser un cercle en parties égales ?

De la même façon : sélectionnez le cercle et tapez le nombre de parties. Un objet fermé reçoit autant de points que de parties, donc 6 donne six points, le premier au point de 0° du cercle, puis dans le sens inverse des aiguilles d'une montre.

### Comment couper une ligne en plusieurs morceaux ?

DIVISER ne fait que marquer les endroits. Pour y couper la ligne, utilisez <Command id="BREAK" />, ou <Command id="BREAKATPOINT" /> à chaque point, en s'y accrochant avec Noeud.
