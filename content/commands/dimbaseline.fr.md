---
title: "Commande COTLIGN (DIMBASELINE) dans AutoCAD"
description: "Cotes de ligne de base dans AutoCAD en français : COTLIGN (DIMBASELINE, alias COTL) les empile depuis une même base, invite par invite. Essayez-le gratuitement."
figure: "Un profil en escalier coté 30 depuis son bord gauche, puis 70 et 100 depuis le même bord, chaque cote une ligne plus loin."
sourceHash: "cd7902f90b59"
---

COTLIGN (DIMBASELINE en anglais) dessine des cotes qui mesurent toutes à partir d'une même ligne d'attache, la base : chacune va de la première ligne d'attache de la dernière cote au point suivant que vous donnez, sa ligne de cote un cran plus loin. Elle part de la dernière cote linéaire ou alignée créée depuis l'ouverture du dessin, si bien qu'elle suit généralement <Command id="DIMLINEAR" /> ou <Command id="DIMALIGNED" /> ; s'il n'y en a aucune, elle demande de quelle cote partir. La ligne de commande indique chaque mesure dès qu'elle est faite. Entrée à l'invite de l'origine choisit <Keyword id="Select" />, et Entrée à cette invite termine la commande, comme Echap.

Le cran est l'espacement des lignes de base du style de cote courant, 3.75 dans ISO-25, multiplié par l'échelle générale de la base. Comme dans AutoCAD, chaque nouvelle cote mesure selon la direction de sa base, et prend le style de cote et le calque de la base, avec la couleur, le type de ligne et l'épaisseur de ligne courants.

## Options

### Select

Demande la cote de base : désignez une cote linéaire ou alignée, près de la ligne d'attache à partir de laquelle mesurer. Un point tapé à cette invite désigne aussi. Une cote de rayon ou de diamètre est refusée avec <Message id="associativeDimensionRequired" />, et la question revient.

### Undo

Annule la dernière cote créée et repart de la précédente, autant de fois qu'il y en a. Quand il n'en reste plus, sa réponse est <Message id="commandCompletelyUndone" />, et l'invite reste.

## Missing

Une cote n'est pas associative : les cotes ne suivent pas les objets qu'elles mesurent. Une cote angulaire ne peut pas servir de base : AutoCAD prend celle qui a été créée en dernier ou désignée ; ici, si elle est la dernière créée, la commande demande une cote, et si elle est désignée, elle est refusée comme une cote de rayon. Les cotes de coordonnées n'existent pas encore.

## Questions

### Comment s'appelle la commande DIMBASELINE en français ?

COTLIGN, raccourci `COTL`, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_DIMBASELINE`.

### Comment changer l'espacement des cotes de ligne de base ?

C'est l'espacement des lignes de base du style de cote : <Command id="DIMSTYLE" /> (`CST`) ouvre les styles dans la palette Styles, où il se trouve sous Lignes, comme dans AutoCAD. Les cotes déjà dessinées gardent leur place ; <Command id="DIMSPACE" /> les espace de nouveau, régulièrement.

### Comment partir d'une autre cote ?

Appuyez sur Entrée à la première invite, ou choisissez <Keyword id="Select" />, et désignez la cote près de la ligne d'attache à partir de laquelle mesurer : chaque nouvelle cote part de là.

### Quelle est la différence entre COTLIGN et COTCONT ?

COTLIGN mesure chaque cote à partir de la même ligne d'attache, chacune sur une ligne plus éloignée. <Command id="DIMCONTINUE" /> les met bout à bout sur une même ligne, chacune à partir de l'endroit où la précédente s'est arrêtée.
