---
title: "Commande INSERM (MINSERT) dans AutoCAD"
metaTitle: "Commande INSERM (MINSERT) dans AutoCAD"
description: "Comment INSERM (MINSERT) d'AutoCAD insère un bloc en rangées et colonnes comme un seul objet, ce qu'elle demande et pourquoi DECOMPOSER le refuse."
figure: "Un siège transformé en bloc, puis placé par INSERM en trois rangées de cinq : un seul objet."
sourceHash: "d43a50bbc8fe"
---

INSERM (MINSERT en anglais) insère plusieurs fois un bloc défini dans le dessin, en rangées et colonnes, comme un seul objet. Elle demande ce que demande <Command id="-INSERT" /> — le nom du bloc (Entrée prend celui proposé, le dernier bloc inséré), le point d'insertion, les facteurs d'échelle X et Y et l'angle de rotation —, puis le nombre de rangées et le nombre de colonnes (Entrée vaut 1), puis la distance entre les rangées et la distance entre les colonnes. Seules les distances dont les nombres ont besoin sont demandées, et une rangée d'une colonne est une référence de bloc ordinaire. Un bloc avec des attributs demande leurs valeurs en dernier, une fois, et chaque copie les affiche.

Les rangées suivent l'axe Y du bloc et les colonnes son axe X, tous deux tournés par la rotation ; les distances sont en unités de dessin, quelle que soit l'échelle, et une distance négative place les copies vers le bas ou vers la gauche. À la distance entre les rangées, deux points spécifient plutôt une cellule d'unité : sa largeur est la distance entre les colonnes et sa hauteur la distance entre les rangées. Le résultat est le bloc inséré plusieurs fois d'AutoCAD : il se déplace, se copie, tourne, change d'échelle et se symétrise d'un bloc, <Command id="LIST" /> ajoute ses rangées et colonnes, et la palette Propriétés les affiche comme Colonnes, Espacement des colonnes, Rangées et Espacement des rangées, que l'on peut saisir. <Command id="EXPLODE" /> le compte comme inséré plusieurs fois et le laisse entier, comme AutoCAD. Un DXF l'ouvre et l'enregistre comme AutoCAD lui-même.

## Options

### ?

Au nom du bloc : liste les blocs du dessin, comme le fait <Command id="BLOCK" />, et termine.

### Scale

Au point d'insertion : demande un seul facteur pour les deux axes, puis redemande le point. Après le point, les facteurs X et Y ne sont pas demandés.

### Rotate

Au point d'insertion : demande l'angle, qui tourne chaque copie et tout le réseau, puis redemande le point. Après le point, la rotation n'est pas demandée.

## Missing

Au point d'insertion, Pointdebase, X, Y et Z, et à l'échelle X, Coin et XYZ, comme il en manque à -INSERER ; le `~` qui ouvre un fichier de dessin ; les blocs annotatifs, qui n'existent pas ici. Une cote linéaire sélectionne l'INSERM entier, pas un objet de l'une de ses copies. Les lignes Annotatif, Unité de bloc et Facteur d'unité de la palette Propriétés.

## Questions

### Qu'est-ce que la commande INSERM dans AutoCAD ?

L'insertion multiple : elle place un bloc dans un réseau rectangulaire de rangées et de colonnes, comme un seul objet. Modifiez ensuite les nombres ou l'espacement dans la palette Propriétés.

### Comment décomposer un bloc inséré avec INSERM ?

C'est impossible : <Command id="EXPLODE" /> répond qu'il a été inséré plusieurs fois et le laisse, dans AutoCAD comme ici, même avec ses rangées et colonnes à 1. Insérez de nouveau le bloc avec <Command id="-INSERT" />, ou placez les copies avec <Command id="ARRAYRECT" />, dont le réseau se décompose en ses éléments.

### Comment s'appelle MINSERT dans AutoCAD en français ?

INSERM. Elle n'a ni alias ni bouton dans le ruban : tapez-la en entier ; `_MINSERT` fonctionne dans toutes les langues d'AutoCAD.

### Quelle est la différence entre INSERM et RESEAU ?

INSERM répète un bloc comme une seule référence que l'on ne peut pas décomposer. <Command id="ARRAYRECT" /> répète n'importe quels objets en un réseau associatif, avec des poignées pour changer ses nombres et son espacement, que <Command id="EXPLODE" /> décompose.
