---
title: "Commande SCU (UCS) dans AutoCAD"
description: "Comment SCU (UCS) d'AutoCAD déplace et fait pivoter le système de coordonnées utilisateur : origine et 3 points, Objet, Vue, X, Y, Z, axeZ, Nommé, Général."
figure: "Une boîte vue du sud-est : SCU déplace l'origine sur son dessus, et un cercle dessiné ensuite en 30,20 se trouve sur la face supérieure, pas au sol."
sourceHash: "d70280c9f3cf"
---

SCU (UCS) définit le système de coordonnées utilisateur : une origine et des axes X et Y n'importe où dans l'espace, si bien que son plan XY peut s'incliner. Les coordonnées que vous tapez y sont lues, et ce que vous dessinez se trouve dans son plan XY : avec l'origine déplacée sur le dessus d'une boîte, un cercle de centre `30,20` se trouve sur le dessus. La commande dit d'abord le nom du SCU courant (`*GENERAL*`, `*AUCUN NOM*` ou le nom sous lequel il a été sauvé), puis demande la nouvelle origine ou une option ; Entrée y ramène au SCG, le système de coordonnées général. Un point est l'origine, avec son Z, et un point sans Z se trouve à l'élévation courante. Puis un point sur la partie positive de l'axe X et un point sur le plan XY, lus dans le SCU courant : Entrée à l'une ou l'autre de ces invites garde les axes tels quels. Un point déplace le SCU ; trois le font pivoter dans n'importe quelle direction.

Les commandes travaillent alors dans le plan XY du SCU : <Command id="LINE" /> et <Command id="CIRCLE" /> y dessinent, et <Command id="BOX" /> et <Command id="EXTRUDE" /> s'en élèvent le long de son Z. Chaque objet garde son propre plan quand le SCU change, et <Command id="PLAN" /> regarde le SCU courant à la verticale. Le SCU est enregistré dans le dessin, et chaque exécution est une seule étape d'annulation. La 3D de MellowCAD ne connaît que les solides et reste partielle.

## Options

### Face

Aligne le SCU sur une face d'un solide : la face sous le curseur s'éclaire et l'icône du SCU montre où irait le SCU, et un clic le prend, l'origine au point désigné et Z sortant du solide. X suit l'arête de la face la plus proche de l'endroit où le curseur y est entré, ou reste horizontal là où cette arête est verticale. Ensuite, <Keyword id="Next" /> passe à la face suivante derrière elle le long de votre ligne de visée (sur une arête, à son autre face), <Keyword id="Xflip" /> et <Keyword id="Yflip" /> font faire au SCU un demi-tour autour de son axe X ou Y, et Entrée l'accepte. Un point sous lequel il n'y a aucune face de solide affiche <Message id="noSolidSurfaceOrMesh" />, et SCU se termine.

### NAmed

Les SCU sauvés, par nom. <Keyword id="Save" /> enregistre le SCU courant, en demandant <Keyword id="Yes" /> ou <Keyword id="No" /> avant de remplacer un nom déjà sauvé ; <Keyword id="Restore" /> rend courant un SCU sauvé, son nom tapé en majuscules ou en minuscules ; <Keyword id="Delete" /> accepte des noms, avec des virgules et des caractères génériques ; <Keyword id="?" /> les liste, chacun avec son origine et ses axes. Un nom peut contenir des espaces, mais pas `<>/\":;|,=*?` ni d'accent grave : <Message id="invalidUcsName" />.

### OBject

Aligne le SCU sur un objet que vous sélectionnez : une ligne, un cercle, un arc, une ellipse, une polyligne, une spline, un texte, un texte multiligne, une définition d'attribut ou une référence de bloc. L'origine et l'axe X vont là où AutoCAD les place pour chaque type, et le Z est la normale de l'objet lui-même, si bien que le SCU se trouve dans le plan de l'objet. Un objet sur un calque verrouillé peut être sélectionné. Des hachures affichent <Message id="ucsNoCoordinateSystem" />, et SCU se termine avec le SCU tel qu'il était.

### Previous

Revient au SCU précédent, jusqu'à dix en arrière dans une session, y compris les SCU nommés et orthogonaux. Quand il n'en reste plus : <Message id="noPreviousUcs" />.

### View

Place le plan XY perpendiculairement à votre ligne de visée, X le long de l'horizontale de l'écran, en gardant l'origine : un texte dessiné ensuite se lit à plat sur l'écran d'une vue 3D.

### World

Retour au système de coordonnées général (SCG), qui ne bouge jamais. C'est l'option par défaut de la première invite, qu'Entrée choisit donc, et elle remet aussi l'élévation à 0.

### X

Fait pivoter le SCU autour de son axe X : 90 degrés par défaut, un angle tapé, ou un point qui le donne. Un angle positif le fait pivoter selon la règle de la main droite : 90 dresse donc le plan XY sur l'ancien axe X.

### Y

Fait pivoter le SCU autour de son axe Y, comme <Keyword id="X" /> autour de X.

### Z

Fait pivoter le SCU autour de son axe Z, comme <Keyword id="X" /> autour de X : 30 fait tourner X et Y de 30 degrés dans le sens trigonométrique, vus du dessus.

### ZAxis

Une nouvelle origine, Entrée gardant l'origine courante, puis un point sur la partie positive de l'axe Z : le plan XY lui est perpendiculaire, son X gardé horizontal par rapport au plan XY général. Deux points confondus affichent <Message id="pointsAreCoincident" />. Son option <Keyword id="Object" /> accepte une ligne, un arc, une polyligne ouverte ou une spline : l'origine à l'extrémité la plus proche du point désigné, le Z le long de l'objet, pointant vers l'extérieur.

## Missing

<Keyword id="Face" /> sur les surfaces et les maillages, que MellowCAD n'a pas, et ses modes fenêtre et trajet sur un solide. Appliquer et SEction, que la première invite accepte et qui sont refusées ici, puisqu'il n'y a qu'une fenêtre et pas d'objets de coupe. La boîte de dialogue SCU (GESTSCU), les poignées de l'icône et son menu contextuel, et l'icône montrant le nouveau SCU pendant que vous le placez. Le réticule qui tourne avec le SCU : il reste droit à l'écran jusqu'à ce que <Command id="PLAN" /> aligne la vue sur lui. UCSFOLLOW et UCSVP. <Keyword id="OBject" /> sur une cote, et Groupe à sa désignation. La profondeur que garde un SCU orthogonal. La pause, Appuyez sur ENTREE pour continuer, dans une longue liste.

## Questions

### Comment revenir au SCU général dans AutoCAD ?

Lancez SCU et appuyez sur Entrée : <Keyword id="World" /> est l'option par défaut. Pour regarder de nouveau le dessin à la verticale, lancez <Command id="PLAN" /> et choisissez <Keyword command="PLAN" id="World" />.

### Comment faire pivoter le SCU ?

Lancez SCU, choisissez <Keyword id="Z" /> et tapez l'angle : `30` fait tourner X et Y de 30 degrés dans le sens trigonométrique. <Keyword id="X" /> et <Keyword id="Y" /> redressent le plan XY, de 90 degrés par défaut.

### Quelle est la différence entre le SCU et le SCG ?

Le système de coordonnées général (SCG) ne bouge jamais ; le système de coordonnées utilisateur (SCU) est celui que vous déplacez et faites pivoter. Au départ, ils sont identiques, et SCU dit que le SCU courant est `*GENERAL*`. Les coordonnées que vous tapez sont lues dans le SCU, et ce que vous dessinez se trouve dans son plan XY.

### Comment dessiner sur une face d'un solide 3D ?

Amenez-y le SCU. SCU, <Keyword id="Face" />, puis cliquez sur la face et appuyez sur Entrée : le SCU s'y pose, Z sortant du solide. Sur le dessus d'une boîte, l'origine seule suffit aussi : SCU, puis un coin du dessus, puis Entrée, comme dans la figure. Dessinez ensuite : ce que vous dessinez se trouve sur la face.
