---
title: "Commande PROPMECA (MASSPROP) dans AutoCAD"
description: "Comment PROPMECA (MASSPROP) d'AutoCAD en français mesure solides 3D et régions : volume, aire, centre de gravité, moments d'inertie, fichier .mpr. Essayez-le."
figure: "Une boîte de 60 par 40 par 25 à l'origine : PROPMECA écrit son volume, sa zone de contour, son centre de gravité et ses moments, et Entrée refuse le fichier."
sourceHash: "a0286a5d599e"
---

PROPMECA (MASSPROP) mesure les solides 3D et les régions. Sélectionnez-les et appuyez sur Entrée : le rapport s'écrit sur la ligne de commande, dans les colonnes d'AutoCAD, puis elle demande s'il faut l'écrire dans un fichier. Un jeu sans solide ni région dit <Message id="massPropNoneSelected" />, et elle se termine.

Pour les solides, le jeu est mesuré comme un seul corps de densité 1, donc la masse est le volume : masse, volume, zone de contour, centre de gravité, moments d'inertie, produits d'inertie et rayons de giration, tous par rapport au SCU courant, puis les moments principaux autour du centre de gravité, avec leurs directions. Des solides qui se chevauchent sont comptés deux fois. Pour les régions dans le plan XY du SCU : aire, périmètre, zone de contour, centre de gravité, moments et produit d'inertie, rayons de giration et moments principaux ; une région hors de ce plan ne donne que son aire, son périmètre, sa zone de contour et son centre de gravité. Les régions viennent d'abord, puis les solides ; les régions hors du plan de la première sont écartées et comptées. Les nombres s'écrivent à la précision du dessin, réglée avec <Command id="UNITS" />, et ils sont exacts, ceux des solides intégrés face par face. PROPMECA ne change rien au dessin ; elle se tape, comme dans AutoCAD, dont le ruban n'a pas de bouton pour elle.

## Options

### Yes

À la question du fichier, dont la valeur par défaut est <Keyword id="No" /> : écrit le rapport dans un fichier, comme AutoCAD l'écrit, ligne pour ligne. Dans AutoCAD, une boîte de dialogue demande où ; dans un navigateur, le téléchargement tient lieu de cette boîte de dialogue, et le fichier porte le nom du dessin, en `.mpr`.

## Missing

Les unités après chaque nombre avec des unités Architecture ou Ingénierie (`sq in`, `cu in`, `lb`), qu'AutoCAD écrit : ici, aucune unité ne suit un nombre. Le choix du nom du fichier, et la question avant d'en remplacer un. Loin de l'origine, AutoCAD écrit les grands nombres en notation exponentielle et perd des chiffres, et son dernier chiffre peut différer à cause de son propre arrondi : ceux de MellowCAD sont exacts. Pour un solide à deux moments principaux égaux, la paire de directions que choisit l'arrondi d'AutoCAD.

## Questions

### Comment calculer le volume d'un solide 3D dans AutoCAD ?

Lancez PROPMECA, sélectionnez le solide et appuyez sur Entrée : Volume est la deuxième ligne du rapport. La boîte de 60 par 40 par 25 de la figure donne 60000. Appuyez sur Entrée à la question du fichier pour terminer.

### Comment trouver le centre de gravité d'une forme ?

Faites-en une région avec <Command id="REGION" />, ou un solide, puis lancez PROPMECA et sélectionnez-la : Centre de gravité donne son X et son Y, et son Z pour un solide, dans le SCU courant.

### Pourquoi PROPMECA dit qu'aucun solide ni région n'est sélectionné ?

Ce que vous avez sélectionné n'est ni l'un ni l'autre : les lignes, polylignes, cercles et hachures n'ont pas de propriétés mécaniques, et un bloc qui contient un solide n'est pas un solide. Transformez les formes fermées en régions avec <Command id="REGION" />, ou en solides avec <Command id="EXTRUDE" />.

### Pourquoi la masse est égale au volume ?

PROPMECA mesure avec une densité de 1, comme AutoCAD : les solides n'ont pas de matériau ici. Multipliez le volume par la densité du matériau pour obtenir sa masse réelle.
