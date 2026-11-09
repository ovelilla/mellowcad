---
title: "Commande COULEUR (COLOR) dans AutoCAD"
description: "COULEUR (COLOR, alias CL) d'AutoCAD en français règle la couleur des nouveaux objets : DuCalque, couleur d'index par nom ou numéro, ou RVB. Essayez-le."
figure: "Une plaque dessinée DuCalque, son trou en rouge, son alésage en couleur vraie 0,128,255, puis COULEUR remise à DuCalque."
sourceHash: "93793c2915da"
---

COULEUR (COLOR en anglais) définit la couleur avec laquelle les nouveaux objets sont dessinés. AutoCAD ouvre la boîte de dialogue Sélectionner une couleur ; MellowCAD n'en a pas encore, donc COULEUR lance la forme ligne de commande qu'AutoCAD a aussi, <Command id="-COLOR" />. Elle demande la couleur par défaut de l'objet, en proposant la couleur courante, `DUCALQUE` dans un nouveau dessin : DuCalque signifie que chaque objet prend la couleur de son calque, et une couleur choisie à la place est celle de l'objet lui-même. Tapez le numéro ou le nom d'une couleur d'index, ou choisissez <Keyword id="Truecolor" />. Entrée conserve la couleur courante, et le changement est une étape que <Command id="U" /> annule.

Un mot qu'elle ne sait pas lire affiche <Message id="colorRequired" />, et 0, un nombre négatif ou un nombre supérieur à 255 <Message id="invalidColorNumber" /> ; la question revient. Tapée avec une apostrophe à l'intérieur d'une commande, `'COULEUR`, elle donne la nouvelle couleur à chaque objet dessiné ensuite : chaque segment de <Command id="LINE" /> prend la couleur courante au moment où il commence. COULEUR ne règle que ce qui suit ; la palette Propriétés ou la liste des couleurs de la barre supérieure modifie les objets déjà dessinés.

## Options

### Truecolor

Demande une couleur sous forme de trois valeurs de 0 à 255, rouge, vert et bleu, séparées par des virgules sans espace : `0,128,255` est un bleu moyen. Une couleur qui est aussi une couleur d'index, `255,0,0`, est enregistrée comme cette couleur d'index.

### BYLAYER

Les nouveaux objets prennent la couleur de leur calque, comme au départ.

### RED

La couleur d'index 1, que l'on tape aussi `1`.

### YELLOW

La couleur d'index 2, que l'on tape aussi `2`.

### GREEN

La couleur d'index 3, que l'on tape aussi `3`.

### CYAN

La couleur d'index 4, que l'on tape aussi `4`.

### BLUE

La couleur d'index 5, que l'on tape aussi `5`.

### MAGENTA

La couleur d'index 6, que l'on tape aussi `6`.

### WHITE

La couleur d'index 7, que l'on tape aussi `7` : blanche sur un fond sombre et noire sur un fond clair.

## Missing

La boîte de dialogue Sélectionner une couleur, les carnets de couleurs et la forme TSL. Les couleurs d'index 8 à 255 : seules les couleurs 1 à 7 sont acceptées. DuBloc. Une couleur vraie qui correspond à une couleur d'index est enregistrée comme cette couleur d'index, là où AutoCAD conserve les valeurs RVB. La transparence (CETRANSPARENCY), et les valeurs par défaut propres à chaque type, HPCOLOR, HPLAYER, DIMLAYER et TEXTLAYER.

## Questions

### Comment s'appelle la commande COLOR en français ?

COULEUR, raccourci `CL`, puis Entrée ou la barre d'espace ; `COUL` et `DDCOLOR` aussi. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_COLOR`.

### Comment changer la couleur d'un objet dans AutoCAD ?

Sélectionnez-le et choisissez la couleur dans la liste des couleurs de la barre supérieure ou dans la ligne Couleur de la palette Propriétés : elle change en une seule étape. Ou copiez la couleur d'un autre objet avec <Command id="MATCHPROP" />. COULEUR ne règle que la couleur des objets dessinés après elle.

### Que signifie DuCalque dans AutoCAD ?

Que l'objet prend la couleur de son calque, si bien que changer la couleur du calque dans le Gestionnaire des propriétés des calques change tous les objets DuCalque qui s'y trouvent. C'est la valeur par défaut, et elle garde les couleurs d'un dessin organisées par calque : <Command id="LAYER" />.

### Comment utiliser des couleurs RVB (RGB) dans AutoCAD ?

Choisissez <Keyword id="Truecolor" /> et tapez les trois valeurs séparées par des virgules, par exemple `0,128,255`.
