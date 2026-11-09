---
title: "Commande TYPELIGNE (LINETYPE) dans AutoCAD"
description: "TYPELIGNE (LINETYPE, alias TL) d'AutoCAD en français : le type de ligne des nouveaux objets, DuCalque, et pourquoi des pointillés sortent continus. Essayez-le."
figure: "Une plaque dont le trou est dessiné avec HIDDEN courant et ses deux axes avec CENTER, puis TYPELIGNE remis à DuCalque."
sourceHash: "1cae7261efc0"
---

TYPELIGNE (LINETYPE) règle le type de ligne avec lequel les nouveaux objets sont dessinés. AutoCAD ouvre le Gestionnaire des types de ligne ; MellowCAD n'en a pas encore, donc TYPELIGNE lance la forme en ligne de commande qu'AutoCAD a aussi, <Command id="-LINETYPE" />. Elle indique le type de ligne courant, `DuCalque` au départ, et redemande une option après chaque réponse, jusqu'à ce qu'Entrée la termine. DuCalque signifie que chaque objet prend le type de ligne de son calque ; un type de ligne nommé à la place est celui de l'objet lui-même. Toute l'exécution est une seule étape que <Command id="U" /> annule, et, tapée avec une apostrophe dans une commande, elle règle le type de ligne de ce que cette commande dessine ensuite.

Chaque dessin a six types de ligne chargés : Continuous et, du fichier métrique d'AutoCAD acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM et DASHDOT. Un motif est posé sur chaque ligne comme AutoCAD le pose, centré sur sa longueur, avec des tirets égaux aux deux extrémités.

## Options

### ?

Liste les types de ligne en deux colonnes, nom et description. À l'invite des options, les types de ligne d'acadiso.lin ; à l'invite de l'option <Keyword id="Set" />, ceux qui sont chargés dans le dessin et dont le nom correspond à ce que vous tapez, tous avec `*`.

### Set

Demande le nom du type de ligne, en proposant le type courant ; tapez le nom d'un type de ligne chargé, ou <Keyword id="BYLayer" />. Un nom qui n'est pas chargé n'est pas trouvé, comme le dit AutoCAD, et l'invite des options revient ; Entrée garde le type courant.

## Missing

Le Gestionnaire des types de ligne, et charger, créer ou décrire des types de ligne : seuls les six ci-dessus existent, et la liste ne décrit que Continuous. Une échelle de type de ligne par objet (CELTSCALE) : seulement celle du dessin, <Command id="LTSCALE" />. DuBloc. PSLTSCALE et MSLTSCALE, car il n'y a pas d'espace papier. Les noms de types de ligne d'AutoCAD en espagnol : ils sont ici en anglais dans toutes les langues. PLINEGEN : une nouvelle polyligne recommence son motif à chaque sommet, sauf si l'option <Keyword command="PEDIT" id="Ltype gen" /> de <Command id="PEDIT" /> l'active.

## Questions

### Comment s'appelle la commande LINETYPE en français ?

TYPELIGNE, avec les alias `TL`, `TYPEL` et `DDLTYPE`, puis Entrée ou la barre d'espace ; l'alias anglais `LT` n'existe pas dans AutoCAD en français. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_LINETYPE`.

### Pourquoi mes pointillés s'affichent en trait continu ?

Une ligne plus courte qu'une répétition de son motif est dessinée continue, comme dans AutoCAD : le motif de CENTER fait environ 51 unités à l'échelle par défaut. Augmentez ou diminuez <Command id="LTSCALE" /> pour adapter le motif au dessin. Vérifiez aussi que le type de ligne de l'objet, ou celui de son calque s'il est DuCalque, n'est pas Continuous.

### Comment changer le type de ligne d'un objet existant ?

Sélectionnez-le et choisissez le type de ligne dans la ligne Type de ligne de la palette Propriétés, ou copiez-le d'un autre objet avec <Command id="MATCHPROP" />. TYPELIGNE ne règle que le type de ligne des objets dessinés après.

### Comment changer l'échelle du type de ligne dans AutoCAD ?

Tapez <Command id="LTSCALE" /> et le nouveau facteur : 2 rend chaque tiret deux fois plus long, dans tout le dessin.
