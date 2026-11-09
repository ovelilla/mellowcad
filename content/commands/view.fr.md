---
title: "Commande VUE (VIEW) dans AutoCAD"
description: "Comment VUE (VIEW, alias VU, -VUE) d'AutoCAD passe aux six vues orthogonales et aux quatre isométriques, et le SCU que fixe chaque vue orthogonale. Essayez-le."
figure: "Une pièce en gradins dessinée en plan : -VUE et Isométrique SO, et elle est vue du sud-ouest et d'en haut, dans le style visuel Masqué."
sourceHash: "261c8657f5f7"
---

VUE (VIEW) oriente la vue vers l'une des dix vues prédéfinies d'AutoCAD : six vues orthogonales, qui regardent un côté du modèle de face, et quatre vues isométriques, qui regardent vers le bas depuis un coin. Rien ne bouge dans le dessin. VUE lance <Command id="-VIEW" />, la forme en ligne de commande : sa première invite propose <Keyword id="Orthographic" />, qui demande ensuite le côté, et elle accepte aussi directement le nom d'une vue, comme y répondent les menus d'AutoCAD : <Command id="-VIEW" />, puis <Keyword id="SWiso" />. Chaque vue cadre tout le dessin et affiche <Message id="regeneratingModel" />.

Le menu des vues, en haut à gauche du dessin, liste les mêmes dix vues et lance <Command id="-VIEW" />, et les faces et les coins du ViewCube y mènent aussi, en laissant le SCU tel quel. Chaque VUE est une étape d'annulation : <Command id="U" /> défait donc la vue, avec le SCU qu'elle a fixé. Tapée avec une apostrophe à l'intérieur d'une autre commande, elle refuse avec <Message id="requiresRegen" />. La 3D de MellowCAD ne connaît que les solides et reste partielle.

## Options

### Orthographic

Demande le côté à regarder, <Keyword id="Top" /> par défaut, si bien qu'Entrée y donne la vue en plan : <Keyword id="Top" />, <Keyword id="Bottom" />, <Keyword id="Front" />, <Keyword id="BAck" />, <Keyword id="Left" /> ou <Keyword id="Right" />. Chacune est droite : la vue Haut montre X vers la droite et Y vers le haut, la vue Avant X vers la droite et Z vers le haut, et la vue Bas, vue d'en dessous, X vers la gauche. Tapé à la première invite, chaque côté fonctionne sans l'option.

Chacune oriente aussi le SCU face à vous, à partir des axes du SCG quel qu'ait été le SCU, avec son origine en `0,0,0`, comme le fait l'option orthogonale de <Command id="UCS" /> : après Avant, son plan XY est la face avant, si bien que ce que vous dessinez se trouve à plat sur l'écran, et le SCU s'appelle `*AVANT*`. Après Haut, il a les axes du SCG, et s'appelle `*HAUT*`.

### SWiso

Isométrique sud-ouest : regarde vers le bas depuis le coin avant gauche, en voyant l'avant, le côté gauche et le dessus. Le SCU reste tel quel. C'est la vue de la figure.

### SEiso

Isométrique sud-est : regarde vers le bas depuis le coin avant droit, en voyant l'avant, le côté droit et le dessus. Le SCU reste tel quel.

### NEiso

Isométrique nord-est : regarde vers le bas depuis le coin arrière droit, en voyant l'arrière, le côté droit et le dessus. Le SCU reste tel quel.

### NWiso

Isométrique nord-ouest : regarde vers le bas depuis le coin arrière gauche, en voyant l'arrière, le côté gauche et le dessus. Le SCU reste tel quel.

## Missing

Les vues nommées : <Keyword id="Orthographic" /> est la seule option que liste la première invite, là où celle d'AutoCAD liste aussi `?`, Supprimer, Rappel, Sauver, Paramètres et Fenêtre, et un nom tapé là est refusé. Le Gestionnaire de vues, que VUE ouvre dans AutoCAD. Sans rien de dessiné, une vue garde le zoom, là où AutoCAD cadre les limites du dessin. UCSORTHO et UCSBASE comme variables : une vue orthogonale aligne toujours le SCU, à partir des axes du SCG. Le SCU aligné dans la liste <Keyword command="UCS" id="Previous" /> de <Command id="UCS" />.

## Questions

### Comment avoir une vue isométrique dans AutoCAD ?

Tapez <Command id="-VIEW" />, puis <Keyword id="SWiso" /> pour l'isométrique sud-ouest ; <Keyword id="SEiso" />, <Keyword id="NEiso" /> et <Keyword id="NWiso" /> donnent les trois autres coins. Ou choisissez Isométrique SO dans le menu des vues en haut à gauche, ou cliquez sur un coin supérieur du ViewCube. <Command id="VSCURRENT" /> avec <Keyword command="VSCURRENT" id="Hidden" /> masque les arêtes situées derrière.

### Quelle est la commande de la vue de dessus ?

<Command id="-VIEW" />, puis <Keyword id="Top" />, qui met aussi le SCU sur les axes du SCG. <Command id="PLAN" /> regarde au contraire le SCU courant à la verticale, et le laisse tel quel.

### Pourquoi mon SCU a-t-il changé après une vue de face ?

Une vue orthogonale oriente le SCU face à vous, pour que ce que vous dessinez se trouve dans le plan de l'écran. <Command id="UCS" /> puis Entrée ramènent au SCG ; <Command id="U" /> défait la vue et son SCU ensemble.

### Une vue isométrique est-elle la même chose qu'un dessin isométrique ?

Non. Une vue isométrique regarde un modèle 3D depuis un coin. Un dessin isométrique est en 2D, dessiné sur les plans isométriques avec le style isométrique de RESOL, que MellowCAD n'a pas encore.

### Où est le Gestionnaire de vues ?

VUE lance <Command id="-VIEW" /> sur la ligne de commande : il n'y a pas de Gestionnaire de vues, et les vues nommées (Sauver, Rappel) ne sont pas encore là.
