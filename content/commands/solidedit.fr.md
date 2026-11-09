---
title: "Commande EDITSOLIDE (SOLIDEDIT) dans AutoCAD"
description: "Comment EDITSOLIDE (SOLIDEDIT) d'AutoCAD modifie les faces d'un solide 3D : extruder, déplacer, faire pivoter, décaler, effiler, supprimer, copier. Essayez-le."
figure: "La face supérieure d'une boîte extrudée de 15 vers le haut avec un angle d'extrusion de 15 degrés par EDITSOLIDE : un tronc de pyramide sur la boîte, vu du sud-est."
sourceHash: "775cdc271d4f"
---

EDITSOLIDE (SOLIDEDIT) modifie un solide 3D par ses faces. Elle dit si chaque modification est vérifiée, puis demande quoi modifier : <Keyword id="Face" />, puis l'option de face, puis les faces, puis ce dont l'option a besoin. Chaque modification est faite aussitôt, et les options de face sont redemandées : une même exécution peut donc faire plusieurs modifications ; <Keyword id="eXit" /> ou Entrée quitte les options de face, puis la commande. Les faces voisines suivent : déplacez le dessus d'une boîte vers le haut et ses côtés s'allongent pour le rejoindre.

Le solide garde son calque et ses propriétés, mais perd ce qui l'a créé : une boîte n'est plus une boîte. Toute l'exécution est une seule étape d'annulation, et son option <Keyword id="Undo" /> y défait les modifications une à une. Entrée à l'invite `Commande:` la relance depuis la première question. Le bouton des faces du groupe de fonctions Edition de solides lance directement chaque option de face. La 3D de MellowCAD ne connaît que les solides et reste partielle.

## Options

### Face

Les options de face. Chacune demande des faces, jusqu'à Entrée : un clic ou un point tapé prend la face la plus proche de vous sous ce point, ou les deux faces d'une arête qui s'y trouve, et une face déjà prise donne celle qui est derrière. Une fois une face prise, <Keyword id="ALL" /> prend toutes les faces de son solide ; <Keyword id="Remove" /> retire au contraire des faces du jeu, et <Keyword id="Undo" /> défait la dernière désignation. Un clic dans le vide dit <Message id="noSolidsDetected" />. Les faces d'un seul solide.

### Extrude

Demande une hauteur et un angle d'extrusion : chaque face s'allonge en un prisme, ajouté au solide ou, avec une hauteur négative, retiré de celui-ci, qui se rétrécit en montant avec un angle positif. Entrée à l'invite de la hauteur prend la dernière hauteur utilisée par les primitives ou par <Command id="EXTRUDE" />.

### Move

Demande un point de base et un second point : une face plane se déplace d'autant que ce trajet avance le long de sa normale, ses voisines entraînées avec elle. Entrée au second point prend le point de base comme déplacement.

### Rotate

Demande un axe, par deux points ou le long de l'<Keyword id="Xaxis" />, de l'<Keyword id="Yaxis" /> ou de l'<Keyword id="Zaxis" /> du SCU, ou perpendiculaire à l'écran avec <Keyword id="View" />, puis un angle : la face pivote autour de cet axe selon la règle de la main droite.

### Offset

Demande une distance : la face se déplace vers l'extérieur le long de sa normale, ou vers l'intérieur avec une distance négative, ses voisines entraînées avec elle, les faces courbes aussi autour de leur axe. Un décalage vers l'intérieur égal à la moitié du plus grand côté de la boîte qui englobe le solide est refusé, et la commande dit jusqu'où il peut aller.

### Taper

Demande un point de base, un point le long de l'axe d'effilage et un angle : la face s'incline autour de la ligne où elle rencontre le plan passant par le point de base, un angle positif l'inclinant vers l'intérieur le long de l'axe.

### Delete

Supprime la paroi d'un trou, ce qui ferme le trou, ou la bande d'un raccord ou d'un chanfrein, ce qui rend l'arête qu'elle remplaçait.

### Copy

Crée une région de chaque face plane, à sa place ou déplacée par deux points, sur le calque courant et avec les propriétés courantes.

### Undo

Aux options de face, défait la dernière modification de cette exécution ; quand il n'en reste plus, <Message id="commandCompletelyUndone" />.

### eXit

Quitte les options de face pour revenir à la première question, et celle de cette question quitte la commande ; Entrée fait de même.

## Missing

<Keyword id="Edge" /> et <Keyword id="Body" />, ainsi que la <Keyword id="coLor" /> et le <Keyword id="mAterial" /> des faces, qui sont proposés puis refusés, comme le <Keyword id="Path" /> de l'extrusion, l'axe par objet de la rotation et son angle de <Keyword id="Reference" />. Capture, Trajet et CPolygone pour sélectionner des faces. Déplacer, faire pivoter, effiler ou copier une face courbe, en décaler une parmi d'autres voisines, en supprimer une qui n'est ni la paroi d'un trou ni une bande, et une modification qui change tant la forme du solide qu'une face en fait disparaître une autre. Les modifications à côté d'une face extrudée avec un angle d'extrusion. Un décalage vers l'extérieur trop grand pour être fait, qu'AutoCAD abandonne sans rien dire et que MellowCAD fait. Un aperçu pendant que vous indiquez une distance ou un angle.

## Questions

### Comment modifier un solide 3D dans AutoCAD ?

Lancez EDITSOLIDE, choisissez <Keyword id="Face" />, puis l'action : <Keyword id="Extrude" /> ou <Keyword id="Move" /> sur une face pour rendre le solide plus haut, <Keyword id="Delete" /> pour boucher un trou, <Keyword id="Taper" /> pour incliner un côté. Désignez les faces, appuyez sur Entrée et répondez aux invites de l'option. Pour pousser ou tirer rapidement, <Command id="PRESSPULL" /> fait aussi glisser une face.

### Comment extruder une face d'un solide 3D ?

EDITSOLIDE, <Keyword id="Face" />, <Keyword id="Extrude" />, désignez la face et appuyez sur Entrée, puis la hauteur et l'angle d'extrusion : les `15` et `15` de la figure élèvent un tronc de pyramide sur le dessus d'une boîte.

### Comment supprimer un trou dans un solide ?

EDITSOLIDE, <Keyword id="Face" />, <Keyword id="Delete" />, désignez la paroi du trou et appuyez sur Entrée : le trou est bouché. La même option enlève un raccord ou un chanfrein.

### Quelle est la différence entre EDITSOLIDE et APPTIRER ?

<Command id="PRESSPULL" /> déplace une face par un glissement ou une distance, perpendiculairement à elle-même. EDITSOLIDE fait cela et plus encore : la commande effile, fait pivoter, décale, supprime et copie des faces, plusieurs à la fois.
