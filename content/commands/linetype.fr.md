---
title: "Commande TYPELIGNE (LINETYPE) dans AutoCAD"
description: "TYPELIGNE (LINETYPE, alias TL) d'AutoCAD en français : charger un type de ligne d'acadiso.lin, le type courant, DuCalque, et pourquoi un pointillé sort continu."
figure: "Une plaque dont le trou est dessiné avec HIDDEN courant et ses deux axes avec CENTER, puis TYPELIGNE remis à DuCalque."
sourceHash: "d15530a865c1"
---

TYPELIGNE (LINETYPE) règle le type de ligne avec lequel les nouveaux objets sont dessinés. AutoCAD ouvre le Gestionnaire des types de ligne ; MellowCAD n'en a pas encore, donc TYPELIGNE lance la forme en ligne de commande qu'AutoCAD a aussi, <Command id="-LINETYPE" />. Elle indique le type de ligne courant, `DuCalque` au départ, et redemande une option après chaque réponse, jusqu'à ce qu'Entrée la termine. DuCalque signifie que chaque objet prend le type de ligne de son calque ; un type de ligne nommé à la place est celui de l'objet lui-même. Toute l'exécution est une seule étape que <Command id="U" /> annule, et, tapée avec une apostrophe dans une commande, elle règle le type de ligne de ce que cette commande dessine ensuite.

Un dessin contient ses propres types de ligne, enregistrés avec lui et dans son DXF. Un nouveau dessin en a six : Continuous et, du fichier métrique d'AutoCAD acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM et DASHDOT ; les autres se chargent depuis acadiso.lin, et un DXF apporte les siens, ISO et complexes aussi, dont le texte, comme le `GAS` de GAS_LINE, est dessiné le long de la ligne. Un motif est posé sur chaque ligne comme AutoCAD le pose, centré sur sa longueur, avec des tirets égaux aux deux extrémités, mis à l'échelle par <Command id="LTSCALE" /> et par l'échelle du type de ligne propre à l'objet, que règlent <Command id="CHPROP" /> et la palette Propriétés et que CELTSCALE donne aux nouveaux objets.

## Options

### ?

Liste les types de ligne en deux colonnes, nom et description. À l'invite des options, elle demande quel fichier lister, acadiso.lin par défaut ou acad.lin, le fichier d'AutoCAD en pouces, et liste ses types de ligne dans l'ordre du fichier ; à l'invite de l'option <Keyword id="Set" />, ceux qui sont chargés dans le dessin et dont le nom correspond à ce que vous tapez, tous avec `*`, triés par nom.

### Load

Demande quels types de ligne charger, un nom ou plusieurs séparés par des virgules, caractères génériques compris (`DASH*`), puis dans quel fichier chercher, acadiso.lin au départ, puis celui où vous avez cherché en dernier. Chaque type trouvé est chargé et annoncé, dans l'ordre du fichier ; pour un type déjà chargé, elle demande d'abord, et <Keyword id="Yes" />, par défaut, le charge de nouveau. Un nom absent du fichier, ou un fichier autre qu'acadiso.lin et acad.lin, est signalé.

### Set

Demande le nom du type de ligne, en proposant le type courant ; tapez le nom d'un type de ligne chargé, ou <Keyword id="BYLayer" />. Un type qu'a acadiso.lin est d'abord chargé, comme le fait AutoCAD ; tout autre n'est pas trouvé, comme le dit AutoCAD, et l'invite des options revient. Entrée garde le type courant.

## Missing

Le Gestionnaire des types de ligne, et créer des types de ligne ou les charger depuis un fichier à vous. Les formes des types de ligne complexes comme BATTING ou ZIGZAG, dessinées comme les espaces qu'elles occupent. DuBloc. PSLTSCALE et MSLTSCALE, car il n'y a pas d'espace papier. L'acadiso.lin de l'AutoCAD de chaque langue, dont AutoCAD en français charge les noms (INTERROMPU) : <Keyword id="Load" /> lit l'anglais dans toutes les langues, bien qu'un dessin fait avec eux s'ouvre avec les siens. PLINEGEN : une nouvelle polyligne recommence son motif à chaque sommet, sauf si l'option <Keyword command="PEDIT" id="Ltype gen" /> de <Command id="PEDIT" /> l'active.

## Questions

### Comment s'appelle la commande LINETYPE en français ?

TYPELIGNE, avec les alias `TL`, `TYPEL` et `DDLTYPE`, puis Entrée ou la barre d'espace ; l'alias anglais `LT` n'existe pas dans AutoCAD en français. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_LINETYPE`.

### Pourquoi mes pointillés s'affichent en trait continu ?

Une ligne plus courte qu'une répétition de son motif est dessinée continue, comme dans AutoCAD : le motif de CENTER fait environ 51 unités à l'échelle par défaut. Augmentez ou diminuez <Command id="LTSCALE" /> pour adapter le motif au dessin. Vérifiez aussi que le type de ligne de l'objet, ou celui de son calque s'il est DuCalque, n'est pas Continuous.

### Comment changer le type de ligne d'un objet existant ?

Sélectionnez-le et choisissez le type de ligne dans la ligne Type de ligne de la palette Propriétés, ou copiez-le d'un autre objet avec <Command id="MATCHPROP" />. TYPELIGNE ne règle que le type de ligne des objets dessinés après.

### Comment changer l'échelle du type de ligne dans AutoCAD ?

Tapez <Command id="LTSCALE" /> et le nouveau facteur : 2 rend chaque tiret deux fois plus long, dans tout le dessin.

### Comment charger un type de ligne dans AutoCAD ?

AutoCAD en charge un dans le Gestionnaire des types de ligne. Ici, tapez `-TYPELIGNE`, choisissez <Keyword id="Load" />, tapez le nom du type de ligne, comme `HIDDEN2` ou `ACAD_ISO02W100`, et appuyez sur Entrée pour chercher dans acadiso.lin. <Keyword id="Set" /> charge un type qu'a acadiso.lin en le rendant courant.
