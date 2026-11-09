---
title: "Commande ELLIPSE dans AutoCAD"
description: "Comment fonctionne ELLIPSE (EL) d'AutoCAD en français, invite par invite : un axe et l'autre demi-axe, par le Centre, Rotation ou un Arc elliptique. Essayez-le."
figure: "Une ellipse par les deux extrémités d'un axe, une autre par son Centre, et un demi-Arc elliptique, de 0 à 180 degrés."
sourceHash: "2ee0d1b3a8a4"
---

ELLIPSE dessine une ellipse à partir des deux extrémités d'un axe, puis de la distance entre son milieu et l'extrémité de l'autre axe : la moitié de la longueur de l'autre axe. L'un ou l'autre axe peut être le plus long. C'est une vraie ellipse, comme celle d'AutoCAD, pas une polyligne : les accrochages Centre, Quadrant et Le plus proche la trouvent, et ses poignées la déplacent et règlent chaque demi-axe. Pendant que vous donnez la seconde extrémité, une ligne ambre en tirets part de la première ; à la distance, l'ellipse suit le curseur. L'ellipse est créée sur le calque courant, avec les propriétés courantes au moment où elle est fixée.

## Options

### Arc

Dessine un arc elliptique : les mêmes invites que pour une ellipse, puis un angle de départ et un angle de fin, dans le sens trigonométrique à partir de l'extrémité du premier axe donné.

### Center

Part du centre : puis l'extrémité d'un axe, puis la distance avec l'autre.

### Rotation

Au lieu de la distance : l'angle dont l'ellipse tourne autour de son premier axe, comme un cercle vu sous cet angle. 0 dessine un cercle ; un angle à moins de 0,6 degré de 90 est refusé avec <Message id="invalid" />.

### Parameter

Dans un arc, au lieu de l'angle de départ ou de fin : l'angle sur le cercle à partir duquel l'ellipse est dessinée, le paramètre d'AutoCAD. <Keyword id="Angle" /> revient aux angles.

### Included angle

Dans un arc, au lieu de l'angle de fin : l'angle qu'il décrit depuis le départ. Entrée prend 180, la moitié de l'ellipse.

## Missing

Isocercle, qu'AutoCAD ne propose qu'avec le style de résolution isométrique, qui n'existe pas ici. PELLIPSE 1, une ellipse dessinée comme une polyligne. Hachurer ou coter une ellipse, et les accrochages Intersection, Tangente et Perpendiculaire sur elle. Les poignées en flèche aux extrémités d'un arc elliptique, carrées ici, et taper une longueur ou un angle pendant qu'une poignée est active. Un point avec un Z à la distance est mesuré en plan, là où AutoCAD le mesure dans l'espace.

## Questions

### Quel est le raccourci de la commande ELLIPSE dans AutoCAD ?

`EL`, puis Entrée ou la barre d'espace. Le nom complet fonctionne aussi, le même dans AutoCAD en français, et `_ELLIPSE` dans toutes les langues d'AutoCAD.

### Comment dessiner une demi-ellipse dans AutoCAD ?

Choisissez <Keyword id="Arc" />, donnez l'axe et la distance, puis un angle de départ de `0` et un angle de fin de `180`. Ou appuyez sur Entrée à <Keyword id="Included angle" />, qui décrit 180 par défaut.

### Comment dessiner une ellipse à partir de son centre ?

Choisissez <Keyword id="Center" />, donnez le centre, puis l'extrémité d'un axe, puis la distance du centre à l'extrémité de l'autre : les deux demi-axes de l'ellipse.

### Comment dessiner un cercle isométrique dans AutoCAD ?

AutoCAD le dessine avec l'option Isocercle d'ELLIPSE, une fois le style de résolution réglé sur Isométrique. Ni l'un ni l'autre n'existe encore dans MellowCAD.
