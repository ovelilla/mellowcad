---
title: "Commande TEXTE (TEXT) dans AutoCAD"
description: "Comment fonctionne TEXTE (TEXT, alias T) d'AutoCAD en français, invite par invite : point de départ, hauteur, rotation, Justifier et Style, un objet par ligne."
figure: "Deux lignes de texte, centrées dans un cadre et justifiées milieu centre : chaque ligne est un objet à part entière."
sourceHash: "44d0e1a420a7"
---

TEXTE (TEXT) écrit du texte sur une ligne. Vous indiquez un point de départ, une hauteur et un angle de rotation, puis vous tapez une ligne et appuyez sur Entrée : la ligne devient un objet à part entière, et la suivante commence une ligne plus bas. Une ligne vide termine la commande. Un clic ailleurs avant cela fait commencer les lignes suivantes à ce point, et Echap garde les lignes déjà entrées et abandonne celle en cours de saisie. Pour un paragraphe qui revient à la ligne selon une largeur, en un seul objet, utilisez <Command id="MTEXT" />.

La première ligne dit le style, la hauteur et la justification courants. La hauteur est celle que TEXTE partage avec <Command id="MTEXT" /> et <Command id="ATTDEF" />, gardée dans le dessin, et la commande TEXTE suivante la propose par défaut ; un style qui a sa propre hauteur saute l'invite de la hauteur. Entrée à l'invite du point de départ continue sous la dernière ligne écrite par TEXTE, sans redemander la hauteur ni l'angle. U défait toute l'exécution.

## Options

### Justify

Demande où le texte s'accroche à son point : <Keyword id="Left" /> (par défaut), <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" />, ou l'un de neuf points, haut, milieu et bas par gauche, centre et droite, tels que l'invite les liste. L'invite du point de départ demande ensuite le point que nomme la justification : pour milieu centre, le point milieu. Comme dans AutoCAD, les neuf sont aussi acceptés à la première invite sans y être listés, si bien que taper là les lettres de milieu centre demande directement le point milieu. La justification est gardée dans le dessin pour la commande TEXTE suivante.

### Style

Demande le nom du style de texte à rendre courant, Entrée gardant celui qui l'est. <Keyword id="?" /> liste les styles du dessin ; un nom que le dessin n'a pas est refusé et redemandé. Les styles se créent dans la palette qu'ouvre <Command id="STYLE" />.

## Missing

Les justifications Aligner et Fixé. Le <Keyword id="?" /> de <Keyword id="Style" /> liste tous les styles d'un coup, sans demander lesquels ni s'arrêter page par page. Le texte se tape dans la zone de saisie dynamique, pas avec un curseur de texte sur le dessin, et son contenu ne peut pas être retapé dans la palette Propriétés, à laquelle manquent aussi les lignes annotatif, facteur de largeur, angle oblique, texte renversé ou reflété. Un clic à l'intérieur du cadre d'un texte le sélectionne même hors de ses lettres, là où AutoCAD ne sélectionne rien.

## Questions

### Comment s'appelle la commande TEXT en français ?

TEXTE, avec les alias `T` et `TEXTDYN` : tapez-en un, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_TEXT`. Contrairement à AutoCAD en anglais, `T` lance ici TEXTE, le texte sur une ligne ; le texte multiligne est <Command id="MTEXT" />, alias `TT` ou `TX`.

### Comment aligner du texte dans AutoCAD ?

Choisissez <Keyword id="Justify" /> à la première invite, ou tapez-y les lettres de la justification, puis indiquez le point qu'elle nomme : milieu centre place le milieu de chaque ligne sur son point, comme une étiquette au milieu d'un cadre. Pour que le texte suive une ligne inclinée, tapez son angle à l'invite de rotation.

### Quelle est la différence entre TEXTE et TEXTMULT ?

TEXTE crée un objet par ligne, chacun déplacé, modifié et justifié à part, et ne revient jamais à la ligne. <Command id="MTEXT" /> crée un seul objet de paragraphes qui reviennent à la ligne selon la largeur d'un cadre, justifié comme un tout. Les deux partagent la hauteur de texte et les styles de texte.

### Comment modifier un texte dans AutoCAD ?

Double-cliquez dessus : <Command id="TEXTEDIT" /> l'ouvre pour que vous le retapiez, puis demande le texte suivant à modifier jusqu'à ce que vous appuyiez sur Echap. Sa hauteur et sa rotation sont des lignes de la palette Propriétés, et ses poignées le déplacent.
