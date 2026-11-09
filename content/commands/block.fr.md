---
title: "Commande BLOC (BLOCK) dans AutoCAD"
description: "Créer un bloc dans AutoCAD en français : BLOC (BLOCK, alias B), un nom, un point de base et les objets ; redéfinir un bloc, les attributs. Essayez-le."
figure: "Une chaise, un rectangle et une ligne, transformée en bloc B1 : son nom, un point de base au milieu de son bord avant, les deux objets désignés."
sourceHash: "ca24f209008c"
---

BLOC (BLOCK en anglais) enregistre un ensemble d'objets dans le dessin sous un nom, afin qu'<Command id="INSERT" /> puisse le placer de nouveau autant de fois que vous le voulez, chaque copie étant une référence à cette définition unique. Elle demande un nom, puis le point de base de l'insertion — le point par lequel chaque référence est placée —, puis les objets. Entrée termine la sélection et définit le bloc, et les objets désignés deviennent une référence à celui-ci, là où ils étaient. Toute la commande forme une seule étape d'annulation.

Le BLOC d'AutoCAD ouvre la boîte de dialogue Définition de bloc, que MellowCAD n'a pas : ici, BLOC demande à la ligne de commande ce que demande <Command id="-BLOCK" />, comme le fait la console d'AutoCAD. Un nom peut contenir des espaces et jusqu'à 255 caractères, mais aucun des caractères `< > / \ " : ; ? * | , =` ni l'accent grave : Entrée seule ou un tel nom affiche <Message id="invalidNewBlockName" /> et la question revient. Un nom que le dessin a déjà, quelle que soit la casse, fait demander s'il faut redéfinir ce bloc, <Keyword id="Yes" /> ou <Keyword id="No" /> (la valeur par défaut, qui termine la commande).

## Options

### ?

Liste les blocs du dessin : elle demande lesquels lister, `*` pour tous par défaut ou un nom avec des caractères génériques, écrit les noms qui correspondent et le nombre de chaque type, puis termine. Les blocs anonymes, comme ceux d'un réseau, sont comptés, jamais nommés.

## Missing

La boîte de dialogue Définition de bloc d'AutoCAD : BLOC demande à la ligne de commande. Au point de base, les options Annotatif et Mode (Conserver, Supprimer) : les objets sont toujours convertis en référence. ATTREQ 0, qui saute la boîte des valeurs d'attribut, et ATTSYNC, ATTREDEF, BATTMAN et BATTORDER : un bloc redéfini laisse les attributs de ses références tels qu'ils étaient, comme le fait AutoCAD. DuBloc : un objet à l'intérieur d'un bloc ne peut pas prendre la couleur, le type de ligne ou l'épaisseur de ligne propres à la référence, comme le fait dans AutoCAD un objet dessiné DuBloc. Dans un SCU tourné, AutoCAD 2027 déplace les objets qu'il convertit ; ici, ils restent là où ils étaient, volontairement.

## Questions

### Comment s'appelle la commande BLOCK en français ?

BLOC, raccourci `B`, puis Entrée ou la barre d'espace. Dans AutoCAD, elle ouvre la boîte de dialogue Définition de bloc ; ici, elle demande à la ligne de commande, comme `-B` (<Command id="-BLOCK" />). Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_BLOCK`.

### Comment créer un bloc dans AutoCAD ?

Tapez `B`, un nom, puis désignez le point de base — un coin, ou le milieu du bord sur lequel le bloc reposera — et sélectionnez les objets. Entrée définit le bloc et transforme les objets en une référence à celui-ci. Une sélection faite avant la commande est prise aussi, après le point de base.

### Comment redéfinir un bloc ?

Lancez BLOC avec le nom du bloc et répondez <Keyword id="Yes" />, puis donnez un point de base et sélectionnez les nouveaux objets : chaque référence au bloc affiche la nouvelle définition. Les objets ne peuvent pas inclure une référence au bloc lui-même ; un tel jeu est refusé et la commande se termine.

### Comment faire un bloc avec des attributs ?

Définissez d'abord les attributs avec <Command id="ATTDEF" />, puis sélectionnez-les avec les autres objets : ils entrent dans le bloc dans l'ordre où vous les désignez. La référence qui les remplace ouvre une boîte avec un champ pour chaque attribut, libellé par son message d'invite et rempli de sa valeur par défaut : Entrée applique les valeurs, Echap garde les valeurs par défaut.

### Comment exploser (décomposer) un bloc ?

<Command id="EXPLODE" /> retransforme une référence en ses objets, un niveau d'imbrication à la fois, chacun sur son propre calque et dans sa propre couleur. Les attributs redeviennent leurs définitions ; les valeurs sont perdues.
