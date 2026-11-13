---
title: "Commande PURGER (PURGE) dans AutoCAD"
description: "PURGER (PURGE, alias UR) d'AutoCAD en français supprime les blocs et types de ligne inutilisés : par nom ou tous, vérifiés un à un ou non, imbriqués compris."
figure: "Deux blocs, TAG placé sur un mur et BOX dont l'unique référence a été effacée : PURGER, tous les noms, sans vérification, ne supprime que BOX."
sourceHash: "7a22ff19d409"
---

PURGER (PURGE) supprime ce qu'un dessin définit mais n'utilise pas ; ici, ce sont les blocs et les types de ligne. Dans AutoCAD, PURGER ouvre la boîte de dialogue Purger ; MellowCAD n'en a pas, donc PURGER demande sur la ligne de commande ce que demande <Command id="-PURGE" />, comme le fait la console d'AutoCAD. Elle indique les paramètres Eléments imbriqués et Données orphelines, tous deux inactifs, et demande quel type d'objets non utilisés purger, en proposant <Keyword id="Blocks" /> et <Keyword id="LTypes" /> ; Entrée à cette invite la termine.

Un bloc est utilisé tant qu'une référence du dessin le place, ou que la définition d'un bloc utilisé le contient, à quelque profondeur que ce soit. Effacer la dernière référence d'un bloc laisse sa définition dans le dessin, où <Command id="INSERT" /> peut le placer de nouveau : c'est PURGER qui la supprime. Un bloc que contient un bloc conservé n'est jamais pris, et une chaîne de blocs qui ne font que se contenir les uns les autres part en une seule exécution. S'il n'y en a aucun à prendre, elle dit <Message id="noUnreferencedBlocks" />. Chaque exécution est une étape que <Command id="U" /> annule.

## Options

### Blocks

Demande les noms à purger, `*` par défaut pour tous les blocs inutilisés, ou des noms avec caractères génériques, séparés par des virgules. Demande ensuite s'il faut vérifier chaque nom : <Keyword id="Yes" />, par défaut, demande pour chaque bloc avant de le supprimer, <Keyword id="No" /> les supprime tous et dit chaque nom, et combien.

### LTypes

Demande les noms et s'il faut vérifier chacun, comme <Keyword id="Blocks" />, et supprime les types de ligne que rien n'utilise. Continuous, le type de ligne courant et ceux qu'utilise un calque ou un objet, dans un bloc aussi, restent toujours ; s'il n'y en a aucun à prendre, elle dit <Message id="noUnreferencedLinetypes" />. L'option <Keyword command="LINETYPE" id="Load" /> de <Command id="LINETYPE" /> en ramène un.

## Missing

La boîte de dialogue Purger, et tous les autres types : calques, styles de texte et de cote, groupes, matériaux, styles de ligne de repère multiple, de tableau et visuels, applications enregistrées, géométrie de longueur nulle, objets texte vides, données orphelines, et Tout. Les paramètres Eléments imbriqués et Données orphelines ne peuvent pas être modifiés.

## Questions

### Comment s'appelle la commande PURGE en français ?

PURGER, avec l'alias `UR`, puis Entrée ou la barre d'espace ; l'alias anglais `PU` n'existe pas dans AutoCAD en français. `-PU` est <Command id="-PURGE" />, la forme en ligne de commande, que PURGER lance ici aussi. `_PURGE` fonctionne dans toutes les langues d'AutoCAD.

### Comment purger les blocs inutilisés dans AutoCAD ?

Tapez `UR`, choisissez <Keyword id="Blocks" />, appuyez sur Entrée pour tous les noms et répondez <Keyword id="No" /> pour les supprimer tous sans demander pour chacun.

### Pourquoi je ne peux pas purger un bloc ?

Parce qu'il est utilisé : une référence du dessin le place, ou un bloc utilisé le contient, peut-être imbriqué sur plusieurs niveaux. Effacez ses références, ou décomposez les blocs qui le contiennent, et PURGER pourra le prendre.

### Comment purger les calques ?

Dans AutoCAD, avec le type Calques de PURGER. Pas encore ici, où PURGER purge les blocs et les types de ligne ; supprimez plutôt un calque vide dans le Gestionnaire des propriétés des calques.
