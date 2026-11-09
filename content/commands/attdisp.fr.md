---
title: "Commande ATTECRAN (ATTDISP) dans AutoCAD"
description: "Afficher ou masquer les attributs dans AutoCAD en français : ATTECRAN (ATTDISP), Normal, Actif ou Inactif, enregistré avec le dessin. Essayez-le gratuitement."
figure: "Deux bureaux dont les numéros de référence sont des attributs invisibles : ATTECRAN Actif les affiche sous chaque bureau, à côté des numéros visibles."
sourceHash: "8821fdeb2077"
---

ATTECRAN (ATTDISP en anglais) définit quels attributs affichent les références de bloc du dessin. Elle demande le paramètre, en proposant le paramètre courant, Normal dans un nouveau dessin ; tout autre mot est signalé comme option incorrecte et la question revient, et Entrée conserve le paramètre. Un changement redessine tout le dessin, `Régénération du modèle.` comme le dit AutoCAD 2027, et est enregistré avec le dessin dans ATTMODE, une étape que <Command id="U" /> annule. Tapée avec une apostrophe à l'intérieur d'une commande, elle s'y exécute aussi.

Elle ne change que ce qui s'affiche : un attribut invisible garde sa valeur, et un attribut masqué peut toujours être modifié avec <Command id="ATTEDIT" /> ou <Command id="EATTEDIT" />.

## Options

### Normal

Affiche chaque attribut tel qu'il a été défini : les attributs visibles, et non ceux définis avec le mode <Keyword command="ATTDEF" id="Invisible" /> d'<Command id="ATTDEF" />.

### ON

Affiche tous les attributs, les invisibles aussi.

### OFF

Masque tous les attributs, les visibles aussi.

## Questions

### Comment afficher les attributs invisibles dans AutoCAD ?

Tapez `ATTECRAN` et choisissez <Keyword id="ON" /> : tous les attributs s'affichent, les invisibles aussi. <Keyword id="Normal" /> les masque de nouveau.

### Pourquoi les attributs de mon bloc ne s'affichent pas ?

<Command id="ATTDISP" /> est peut-être sur <Keyword id="OFF" />, qui masque tous les attributs, ou sur <Keyword id="Normal" /> avec des attributs définis comme invisibles. Choisissez <Keyword id="ON" /> pour les voir tous. Une référence dont le bloc n'a pas d'attributs n'en affiche aucun, quel que soit le paramètre.

### Comment masquer les valeurs d'attribut dans AutoCAD ?

Définissez-les invisibles : le mode <Keyword command="ATTDEF" id="Invisible" /> d'<Command id="ATTDEF" />, avant de créer le bloc. ATTECRAN <Keyword id="OFF" /> masque tous les attributs à la fois, dans tout le dessin.
